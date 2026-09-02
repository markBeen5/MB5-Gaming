import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const html = read('public/playbook.html');
const css = read('public/offense-script.css');

assert.match(html, /5-PLAY LIONS PASSING SCHEME/, 'Offensive page must include the five-play script');
assert.match(html, /Run Gibbs/, 'Opening drive must start with Gibbs');
assert.match(html, /GUN TRIPS TE/, 'Script must include Gun Trips TE');
assert.match(html, /GUN BUNCH/, 'Script must include Gun Bunch');
assert.match(html, /COVER 2 KILLER/, 'Script must include the Cover 2 answer');
assert.match(html, /SINGLEBACK PLAY ACTION/, 'Script must include play action');
assert.match(html, /GUN EMPTY/, 'Script must combine the Gun Empty continuation');
assert.match(html, /Crossers, slants and drags/, 'Combined Step 5 must include the man answer');
assert.match(html, /Seam, dig and curl/, 'Combined Step 5 must include the Cover 3 answer');
assert.match(html, /Middle and corner/, 'Combined Step 5 must include the Cover 2 answer');
assert.match(css, /@media\(max-width:650px\)/, 'Script must include phone-specific layout');
assert.match(css, /coverage-answers\{grid-template-columns:1fr\}/, 'Step 5 answers must stack on phones');

console.log('MB5 offensive game script checks passed.');
