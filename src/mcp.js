#!/usr/bin/env node
// MCP server exposing scoreboard generation as a tool.
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { homedir } from 'node:os';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { renderScoreboard, THEMES } from './scoreboard.js';

const OUT_DIR = process.env.CARDS_OUT_DIR ?? join(homedir(), 'cards-printables');

const server = new McpServer({ name: 'cards', version: '0.1.0' });

server.registerTool(
  'create_scoreboard',
  {
    title: 'Create scoreboard',
    description:
      'Create a printable card-game scoreboard. Players are columns, rounds 1..N are rows, with a Total row. ' +
      'Pass player names, or a number of players to leave the name boxes blank for handwriting. ' +
      'Writes an HTML file ready to print and returns its path.',
    inputSchema: {
      players: z
        .union([z.array(z.string()).min(1).max(12), z.number().int().min(1).max(12)])
        .default(7)
        .describe('Player names, or a count of blank player columns'),
      rows: z.number().int().min(1).max(30).default(10).describe('Number of rounds (rows)'),
      title: z.string().default('Scoreboard').describe('Heading printed at the top, e.g. the game name'),
      showTotal: z.boolean().default(true).describe('Include a Total row at the bottom'),
      theme: z
        .enum(Object.keys(THEMES))
        .default('classic')
        .describe('Color theme: classic (black and grey) or india (saffron, white and green with a chakra watermark)'),
      filename: z.string().optional().describe('Output file name (defaults to a slug of the title)'),
    },
  },
  async ({ players, rows, title, showTotal, theme, filename }) => {
    const html = renderScoreboard({ players, rows, title, showTotal, theme });
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'scoreboard';
    const name = (filename ?? slug).replace(/[/\\]/g, '_').replace(/\.html$/, '') + '.html';
    mkdirSync(OUT_DIR, { recursive: true });
    const path = resolve(OUT_DIR, name);
    writeFileSync(path, html);
    return { content: [{ type: 'text', text: `Scoreboard written to ${path} — open it in a browser and print.` }] };
  },
);

await server.connect(new StdioServerTransport());
