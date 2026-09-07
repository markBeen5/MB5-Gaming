import { createClient } from '@supabase/supabase-js';

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://wifkhdvmuiioisetzqfr.supabase.co';
const TWITCH_LOGIN = (process.env.TWITCH_LOGIN || 'markbeen5').toLowerCase();

for (const [name, value] of Object.entries({TWITCH_CLIENT_ID,TWITCH_CLIENT_SECRET,SUPABASE_SECRET_KEY})) {
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

function isHalloweenText(value='') {
  return /\bhalloween\b/i.test(value);
}

async function main() {
  const token = await getAppToken();

  const users = await helix(`/users?login=${encodeURIComponent(TWITCH_LOGIN)}`, token);
  const user = users.data?.[0];
  if (!user) throw new Error(`Twitch user not found: ${TWITCH_LOGIN}`);

  const clipsPayload = await helix(`/clips?broadcaster_id=${encodeURIComponent(user.id)}&first=100`, token);
  const clips = clipsPayload.data || [];
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
    console.log('No Halloween clips found in the latest Twitch clips.');
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
  if (!newClips.length) {
    console.log(`Halloween sync complete: ${halloweenClips.length} matched, 0 new.`);
    return;
  }

  const { data: maxOrderRows, error: orderError } = await supabase
    .from('clips')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1);
  if (orderError) throw orderError;
  let nextOrder = Number(maxOrderRows?.[0]?.sort_order ?? 0) + 10;

  const rows = newClips
    .sort((a,b) => new Date(a.created_at) - new Date(b.created_at))
    .map(c => {
      const gameName = gameNames.get(c.game_id) || 'Halloween: The Game';
      const row = {
        platform: 'Twitch',
        title: c.title || 'Halloween Highlight',
        url: c.url,
        thumbnail_url: c.thumbnail_url || null,
        description: `Twitch highlight from MarkBeen5${gameName ? ` • ${gameName}` : ''}`,
        published_at: c.created_at || null,
        game: isHalloweenText(gameName) ? gameName : 'Halloween: The Game',
        category: 'Highlight',
        featured: false,
        enabled: true,
        sort_order: nextOrder
      };
      nextOrder += 10;
      return row;
    });

  const { error: insertError } = await supabase.from('clips').insert(rows);
  if (insertError) throw insertError;

  const now = new Date().toISOString();
  const { error: connectionError } = await supabase
    .from('platform_connections')
    .upsert({
      platform: 'Twitch',
      enabled: true,
      channel_handle: `@${TWITCH_LOGIN}`,
      last_sync_at: now,
      metadata: { last_halloween_sync_at: now, imported_count: rows.length }
    }, { onConflict: 'platform' });
  if (connectionError) console.warn('Could not update platform_connections:', connectionError.message);

  console.log(`Halloween sync complete: ${halloweenClips.length} matched, ${rows.length} new clip(s) added.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
