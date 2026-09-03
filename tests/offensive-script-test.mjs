import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const html = read('public/playbook.html');
const css = read('public/offense-script.css');

assert.match(html, /5-PLAY LIONS PASSING SCHEME/, 'Offensive page must include the five-play script');
assert.match(html, /Run Gibbs/, 'Opening drive must start with Gibbs');
assert.match(html, /GUN TRIPS TE/, 'Playbook HQ must include Gun Trips TE');
assert.match(html, /GUN BUNCH/, 'Playbook HQ must include Gun Bunch');
assert.match(html, /COVER 2/, 'Playbook HQ must include a Cover 2 answer');
assert.match(html, /GUN EMPTY/, 'Playbook HQ must include the Gun Empty continuation');
assert.match(html, /3RD & SHORT/, 'Situation caller must include third and short');
assert.match(html, /2-MINUTE/, 'Situation caller must include two-minute offense');
assert.match(html, /FAVORITE THIS PLAY/, 'Play cards must include the favorite control');
assert.match(html, /mb5-playbook-favorites/, 'Favorites must persist locally');
assert.match(css, /@media\(max-width:650px\)/, 'Script must include phone-specific layout');

console.log('MB5 offensive Playbook HQ checks passed.');
