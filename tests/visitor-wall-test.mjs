import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const index = read('public/index.html');
const adminHtml = read('public/admin.html');
const visitor = read('public/visitor-wall.js');
const admin = read('public/admin-visitor-wall.js');
const sql = read('supabase/visitor_wall.sql');

assert.match(index, /id="visitor-wall"/, 'Home page must contain the visitor wall');
assert.match(index, /id="visitorForm"/, 'Visitor wall must provide a check-in form');
assert.match(index, /visitor-wall\.css\?v=20260902-1/, 'Home page must load visitor wall styles');
assert.match(index, /visitor-wall\.js\?v=20260902-1/, 'Home page must load visitor wall behavior');
assert.match(adminHtml, /admin-visitor-wall\.js\?v=20260902-1/, 'Admin must load visitor moderation controls');
assert.match(visitor, /\.eq\('approved', true\)/, 'Public wall must request approved entries only');
assert.match(visitor, /slice\(0, 24\)/, 'Display names must be length limited in the client');
assert.match(visitor, /slice\(0, 180\)/, 'Visitor messages must be length limited in the client');
assert.match(admin, /APPROVE/, 'Admin must be able to approve visitor check-ins');
assert.match(admin, /DELETE/, 'Admin must be able to delete visitor check-ins');
assert.match(sql, /enable row level security/i, 'Visitor table must enable RLS');
assert.match(sql, /to anon[\s\S]*approved = true/, 'Anonymous reads must be limited to approved rows');
assert.match(sql, /grant insert \(display_name, message, visitor_token\)/i, 'Anonymous inserts must use column-level grants');
assert.doesNotMatch(sql, /grant (?:all|update|delete)[^;]* to anon/i, 'Anonymous visitors must not receive write-management privileges');

console.log('MB5 visitor wall checks passed.');
