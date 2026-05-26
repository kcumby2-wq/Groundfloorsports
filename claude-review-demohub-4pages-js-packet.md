# Demo Hub - 4 Page JS Review Packet

## Assumed 4 Pages From Demo Hub
This packet covers the four primary app flows inferred from demo-hub links:
- marketplace.html
- sign-in.html
- sign-up.html
- admin.html

If you meant a different four pages, swap the file list and I can regenerate.

## Architecture Snapshot
- Runtime: static file:// demos
- Routing fallback approach: remap production-style routes to local placeholder pages
- Data shape:
  - marketplace: in-DOM cards with client filtering/pagination
  - sign-in/sign-up: prototype UI with route remapping helpers
  - admin: Supabase-authenticated CRUD dashboard with CSV/JSON import/export

---

## 1) marketplace.html - Search/filter/pagination script
Note: file currently appears to contain this same script twice.

```javascript
(function () {
  const searchInputs = Array.from(document.querySelectorAll('.search-input'));
  const playerInput = searchInputs[0] || null;
  const teamInput = searchInputs[1] || null;
  const searchBtn = document.querySelector('.search-btn');
  const gameGrid = document.querySelector('.game-grid');
  const resultsCount = document.querySelector('.results-count');
  const emptyState = document.querySelector('.results-empty');
  const pagination = document.querySelector('.pagination');

  if (!gameGrid || !resultsCount || !pagination) return;

  const prevBtn = Array.from(pagination.querySelectorAll('.pg-btn')).find((btn) => btn.textContent.includes('Prev'));
  const nextBtn = Array.from(pagination.querySelectorAll('.pg-btn')).find((btn) => btn.textContent.includes('Next'));
  const pageButtons = Array.from(pagination.querySelectorAll('.pg-btn')).filter((btn) => /^\d+$/.test(btn.textContent.trim()));
  const pageInfo = pagination.querySelector('.pg-info');
  const cards = Array.from(gameGrid.querySelectorAll('.game-card'));
  const pageSize = 6;
  let currentPage = 1;

  cards.forEach((card) => {
    const name = (card.querySelector('.game-name')?.textContent || '').trim();
    const meta = (card.querySelector('.game-meta')?.textContent || '').replace(/\s+/g, ' ').trim();
    const seller = (card.querySelector('.game-seller strong')?.textContent || '').trim();
    const tags = Array.from(card.querySelectorAll('.game-tag')).map((el) => el.textContent.trim()).join(' ');
    const clips = Number((card.querySelector('.game-clipcount strong')?.textContent || '0').replace(/[^0-9]/g, '')) || 0;
    const dateMatch = meta.match(/([A-Za-z]{3}\s+\d{1,2},\s+\d{4})/);
    const date = dateMatch ? new Date(dateMatch[1]) : new Date('1970-01-01');
    const source = `${name} ${meta}`.toLowerCase();

    let sport = 'Football';
    if (source.includes('7v7')) sport = '7v7';
    if (source.includes('combine')) sport = 'Combines';
    if (source.includes('camp')) sport = 'Camps';

    card._meta = {
      text: `${name} ${meta} ${seller} ${tags}`.toLowerCase(),
      team: name.toLowerCase(),
      sport,
      media: 'Videos Only',
      date,
      clips,
    };
  });

  function activeFilter(label) {
    const row = Array.from(document.querySelectorAll('.filter-row')).find((node) => {
      return node.querySelector('.filter-label')?.textContent.trim().toLowerCase() === label.toLowerCase();
    });
    return row?.querySelector('.filter-pill.active')?.textContent.trim() || '';
  }

  function isDateMatch(filter, date) {
    if (!filter || filter === 'All Dates') return true;
    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;
    const diff = Math.floor((now.getTime() - date.getTime()) / dayMs);
    if (filter === 'Last 7 Days') return diff >= 0 && diff <= 7;
    if (filter === 'Last 30 Days') return diff >= 0 && diff <= 30;
    if (filter === 'This Season') return date.getFullYear() === now.getFullYear();
    if (filter === 'Upcoming') return date.getTime() > now.getTime();
    return true;
  }

  function applyFilters() {
    const q = (playerInput?.value || '').trim().toLowerCase();
    const team = (teamInput?.value || '').trim().toLowerCase();
    const sport = activeFilter('Sport');
    const dates = activeFilter('Dates');
    const sort = activeFilter('Sort');
    const media = activeFilter('Media');

    let filtered = cards.filter((card) => {
      const m = card._meta;
      const searchOk = !q || m.text.includes(q);
      const teamOk = !team || m.team.includes(team);
      const sportOk = !sport || sport === 'All Sports' || m.sport === sport;
      const dateOk = isDateMatch(dates, m.date);
      const mediaOk = !media || media === 'All Media' || m.media === media;
      return searchOk && teamOk && sportOk && dateOk && mediaOk;
    });

    if (sort === 'Most Clips') filtered = filtered.slice().sort((a, b) => b._meta.clips - a._meta.clips);
    else filtered = filtered.slice().sort((a, b) => b._meta.date - a._meta.date);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * pageSize;
    const visible = new Set(filtered.slice(start, start + pageSize));

    cards.forEach((card) => { card.style.display = visible.has(card) ? '' : 'none'; });
    filtered.forEach((card) => gameGrid.appendChild(card));

    const clipTotal = filtered.reduce((sum, card) => sum + card._meta.clips, 0);
    resultsCount.innerHTML = `<strong>${clipTotal.toLocaleString()}</strong> clips across <strong>${filtered.length}</strong> games`;

    if (emptyState) emptyState.style.display = filtered.length ? 'none' : 'block';

    pageButtons.forEach((btn, index) => {
      const page = index + 1;
      if (page <= totalPages) {
        btn.style.display = '';
        btn.textContent = String(page);
        btn.classList.toggle('active', page === currentPage);
      } else {
        btn.style.display = 'none';
      }
    });

    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
    if (pageInfo) pageInfo.textContent = `of ${totalPages}`;
  }

  document.querySelectorAll('.filter-row').forEach((row) => {
    const pills = Array.from(row.querySelectorAll('.filter-pill'));
    pills.forEach((pill) => {
      pill.addEventListener('click', () => {
        pills.forEach((item) => item.classList.remove('active'));
        pill.classList.add('active');
        currentPage = 1;
        applyFilters();
      });
    });
  });

  [playerInput, teamInput].forEach((input) => {
    if (!input) return;
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        currentPage = 1;
        applyFilters();
      }
    });
  });

  if (searchBtn) {
    searchBtn.addEventListener('click', (event) => {
      event.preventDefault();
      currentPage = 1;
      applyFilters();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage -= 1;
        applyFilters();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (!nextBtn.disabled) {
        currentPage += 1;
        applyFilters();
      }
    });
  }

  pageButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      currentPage = index + 1;
      applyFilters();
    });
  });

  applyFilters();
})();
```

