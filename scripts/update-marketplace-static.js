const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const outPath = path.join(root, 'marketplace.html');
const runtimeScriptPath = path.join(__dirname, 'marketplace-static-runtime.js');

const DEFAULT_SOURCE_FILE = 'marketplace.backup-20260522-171007.html';
const LATEST_ALIAS_FILE = 'marketplace.backup-latest.html';

function parseSourceArg(argv) {
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--source' || token === '-s') {
      return argv[i + 1] || '';
    }
    if (token.startsWith('--source=')) {
      return token.slice('--source='.length);
    }
  }
  return '';
}

function listBackupFiles() {
  return fs.readdirSync(root)
    .filter((name) => /^marketplace\.backup-.*\.html$/i.test(name));
}

function resolveLatestBackupFile() {
  if (fs.existsSync(path.join(root, LATEST_ALIAS_FILE))) {
    return LATEST_ALIAS_FILE;
  }

  const candidates = listBackupFiles()
    .filter((name) => name !== LATEST_ALIAS_FILE)
    .sort((a, b) => b.localeCompare(a));

  if (!candidates.length) {
    throw new Error('No marketplace backup files found.');
  }

  return candidates[0];
}

function normalizeSourceInput(input) {
  const raw = String(input || '').trim();
  if (!raw) return DEFAULT_SOURCE_FILE;

  if (raw.toLowerCase() === 'latest') {
    return resolveLatestBackupFile();
  }

  if (/^\d{8}-\d{6}$/.test(raw)) {
    return `marketplace.backup-${raw}.html`;
  }

  if (/^marketplace\.backup-.*\.html$/i.test(raw)) {
    return raw;
  }

  if (/\.html$/i.test(raw)) {
    return raw;
  }

  return `marketplace.backup-${raw}.html`;
}

const sourceInput = parseSourceArg(process.argv.slice(2)) || process.env.MARKETPLACE_SOURCE || '';
const sourceFile = normalizeSourceInput(sourceInput);
const sourcePath = path.join(root, sourceFile);

if (!fs.existsSync(sourcePath)) {
  throw new Error(`Source backup not found: ${sourceFile}`);
}

let content = fs.readFileSync(sourcePath, 'utf8');

function mustReplace(pattern, replacement, label) {
  const next = content.replace(pattern, replacement);
  if (next === content) {
    throw new Error(`Missing pattern: ${label}`);
  }
  content = next;
}

// Keep visible branding aligned with the current Rated 7v7 naming while preserving slug IDs.
content = content
  .replaceAll('Pylon 7v7', 'Rated 7v7')
  .replaceAll('SR/SM/Blu Chips/Pylon ecosystem', 'SR/SM/Blu Chips/Rated 7v7 ecosystem')
  .replaceAll('Blu Chips, Pylon', 'Blu Chips, Rated 7v7')
  .replaceAll('<strong>PY</strong> Pylon', '<strong>R7</strong> Rated 7v7');

mustReplace(
  /input,select\{font-family:inherit\}/,
  `input,select{font-family:inherit}

:focus-visible{outline:2px solid var(--magenta-light);outline-offset:2px}`,
  'focus visible',
);

mustReplace(
  /\.search-btn \.arrow\{font-size:16px\}/,
  `.search-btn .arrow{font-size:16px}
.search-clear{background:transparent;border:1px solid var(--pill-border);border-radius:10px;color:var(--muted-strong);font-family:'Bebas Neue',sans-serif;font-size:13px;letter-spacing:.14em;padding:14px 16px;text-transform:uppercase;transition:all .2s}
.search-clear:hover{border-color:var(--magenta);color:var(--magenta)}`,
  'search clear styles',
);

mustReplace(
  /\.filter-pill\.active\{background:var\(--magenta\);border-color:var\(--magenta\);color:var\(--navy-deep\);font-weight:600\}/,
  `.filter-pill.active{background:var(--magenta);border-color:var(--magenta);color:var(--navy-deep);font-weight:600}
.filter-actions{margin-top:12px;display:flex;justify-content:flex-end}
.filter-reset{border:1px solid var(--pill-border);border-radius:8px;color:var(--muted-strong);font-family:'Bebas Neue',sans-serif;font-size:12px;letter-spacing:.12em;padding:10px 14px;text-transform:uppercase;transition:all .2s}
.filter-reset:hover{border-color:var(--magenta);color:var(--magenta)}`,
  'filter actions styles',
);

mustReplace(
  /\.view-btn\.active\{background:var\(--magenta\);color:var\(--navy-deep\);font-weight:700\}/,
  `.view-btn.active{background:var(--magenta);color:var(--navy-deep);font-weight:700}
.active-filters{margin-bottom:16px;display:flex;flex-wrap:wrap;gap:8px}
.active-chip{border:1px solid var(--pill-border);border-radius:999px;padding:5px 10px;font-size:11px;color:var(--muted-strong);letter-spacing:.08em;text-transform:uppercase;background:var(--pill-bg)}
.results-empty{display:none;margin-top:18px;border:1px dashed var(--pill-border);border-radius:12px;padding:18px;color:var(--muted-strong);text-align:center;background:rgba(255,255,255,.02)}`,
  'results enhancement styles',
);

mustReplace(
  /<button class="search-btn">Find My Clips <span class="arrow">-><\/span><\/button>/,
  `<button class="search-btn" type="button">Find My Clips <span class="arrow">-></span></button>
  <button class="search-clear" type="button">Clear Search</button>`,
  'search controls',
);

mustReplace(
  /<button class="filter-pill">NFTs Only<\/button>\s*<\/div>/,
  `<button class="filter-pill">NFTs Only</button>
    </div>
    <div class="filter-actions">
      <button class="filter-reset" type="button" id="clearAllFilters">Clear All Filters</button>
    </div>`,
  'filter action markup',
);

mustReplace(/<div class="results-count">/, '<div class="results-count" id="resultsCount" aria-live="polite">', 'results count aria');
mustReplace(/<button class="view-btn active">Grid<\/button>/, '<button class="view-btn active" type="button">Grid</button>', 'grid button type');
mustReplace(/<button class="view-btn">List<\/button>/, '<button class="view-btn" type="button">List</button>', 'list button type');

mustReplace(
  /\s*<div class="game-grid">/,
  `
  <div class="active-filters" id="activeFilters" aria-live="polite"></div>

  <div class="game-grid">`,
  'active filters bar',
);

mustReplace(
  /\s*<div class="pagination">/,
  `
  <div class="results-empty" id="resultsEmpty">No clips matched your filters. Try clearing filters or broadening your search.</div>

  <div class="pagination">`,
  'results empty markup',
);

const runtimeScript = fs.readFileSync(runtimeScriptPath, 'utf8').trim();
const newScript = `<script>\n${runtimeScript}\n</script>`;

mustReplace(/<script>[\s\S]*?<\/script>/m, newScript, 'script replacement');

fs.writeFileSync(outPath, content, 'utf8');
console.log(`marketplace updated from ${sourceFile}`);
