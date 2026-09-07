import { createClient } from '@supabase/supabase-js';

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://wifkhdvmuiioisetzqfr.supabase.co';
const TWITCH_LOGIN = (process.env.TWITCH_LOGIN || 'markbeen5').toLowerCase();

for (const [name, value] of Object.entries({ TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, SUPABASE_SECRET_KEY })) {
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function getAppToken() {
  const body = new URLSearchParams({
    client_id: TWITCH_CLIENT_ID,
    client_secret: TWITCH_CLIENT_SECRET,
    grant_type: 'client_credentials'
  });
  const res = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  if (!res.ok) throw new Error(`Twitch token request failed: ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}

async function helix(path, token) {
  const res = await fetch(`https://api.twitch.tv/helix${path}`, {
    headers: {
      'Client-Id': TWITCH_CLIENT_ID,
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error(`Twitch Helix request failed: ${res.status} ${await res.text()}`);
  return res.json();
}

function isHalloweenText(value = '') {
  return /\bhalloween\b/i.test(value);
}

async function getAllBroadcasterClips(userId, token) {
  const clips = [];
  let cursor = '';
  const maxPages = 20;

  for (let page = 0; page < maxPages; page += 1) {
    const after = cursor ? `&after=${encodeURIComponent(cursor)}` : '';
    const payload = await helix(`/clips?broadcaster_id=${encodeURIComponent(userId)}&first=100${after}`, token);
    clips.push(...(payload.data || []));
    cursor = payload.pagination?.cursor || '';
    if (!cursor || !(payload.data || []).length) break;
  }

  return clips;
}

async function normalizeHalloweenOrder() {
  const { data: rows, error } = await supabase
    .from('clips')
    .select('id,published_at,created_at,game,category,platform,enabled')
    .eq('platform', 'Twitch')
    .eq('enabled', true);
  if (error) throw error;

  const halloweenRows = (rows || [])
    .filter(r => isHalloweenText(r.game || '') || isHalloweenText(r.category || ''))
    .sort((a, b) => new Date(b.published_at || b.created_at || 0) - new Date(a.published_at || a.created_at || 0));

  for (let i = 0; i < halloweenRows.length; i += 1) {
    const { error: updateError } = await supabase
      .from('clips')
      .update({ category: 'Halloween', featured: true, sort_order: i + 1 })
      .eq('id', halloweenRows[i].id);
    if (updateError) throw updateError;
  }

  return halloweenRows.length;
}

async function main() {
  const token = await getAppToken();

  const users = await helix(`/users?login=${encodeURIComponent(TWITCH_LOGIN)}`, token);
  const user = users.data?.[0];
  if (!user) throw new Error(`Twitch user not found: ${TWITCH_LOGIN}`);

  const clips = await getAllBroadcasterClips(user.id, token);
  if (!clips.length) {
    console.log('No Twitch clips found.');
    return;
  }

  const gameIds = [...new Set(clips.map(c => c.game_id).filter(Boolean))];
  const gameNames = new Map();
  for (let i = 0; i < gameIds.length; i += 100) {
    const ids = gameIds.slice(i, i + 100).map(id => `id=${encodeURIComponent(id)}`).join('&');
    const games = await helix(`/games?${ids}`, token);
    for (const g of games.data || []) gameNames.set(g.id, g.name || '');
  }

  const halloweenClips = clips.filter(c => {
    const gameName = gameNames.get(c.game_id) || '';
    return isHalloweenText(gameName) || isHalloweenText(c.title);
  });

  if (!halloweenClips.length) {
    console.log(`Scanned ${clips.length} Twitch clips; no Halloween clips found.`);
    return;
  }

  const urls = halloweenClips.map(c => c.url).filter(Boolean);
  const { data: existing, error: existingError } = await supabase
    .from('clips')
    .select('url')
    .in('url', urls);
  if (existingError) throw existingError;

  const existingUrls = new Set((existing || []).map(x => x.url));
  const newClips = halloweenClips.filter(c => !existingUrls.has(c.url));

  if (newClips.length) {
    const rows = newClips.map(c => {
      const gameName = gameNames.get(c.game_id) || 'Halloween: The Game';
      return {
        platform: 'Twitch',
        title: c.title || 'Halloween Highlight',
        url: c.url,
        thumbnail_url: c.thumbnail_url || null,
        description: `Twitch highlight from MarkBeen5${gameName ? ` • ${gameName}` : ''}`,
        published_at: c.created_at || null,
        game: isHalloweenText(gameName) ? gameName : 'Halloween: The Game',
        category: 'Halloween',
        featured: true,
        enabled: true,
        sort_order: 9999
      };
    });

    const { error: insertError } = await supabase.from('clips').insert(rows);
    if (insertError) throw insertError;
  }

  const orderedCount = await normalizeHalloweenOrder();

  const now = new Date().toISOString();
  const { error: connectionError } = await supabase
    .from('platform_connections')
    .upsert({
      platform: 'Twitch',
      enabled: true,
      channel_handle: `@${TWITCH_LOGIN}`,
      last_sync_at: now,
      metadata: {
        last_halloween_sync_at: now,
        scanned_count: clips.length,
        matched_count: halloweenClips.length,
        imported_count: newClips.length,
        ordered_count: orderedCount
      }
    }, { onConflict: 'platform' });
  if (connectionError) console.warn('Could not update platform_connections:', connectionError.message);

  console.log(`Halloween sync complete: scanned ${clips.length}, matched ${halloweenClips.length}, imported ${newClips.length}, ordered ${orderedCount}.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
