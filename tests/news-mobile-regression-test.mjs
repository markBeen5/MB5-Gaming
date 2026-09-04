import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const config = read('public/config.js');
const fix = read('public/news-mobile-fix.css');
const gta = read('public/gta6-hub.html');
const mobile = read('public/mobile-final.css');
const newsPage = read('public/news.html');

assert.match(config, /if \(home\)[\s\S]*community\.js/, 'Community content must load on the homepage');
assert.doesNotMatch(config, /else \{[\s\S]*js\('community\.js[^]*if \(home\)/, 'Community content must not load before the homepage guard');
assert.match(config, /news-mobile-fix\.css/, 'News pages must load the overlap fix');
assert.match(fix, /height:\s*220px/, 'Phone news images must have a fixed safe height');
assert.match(gta, /an-extended-look/, 'GTA VI hub must link to the official extended-look feature');
assert.match(mobile, /header#home\s*\{/, 'Full-height mobile hero rules must target the homepage only');
assert.doesNotMatch(mobile, /^\s*header\s*\{/m, 'Shared mobile styles must not stretch fixed page headers');
assert.match(newsPage, /news-mobile-fix\.css\?v=20260901-3/, 'News must load the image-height fix directly with a fresh version');
assert.match(newsPage, /config\.js\?v=20260901-news3/, 'News must bypass stale mobile configuration');
assert.match(newsPage, /href="gta6-hub\.html"/, 'News must link to the current GTA VI hub');
assert.match(gta, /@media\(max-width:760px\)/, 'Current GTA VI hub must include mobile layout rules');

console.log('MB5 news mobile regression checks passed.');
