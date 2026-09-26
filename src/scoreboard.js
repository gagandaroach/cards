// Renders a printable scoreboard as a standalone HTML page.
// Players are columns, rounds (1..N) are rows, with a Total row at the bottom.

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/**
 * Normalize the players argument: a number gives that many blank columns
 * (names written in by hand), an array gives named columns.
 */
export function normalizePlayers(players) {
  if (typeof players === 'number') return Array.from({ length: players }, () => '');
  if (Array.isArray(players)) return players.map((p) => String(p).trim());
  throw new TypeError('players must be a number or an array of names');
}

export function renderScoreboard({ title = 'Scoreboard', players = 7, rows = 10, showTotal = true } = {}) {
  const names = normalizePlayers(players);
  if (names.length < 1 || names.length > 12) throw new RangeError('players must be between 1 and 12');
  if (!Number.isInteger(rows) || rows < 1 || rows > 30) throw new RangeError('rows must be an integer between 1 and 30');

  // More players → landscape. Big rows either way so it's easy to write in.
  const landscape = names.length > 4;
  const headerCells = names.map((n) => `<th class="player">${escapeHtml(n)}</th>`).join('');
  const blankCells = names.map(() => '<td></td>').join('');
  const bodyRows = Array.from({ length: rows }, (_, i) => `<tr><th class="round">${i + 1}</th>${blankCells}</tr>`).join('\n        ');
  const totalRow = showTotal ? `<tfoot><tr><th class="round">Total</th>${blankCells}</tr></tfoot>` : '';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <style>
    @page { size: letter ${landscape ? 'landscape' : 'portrait'}; margin: 0.5in; }
    * { box-sizing: border-box; }
    html, body { margin: 0; background: #fff; color: #111; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { font-family: Georgia, 'Times New Roman', serif; padding: 0.5in; }
    @media print { body { padding: 0; } .hint { display: none; } }
    header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.2in; }
    h1 { font-size: 28pt; margin: 0; }
    .date { font-size: 14pt; }
    .date span { display: inline-block; width: 2.2in; border-bottom: 1.5px solid #111; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    th, td { border: 1.5px solid #111; text-align: center; }
    thead th { height: 0.65in; font-size: 16pt; background: #f1f1f1; }
    th.round { width: 0.9in; font-size: 16pt; background: #f1f1f1; }
    tbody td, tbody th { height: ${rows > 15 ? '0.35in' : '0.5in'}; }
    tfoot th, tfoot td { height: 0.6in; border-top: 4px double #111; }
    th.corner { font-size: 12pt; }
    .hint { font-family: system-ui, sans-serif; color: #666; font-size: 11pt; margin-top: 0.2in; }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(title)}</h1>
    <div class="date">Date: <span></span></div>
  </header>
  <table>
    <thead><tr><th class="round corner">Round</th>${headerCells}</tr></thead>
    <tbody>
        ${bodyRows}
    </tbody>
    ${totalRow}
  </table>
  <p class="hint">Print with Ctrl/⌘ + P. ${landscape ? 'Landscape' : 'Portrait'} is set automatically.</p>
</body>
</html>
`;
}
