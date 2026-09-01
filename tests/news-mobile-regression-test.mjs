import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const config = read('public/config.js');
const fix = read('public/news-mobile-fix.css');
const gta = read('public/gta6.html');
const mobile = read('public/mobile-final.css');

assert.match(config, /if \(home\)[\s\S]*community\.js/, 'Community content must load on the homepage');
assert.doesNotMatch(config, /else \{[\s\S]*js\('community\.js[^]*if \(home\)/, 'Community content must not load before the homepage guard');
assert.match(config, /news-mobile-fix\.css/, 'News pages must load the overlap fix');
assert.match(fix, /height:\s*220px/, 'Phone news images must have a fixed safe height');
assert.match(gta, /extended-look-now-playing/, 'GTA VI hub must link to the official now-playing feature');
assert.match(mobile, /header#home\s*\{/, 'Full-height mobile hero rules must target the homepage only');
assert.doesNotMatch(mobile, /^\s*header\s*\{/m, 'Shared mobile styles must not stretch fixed page headers');

console.log('MB5 news mobile regression checks passed.');