---

## 2) sign-in.html - Static route remap helper
```javascript
(function () {
  if (window.location.protocol !== 'file:') return;

  const map = {
    '/forgot-password': 'preview-route.html?path=%2Fforgot-password',
    '/terms': 'preview-route.html?path=%2Fterms',
    '/privacy': 'preview-route.html?path=%2Fprivacy',
    '/nil': 'preview-route.html?path=%2Fnil'
  };

  document.querySelectorAll('a[href^="/"]').forEach((link) => {
    const href = link.getAttribute('href') || '';
    if (map[href]) {
      link.setAttribute('href', map[href]);
    }
  });
})();
```

---

## 3) sign-up.html - Role selector + static route remap
```javascript
// Simple account type selector for the prototype
// In production, this maps to Clerk publicMetadata.role on signup
document.querySelectorAll('.type-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.type-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
  });
});

(function () {
  if (window.location.protocol !== 'file:') return;

  const map = {
    '/forgot-password': 'preview-route.html?path=%2Fforgot-password',
    '/terms': 'preview-route.html?path=%2Fterms',
    '/privacy': 'preview-route.html?path=%2Fprivacy',
    '/nil': 'preview-route.html?path=%2Fnil'
  };

  document.querySelectorAll('a[href^="/"]').forEach((link) => {
    const href = link.getAttribute('href') || '';
    if (map[href]) {
      link.setAttribute('href', map[href]);
    }
  });
})();
```

---

## 4) admin.html - Auth + CRUD + import/export + dashboard
Representative core sections are included below (trimmed for review readability).

