import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const index = read('public/index.html');
const news = read('public/news.html');
const sitemap = read('public/sitemap.xml');
const config = read('public/config.js');
const resultsSql = read('supabase/game_results.sql');

assert.match(index, /href="news\.html">NEWS<\/a>/, 'Home navigation must include NEWS');
assert.match(news, /id="newsGrid"/, 'News page must provide the feed container');
assert.match(sitemap, /https:\/\/markbeen5\.com\/news\.html/, 'Sitemap must include the news page');
assert.doesNotMatch(config, /site-news-nav\.js/, 'Removed navigation injector must not be loaded');
assert.match(config, /news-responsive\.css/, 'News page must load its responsive heading fix');
assert.match(resultsSql, /game_results_refresh_stats/, 'Tracker schema must recalculate totals');

console.log('MB5 smoke checks passed.');
