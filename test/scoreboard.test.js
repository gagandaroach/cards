import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderScoreboard } from '../src/scoreboard.js';

const count = (html, re) => (html.match(re) ?? []).length;

test('7 blank players, 10 rounds', () => {
  const html = renderScoreboard({ players: 7, rows: 10 });
  assert.equal(count(html, /<th class="player">/g), 7);
  assert.equal(count(html, /<tbody>[\s\S]*<\/tbody>/g), 1);
  assert.equal(count(html.match(/<tbody>[\s\S]*<\/tbody>/)[0], /<tr>/g), 10);
  assert.match(html, /Total/);
  assert.match(html, /landscape/);
});

test('named players are escaped', () => {
  const html = renderScoreboard({ players: ['Mom', 'Dad & Co'], rows: 3 });
  assert.match(html, /Dad &amp; Co/);
  assert.match(html, /portrait/);
});

test('india theme adds stripes and watermark', () => {
  const html = renderScoreboard({ theme: 'india' });
  assert.match(html, /class="stripes"/);
  assert.match(html, /#ff9933/);
  assert.match(html, /class="watermark"/);
  assert.doesNotMatch(renderScoreboard({}), /class="watermark"/);
});

test('rejects bad input', () => {
  assert.throws(() => renderScoreboard({ players: 0 }));
  assert.throws(() => renderScoreboard({ rows: 0 }));
  assert.throws(() => renderScoreboard({ theme: 'neon' }));
});
