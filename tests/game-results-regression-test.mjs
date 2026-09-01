import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const tracker = read('public/admin-game-results.js');
const scannerSource = read('public/game-result-scan.js');
const config = read('public/config.js');
const admin = read('public/admin.html');
const schema = read('supabase/game_results.sql');

assert.match(admin, /config\.js\?v=20260901-results3/, 'Admin must fetch the new tracker configuration');
assert.match(config, /game-result-scan\.js\?v=20260901-1/, 'Admin must load the screenshot reader');
assert.match(config, /admin-game-results\.js\?v=20260901-3/, 'Admin must load the completed tracker without stale cache');
assert.match(scannerSource, /tesseract\.js@7\.0\.0/, 'OCR dependency must be pinned to an exact version');
assert.match(tracker, /Nothing is saved until you tap ADD RESULT/, 'Scans must require review before saving');
assert.match(tracker, /Opponent is required/, 'Tracker must reject missing opponents');
assert.match(tracker, /Enter both scores or leave both blank/, 'Tracker must require score pairs');
assert.match(tracker, /A win needs your score to be higher/, 'Tracker must validate win scores');
assert.match(tracker, /A loss needs your score to be lower/, 'Tracker must validate loss scores');
assert.match(tracker, /if\(saving\)return/, 'Tracker must block repeated submissions while saving');
assert.match(tracker, /data-edit-result/, 'Tracker must support correcting saved results');
assert.match(tracker, /CURRENT STREAK/, 'Tracker must display the synchronized streak');
assert.match(schema, /game_results_no_exact_duplicate/, 'Database must reject exact duplicate results');
assert.doesNotMatch(schema, /date_trunc\('minute', played_at/, 'Back-to-back games must not be treated as duplicates');
assert.match(schema, /alter column opponent set not null/, 'Database must require an opponent');
assert.match(schema, /game_results_score_check/, 'Database must validate scores against the result');
assert.match(schema, /recalculate_game_result_totals/, 'Database must synchronize record totals');
assert.match(schema, /streak = current_streak/, 'Database must synchronize the streak');
assert.match(schema, /to authenticated/, 'Tracker policies must target authenticated users');
assert.match(schema, /revoke all on function public\.refresh_stats_from_game_results/, 'Internal trigger must not be directly callable');

const require = createRequire(import.meta.url);
const scanner = require('../public/game-result-scan.js');
const sample = scanner.parseText('DET 20 < 14 NE OT markBeen5 Foreverwavy813');
assert.equal(sample.opponent, 'Foreverwavy813', 'Scanner must select the opponent tag instead of the owner tag');
assert.equal(sample.pointsFor, 20, 'Scanner must read the owner score');
assert.equal(sample.pointsAgainst, 14, 'Scanner must read the opponent score');
assert.equal(sample.result, 'W', 'Scanner must calculate a win from the score');
assert.equal(sample.overtime, true, 'Scanner must identify overtime');
const blurry = scanner.parseText('Clip Creator Engagement DET 20 « 14 NE OT');
assert.equal(blurry.opponent, '', 'Scanner must not invent an opponent from ordinary screen text');
assert.equal(blurry.pointsFor, 20, 'Scanner must recognize the separator used in the uploaded photo');

console.log('MB5 game result tracker regression checks passed.');