```javascript
const STATE = { athletes: [] };

const STATUS_LABELS = {
  booked: "Booked",
  paid: "Paid",
  grading: "Grading",
  delivered: "Delivered",
  active: "Active",
  churned: "Churned",
};

const PACKAGE_META = {
  transcript: { name: "Player Transcript", price: 249, recurring: false },
  program:    { name: "Recruiting Program", price: 1500, recurring: false },
  full:       { name: "Full Athlete Package", price: 5000, recurring: false },
  prospect:   { name: "Prospect Membership", price: 99, recurring: true },
};

const DEFAULT_SUPABASE_URL = "REPLACE_WITH_YOUR_PROJECT_URL";
const DEFAULT_SUPABASE_ANON_KEY = "REPLACE_WITH_YOUR_ANON_KEY";
const SUPABASE_URL = (localStorage.getItem("sr_supabase_url") || DEFAULT_SUPABASE_URL).trim();
const SUPABASE_ANON_KEY = (localStorage.getItem("sr_supabase_anon_key") || DEFAULT_SUPABASE_ANON_KEY).trim();

function hasSupabaseConfig() {
  return SUPABASE_URL.startsWith("https://") && SUPABASE_URL.includes(".supabase.co") && !SUPABASE_URL.includes("REPLACE") && !SUPABASE_ANON_KEY.includes("REPLACE") && SUPABASE_ANON_KEY.length > 20;
}

let AUTH_TOKEN = null;
let CURRENT_USER = null;

function getAuthHeaders() {
  const headers = { "Content-Type": "application/json", "apikey": SUPABASE_ANON_KEY };
  if (AUTH_TOKEN) headers["Authorization"] = `Bearer ${AUTH_TOKEN}`;
  return headers;
}

async function signIn(email, password) {
  if (!hasSupabaseConfig()) throw new Error("Supabase not configured — see SETUP.md");
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON_KEY },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.msg || "Login failed");
  AUTH_TOKEN = data.access_token;
  CURRENT_USER = data.user;
  sessionStorage.setItem("sr_token", data.access_token);
  sessionStorage.setItem("sr_user", JSON.stringify(data.user));
  return data.user;
}

async function loadAthletes() {
  if (!AUTH_TOKEN) {
    STATE.athletes = [];
    return;
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/athletes?select=*&order=updated_at.desc`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Load failed: ${res.status}`);
  const rows = await res.json();
  STATE.athletes = rows.map(dbToJs);
}

async function upsertAthlete(athlete) {
  const body = jsToDb(athlete);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/athletes?on_conflict=id`, {
    method: "POST",
    headers: { ...getAuthHeaders(), "Prefer": "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Save failed: ${res.status}`);
  const rows = await res.json();
  return rows[0] ? dbToJs(rows[0]) : athlete;
}

async function deleteAthleteRow(id) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/athletes?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
}

function exportCSV() {
  if (STATE.athletes.length === 0) return toast("No athletes to export", "err");
  const cols = [
    ["Jersey #", "jerseyNumber"], ["First Name", "firstName"], ["Last Name", "lastName"],
    ["Position", "position"], ["Email", "email"], ["Class/Yr", "classYear"],
    ["Height", "height"], ["Weight", "weight"], ["State/Province", "state"], ["School/Team", "school"],
    ["Rec Team", "recTeam"], ["Instagram", "instagram"], ["X (Twitter)", "xTwitter"], ["TikTok", "tikTok"],
    ["Video Url", "videoUrl"], ["Package", "package"], ["Status", "status"], ["Grade", "grade"],
    ["Transcript", "transcript"], ["Notes", "notes"], ["Created At", "createdAt"], ["Updated At", "updatedAt"],
  ];
  const esc = v => {
    if (v == null) return "";
    const s = String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
  };
  const csv = [
    cols.map(([header]) => header).join(","),
    ...STATE.athletes.map(a => cols.map(([, key]) => esc(a[key])).join(",")),
  ].join("\n");
  downloadFile(csv, `subjectreport-athletes-${new Date().toISOString().slice(0,10)}.csv`, "text/csv");
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') { cell += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { cell += ch; }
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ',') { row.push(cell); cell = ""; }
      else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ""; }
      else if (ch !== '\r') { cell += ch; }
    }
  }

  if (cell.length > 0 || row.length > 0) { row.push(cell); rows.push(row); }
  return rows;
}

(async function init() {
  applyStaticPreviewFallbackLinks();

  if (!hasSupabaseConfig()) {
    document.body.innerHTML = `...setup needed message...`;
    return;
  }

  if (restoreSession()) {
    await loadAthletes();
    if (!AUTH_TOKEN) { showLogin(); return; }
    showApp();
    renderDashboard();
  } else {
    showLogin();
  }
})();
```

---

## Prompt To Paste Into Claude
```text
Review these 4 static app scripts from Demo Hub:
- marketplace.html
- sign-in.html
- sign-up.html
- admin.html

Please focus on:
1. UX reliability and edge cases in static preview mode
2. Data integrity and parsing/export safety
3. Security/privacy risks (especially admin auth/session handling)
4. Accessibility and keyboard behavior
5. Maintainability and code duplication

Return:
1. Top 12 improvements by impact (with file-specific references)
2. Quick wins under 30 minutes
3. Medium changes (1-3 hours)
4. High-risk refactors to postpone
5. Concrete code-level recommendations for your top 3 items
```
