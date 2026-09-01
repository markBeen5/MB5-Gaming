import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const tracker = read('public/admin-game-results.js');
const config = read('public/config.js');
const admin = read('public/admin.html');
const schema = read('supabase/game_results.sql');

assert.match(admin, /config\.js\?v=20260901-results2/, 'Admin must fetch the new tracker configuration');
assert.match(config, /admin-game-results\.js\?v=20260901-2/, 'Admin must load the completed tracker without stale cache');
assert.match(tracker, /Opponent is required/, 'Tracker must reject missing opponents');
assert.match(tracker, /Enter both scores or leave both blank/, 'Tracker must require score pairs');
assert.match(tracker, /A win needs your score to be higher/, 'Tracker must validate win scores');
assert.match(tracker, /A loss needs your score to be lower/, 'Tracker must validate loss scores');
assert.match(tracker, /if\(saving\)return/, 'Tracker must block repeated submissions while saving');
assert.match(tracker, /data-edit-result/, 'Tracker must support correcting saved results');
assert.match(tracker, /CURRENT STREAK/, 'Tracker must display the synchronized streak');
assert.match(schema, /game_results_no_duplicate_minute/, 'Database must reject duplicate results from the same minute');
assert.match(schema, /alter column opponent set not null/, 'Database must require an opponent');
assert.match(schema, /game_results_score_check/, 'Database must validate scores against the result');
assert.match(schema, /recalculate_game_result_totals/, 'Database must synchronize record totals');
assert.match(schema, /streak = current_streak/, 'Database must synchronize the streak');
assert.match(schema, /to authenticated/, 'Tracker policies must target authenticated users');
assert.match(schema, /revoke all on function public\.refresh_stats_from_game_results/, 'Internal trigger must not be directly callable');

console.log('MB5 game result tracker regression checks passed.');
