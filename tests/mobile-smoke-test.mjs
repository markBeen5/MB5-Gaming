import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const config = read('public/config.js');
const shared = read('public/mobile-final.css');
const admin = read('public/admin-mobile.css');
const quickNav = read('public/mobile-final.js');
const playbook = read('public/playbook.html');

assert.match(config, /mobile-final\.css/, 'Public pages must load the final mobile stylesheet');
assert.match(config, /admin-mobile\.css/, 'Admin must load its mobile stylesheet');
assert.match(config, /mobile-final\.js/, 'Homepage must load mobile enhancements');
assert.match(shared, /max-width:\s*800px/, 'Shared mobile rules must target phone/tablet widths');
assert.match(shared, /grid-template-columns:\s*repeat\(4/, 'Quick navigation must support four destinations');
assert.match(shared, /news-links a:nth-child\(n\+4\)/, 'Hidden News navigation links must be restored on mobile');
assert.match(shared, /min-height:\s*44px/g, 'Interactive controls must preserve touch-sized targets');
assert.match(admin, /grid-template-columns:\s*repeat\(2/, 'Admin status cards must remain compact on phones');
assert.match(quickNav, /href = 'news\.html'/, 'Mobile quick navigation must include News');
assert.match(playbook, /mobile-final\.css\?v=20260901-1/, 'Playbook must load final mobile overrides');

console.log('MB5 mobile smoke checks passed.');
