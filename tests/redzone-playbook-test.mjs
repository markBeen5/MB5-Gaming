import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const html = read('public/playbook.html');
const css = read('public/redzone.css');

assert.match(html, /RED ZONE \+ GOAL LINE/, 'Offensive page must include the red-zone and goal-line section');
assert.match(html, /20–11 YDS/, 'Red-zone ladder must include the 20–11 yard range');
assert.match(html, /Z Spot \/ Bench HB Angle/, 'Red-zone ladder must include Z Spot and Bench HB Angle');
assert.match(html, /10–6 YDS/, 'Red-zone ladder must include the 10–6 yard range');
assert.match(html, /Z Mesh \/ RPO Alert Bubble/, 'Red-zone ladder must include Z Mesh and RPO Alert Bubble');
assert.match(html, /5–2 YDS/, 'Goal-line ladder must include the 5–2 yard range');
assert.match(html, /HB Power G \/ PA Spot/, 'Goal-line ladder must include HB Power G and PA Spot');
assert.match(html, /1 YD OR INCHES/, 'Goal-line ladder must include the 1-yard-or-inches range');
assert.match(html, /QB Sneak \/ HB Dive/, 'Goal-line ladder must include QB Sneak and HB Dive');
assert.match(html, /data-situation="red"/, 'Situation caller must include a red-zone option');
assert.match(html, /data-situation="goal"/, 'Situation caller must include a goal-line option');
assert.match(html, /red:\['Z SPOT \/ BENCH HB ANGLE'/, 'Red-zone situation call must include the current first call');
assert.match(html, /goal:\['HB POWER G'/, 'Goal-line situation call must include the current first call');
assert.match(css, /@media \(max-width: 650px\)/, 'Red-zone section must include phone-specific styles');
assert.match(css, /\.redzone-groups \{ grid-template-columns: 1fr; \}/, 'Red-zone call groups must stack on phones');

console.log('MB5 red-zone and goal-line checks passed.');
