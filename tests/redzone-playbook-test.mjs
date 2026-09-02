import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const html = read('public/playbook.html');
const css = read('public/redzone.css');

assert.match(html, /RED ZONE \+ GOAL LINE CALL SHEET/, 'Offensive page must include the situational call sheet');
assert.match(html, /Z SPOT GOALLINE/, 'Red-zone package must include Z Spot Goalline');
assert.match(html, /Z MESH GOALLINE/, 'Red-zone package must include Z Mesh Goalline');
assert.match(html, /Y FLAT GOALLINE/, 'Red-zone package must include Y Flat Goalline');
assert.match(html, /BENCH HB ANGLE/, 'Red-zone package must include Bench HB Angle');
assert.match(html, /RPO ALERT BUBBLE/, 'Red-zone package must include RPO Alert Bubble');
assert.match(html, /HB POWER G/, 'Goal-line package must include HB Power G');
assert.match(html, /HB DIVE/, 'Goal-line package must include HB Dive');
assert.match(html, /QB SNEAK/, 'Goal-line package must include QB Sneak');
assert.match(html, /PA SPOT/, 'Goal-line package must include PA Spot');
assert.match(html, /PA WAGGLE/, 'Goal-line package must include PA Waggle');
assert.match(html, /STRONG TOSS/, 'Goal-line package must include Strong Toss');
assert.match(html, /Run until the defense adds a box defender/, 'Call sheet must include the MB5 decision rule');
assert.match(css, /@media \(max-width: 650px\)/, 'Call sheet must include phone-specific styles');
assert.match(css, /\.redzone-groups \{ grid-template-columns: 1fr; \}/, 'Call groups must stack on phones');

console.log('MB5 red-zone and goal-line checks passed.');
