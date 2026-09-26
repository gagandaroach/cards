// Renders a printable scoreboard as a standalone HTML page.
// Players are columns, rounds (1..N) are rows, with a Total row at the bottom.

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Colors are kept to headers, edges and a faint watermark so writing cells stay white and ink use stays low.
export const THEMES = {
  classic: {
    ink: '#111',
    title: '#111',
    border: '#111',
    headBg: '#f1f1f1',
    headInk: '#111',
    roundBg: '#f1f1f1',
    totalBg: '#f1f1f1',
    totalInk: '#111',
    stripes: null,
    watermark: null,
  },
  india: {
    ink: '#1b1b3a',
    title: '#000080',
    border: '#000080',
    headBg: '#ffd9b0',
    headInk: '#000080',
    roundBg: '#fff3e6',
    totalBg: '#d7eed2',
    totalInk: '#0b5d04',
    stripes: ['#ff9933', '#ffffff', '#138808'],
    watermark: '#000080',
  },
};

/**
 * Normalize the players argument: a number gives that many blank columns
 * (names written in by hand), an array gives named columns.
 */
export function normalizePlayers(players) {
  if (typeof players === 'number') return Array.from({ length: players }, () => '');
  if (Array.isArray(players)) return players.map((p) => String(p).trim());
  throw new TypeError('players must be a number or an array of names');
}

// 24-spoke wheel in the style of the Ashoka Chakra, used as a faint watermark.
function chakraSvg(color) {
  const spokes = Array.from({ length: 24 }, (_, i) => {
    const a = (i * Math.PI) / 12;
    return `<line x1="50" y1="50" x2="${(50 + 44 * Math.cos(a)).toFixed(2)}" y2="${(50 + 44 * Math.sin(a)).toFixed(2)}"/>`;
  }).join('');
  return `<svg class="watermark" viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="${color}" stroke-width="1.6">
    <circle cx="50" cy="50" r="46" stroke-width="3"/>${spokes}<circle cx="50" cy="50" r="6" fill="${color}"/></g></svg>`;
}

export function renderScoreboard({ title = 'Scoreboard', players = 7, rows = 10, showTotal = true, theme = 'classic' } = {}) {
  const names = normalizePlayers(players);
  if (names.length < 1 || names.length > 12) throw new RangeError('players must be between 1 and 12');
  if (!Number.isInteger(rows) || rows < 1 || rows > 30) throw new RangeError('rows must be an integer between 1 and 30');
  const t = THEMES[theme];
  if (!t) throw new RangeError(`theme must be one of: ${Object.keys(THEMES).join(', ')}`);

  // More players → landscape. Big rows either way so it's easy to write in.
  const landscape = names.length > 4;
  const stripeHeight = t.stripes ? 0.24 : 0;
  // Fit every round on one page: usable height minus stripes, title, header row and Total row.
  const bodyHeight = (landscape ? 7.5 : 10) - (stripeHeight ? stripeHeight + 0.12 : 0) - 0.75 - 0.65 - (showTotal ? 0.6 : 0) - 0.1;
  const rowHeight = Math.min(0.5, bodyHeight / rows).toFixed(2);
  const headerCells = names.map((n) => `<th class="player">${escapeHtml(n)}</th>`).join('');
  const blankCells = names.map(() => '<td></td>').join('');
  const bodyRows = Array.from({ length: rows }, (_, i) => `<tr><th class="round">${i + 1}</th>${blankCells}</tr>`).join('\n        ');
  const totalRow = showTotal ? `<tfoot><tr><th class="round">Total</th>${blankCells}</tr></tfoot>` : '';
  const stripes = t.stripes ? `<div class="stripes">${t.stripes.map((c) => `<i style="background:${c}"></i>`).join('')}</div>` : '';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <style>
    @page { size: letter ${landscape ? 'landscape' : 'portrait'}; margin: 0.5in; }
    * { box-sizing: border-box; }
    html, body { margin: 0; background: #fff; color: ${t.ink}; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { font-family: Georgia, 'Times New Roman', serif; padding: 0.5in; }
    @media print { body { padding: 0; } .hint { display: none; } }
    .stripes { display: flex; flex-direction: column; height: ${stripeHeight}in; border: 1px solid ${t.border}; margin-bottom: 0.12in; }
    .stripes i { flex: 1; }
    header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.2in; }
    h1 { font-size: 28pt; margin: 0; color: ${t.title}; }
    .date { font-size: 14pt; }
    .date span { display: inline-block; width: 2.2in; border-bottom: 1.5px solid ${t.border}; }
    .sheet { position: relative; isolation: isolate; }
    .watermark { position: absolute; z-index: -1; inset: 0; margin: auto; width: 4.5in; height: 4.5in; opacity: 0.08; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    th, td { border: 1.5px solid ${t.border}; text-align: center; }
    thead th { height: 0.65in; font-size: 16pt; background: ${t.headBg}; color: ${t.headInk}; }
    th.round { width: 0.9in; font-size: 16pt; background: ${t.roundBg}; }
    thead th.round { background: ${t.headBg}; }
    tbody td, tbody th { height: ${rowHeight}in; }
    tfoot th, tfoot td { height: 0.6in; border-top: 4px double ${t.border}; background: ${t.totalBg}; }
    tfoot th.round { background: ${t.totalBg}; color: ${t.totalInk}; }
    th.corner { font-size: 12pt; }
    .hint { font-family: system-ui, sans-serif; color: #666; font-size: 11pt; margin-top: 0.2in; }
  </style>
</head>
<body>
  ${stripes}
  <header>
    <h1>${escapeHtml(title)}</h1>
    <div class="date">Date: <span></span></div>
  </header>
  <div class="sheet">
    ${t.watermark ? chakraSvg(t.watermark) : ''}
    <table>
      <thead><tr><th class="round corner">Round</th>${headerCells}</tr></thead>
      <tbody>
        ${bodyRows}
      </tbody>
      ${totalRow}
    </table>
  </div>
  <p class="hint">Print with Ctrl/⌘ + P. ${landscape ? 'Landscape' : 'Portrait'} is set automatically.</p>
</body>
</html>
`;
}
