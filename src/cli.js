#!/usr/bin/env node
// Usage:
//   cards --players 7 --rows 10
//   cards --players "Mom,Dad,Asha,Raj" --rows 10 --title "Rummy Night" --out rummy.html
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { parseArgs } from 'node:util';
import { renderScoreboard } from './scoreboard.js';

const { values } = parseArgs({
  options: {
    players: { type: 'string', default: '7' },
    rows: { type: 'string', default: '10' },
    title: { type: 'string', default: 'Scoreboard' },
    out: { type: 'string', default: 'out/scoreboard.html' },
    'no-total': { type: 'boolean', default: false },
  },
});

// "7" → 7 blank columns; "Mom,Dad" → named columns.
const players = /^\d+$/.test(values.players) ? Number(values.players) : values.players.split(',');

const html = renderScoreboard({
  title: values.title,
  players,
  rows: Number(values.rows),
  showTotal: !values['no-total'],
});

mkdirSync(dirname(values.out), { recursive: true });
writeFileSync(values.out, html);
console.log(`Wrote ${values.out}`);
