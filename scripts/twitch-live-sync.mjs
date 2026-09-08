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
  const json = await res.json();
  if (!res.ok || !json.access_token) throw new Error(`Twitch token request failed: ${res.status} ${json.message || ''}`);
  return json.access_token;
}

async function helix(path, token) {
  const res = await fetch(`https://api.twitch.tv/helix${path}`, {
    headers: {
      'Client-Id': TWITCH_CLIENT_ID,
      'Authorization': `Bearer ${token}`
    }
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Twitch Helix request failed: ${res.status} ${json.message || ''}`);
  return json;
}

async function main() {
  const token = await getAppToken();
  const users = await helix(`/users?login=${encodeURIComponent(TWITCH_LOGIN)}`, token);
  const user = users.data?.[0];
  if (!user) throw new Error(`Twitch user not found: ${TWITCH_LOGIN}`);

  const streams = await helix(`/streams?user_id=${encodeURIComponent(user.id)}`, token);
  const stream = streams.data?.[0] || null;
  const live = !!stream;
  const now = new Date().toISOString();
  const payload = {
    enabled: live,
    title: live ? (stream.title || 'MarkBeen5 is live') : 'MarkBeen5 is offline',
    description: live ? `${stream.game_name || 'Twitch'} • ${Number(stream.viewer_count || 0).toLocaleString()} viewers` : 'Follow for the next stream.',
    url: `https://www.twitch.tv/${TWITCH_LOGIN}`,
    game: live ? (stream.game_name || 'Twitch') : '—',
    viewers: live ? Number(stream.viewer_count || 0) : 0,
    updated_at: now
  };

  const { data: existing, error: readError } = await supabase.from('live_status').select('id').limit(1);
  if (readError) throw readError;
  if (existing?.[0]?.id) {
    const { error } = await supabase.from('live_status').update(payload).eq('id', existing[0].id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('live_status').insert(payload);
    if (error) throw error;
  }

  await supabase.from('platform_connections').update({
    enabled: true,
    last_sync_at: now,
    metadata: {
      user_id: user.id,
      display_name: user.display_name,
      live,
      game: payload.game,
      title: payload.title,
      viewers: payload.viewers,
      source: 'github-actions-live-sync'
    }
  }).eq('platform', 'twitch');

  console.log(`Twitch live sync: ${live ? 'LIVE' : 'OFFLINE'}${live ? ` • ${payload.game} • ${payload.viewers} viewers` : ''}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
