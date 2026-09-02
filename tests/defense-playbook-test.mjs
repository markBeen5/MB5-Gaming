import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const html = read('public/defense.html');
const data = read('public/defense-data.js');
const script = read('public/defense.js');
const css = read('public/defense.css');
const offense = read('public/playbook.html');
const home = read('public/index.html');
const admin = read('public/admin.html');
const sitemap = read('public/sitemap.xml');
const sql = read('supabase/defensive_playbook.sql');

assert.match(html, /MB5 DEFENSIVE PLAYBOOK/, 'Defense page must have a dedicated hero');
assert.match(html, /data-filter="nickel-3-3-over"/, 'Defense page must filter 3-3 Over');
assert.match(html, /data-filter="nickel-3-3-dbl-mug"/, 'Defense page must filter 3-3 Dbl Mug');
assert.match(html, /data-filter="dime-2-3"/, 'Defense page must filter Dime 2-3');
assert.match(data, /Cover 3 Buzz Match/, 'Starter calls must include Cover 3 Buzz Match');
assert.match(data, /Over Storm Brave/, 'Starter calls must include Over Storm Brave');
assert.match(data, /Mid Blitz/, 'Starter calls must include Mid Blitz');
assert.match(data, /Field Stunt 3/, 'Starter calls must include Field Stunt 3');
assert.match(script, /\.eq\('type', 'Defense'\)/, 'Public defense page must request only defensive plays');
assert.match(script, /\.eq\('enabled', true\)/, 'Public defense page must request only enabled plays');
assert.match(css, /grid-template-columns:1fr/, 'Defense page must collapse to one column on phones');
assert.match(offense, /href="defense\.html">DEFENSE/, 'Offensive playbook must link to defense');
assert.match(home, /href="defense\.html">OPEN DEFENSIVE PLAYBOOK/, 'Homepage must link to defense');
assert.match(admin, /id="playFormation"/, 'Admin must capture the defensive formation');
assert.match(admin, /id="playCallType"/, 'Admin must capture the defensive call group');
assert.match(admin, /id="playEnabled"/, 'Admin must support hiding a defensive call');
assert.match(sitemap, /https:\/\/markbeen5\.com\/defense\.html/, 'Sitemap must include the defense page');
assert.match(sql, /plays_admin_read/, 'Admin must retain access to hidden plays');
assert.match(sql, /to anon[\s\S]*enabled = true/, 'Anonymous reads must be limited to enabled plays');
assert.ok(existsSync(new URL('../public/defense-33-over.jpg', import.meta.url)), '3-3 Over screenshot must be included');
assert.ok(existsSync(new URL('../public/defense-33-dbl-mug.jpg', import.meta.url)), '3-3 Dbl Mug screenshot must be included');
assert.ok(existsSync(new URL('../public/defense-dime-23.jpg', import.meta.url)), 'Dime 2-3 screenshot must be included');

console.log('MB5 defensive playbook checks passed.');
