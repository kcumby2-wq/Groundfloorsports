# Admin Page - Claude JS Review Packet

## File
- admin.html

## Purpose
Supabase-backed admin dashboard for athlete operations (auth session, CRUD, rankings, revenue, CSV/JSON import-export, static preview fallback links).

## Core JavaScript (high-impact sections)
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
  const headers = {
    "Content-Type": "application/json",
    "apikey": SUPABASE_ANON_KEY,
  };
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

async function signOut() {
  if (AUTH_TOKEN) {
    try {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: "POST",
        headers: { "apikey": SUPABASE_ANON_KEY, "Authorization": `Bearer ${AUTH_TOKEN}` },
      });
    } catch {}
  }
  AUTH_TOKEN = null;
  CURRENT_USER = null;
  sessionStorage.removeItem("sr_token");
  sessionStorage.removeItem("sr_user");
  showLogin();
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

function applyStaticPreviewFallbackLinks() {
  if (window.location.protocol !== "file:") return;

  const routeMap = {
    "/": "Subjectreport.html",
    "/marketplace": "marketplace.html",
    "/sign-in": "sign-in.html",
    "/sign-up": "sign-up.html",
    "/terms": "preview-route.html?path=%2Fterms",
    "/privacy": "preview-route.html?path=%2Fprivacy",
    "/nil": "preview-route.html?path=%2Fnil",
    "/forgot-password": "preview-route.html?path=%2Fforgot-password"
  };

  document.querySelectorAll('a[href^="/"]').forEach((link) => {
    const href = link.getAttribute("href") || "";
    if (routeMap[href]) link.setAttribute("href", routeMap[href]);
  });
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

## Prompt For Claude
```text
Review this admin dashboard JS for a Supabase-backed static prototype.

Please evaluate:
1) auth/session security and token handling
2) data integrity and CRUD reliability
3) CSV/JSON import-export correctness and edge cases
4) error handling and resilience
5) maintainability / modularity opportunities
6) accessibility and UX risks in operations workflows

Return:
1. Top 12 improvements ranked by impact
2. Quick wins under 30 minutes
3. Medium improvements (1-3 hours)
4. Risky refactors to postpone
5. Concrete code-level suggestions for the top 3 issues
```
