<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Subjectreport Admin Â· Operations Dashboard</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">

<style>
  :root {
    --navy-900: #0a1729;
    --navy-800: #0f2040;
    --navy-700: #14305f;
    --navy-600: #1a4082;
    --cyan: #2fa3e8;
    --cyan-bright: #4ec4ff;
    --cream: #f2eee3;
    --cream-bright: #f8f5ec;
    --fog: rgba(242, 238, 227, 0.65);
    --fog-line: rgba(242, 238, 227, 0.15);
    --glass: rgba(242, 238, 227, 0.06);
    --glass-border: rgba(242, 238, 227, 0.18);
    --ok: #4ade80;
    --warn: #fbbf24;
    --danger: #f87171;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--navy-900);
    color: var(--cream);
    font-family: "Inter", sans-serif;
    font-size: 14px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
  }

  body::before {
    content: "";
    position: fixed;
    inset: 0;
    background:
      radial-gradient(ellipse 70% 50% at 80% 0%, rgba(78, 196, 255, 0.08) 0%, transparent 60%),
      linear-gradient(180deg, var(--navy-900) 0%, var(--navy-800) 100%);
    z-index: -1;
    pointer-events: none;
  }

  .app { display: grid; grid-template-columns: 240px 1fr; min-height: 100vh; }

  /* SIDEBAR */
  aside {
    background: rgba(10, 23, 41, 0.8);
    backdrop-filter: blur(12px);
    border-right: 1px solid var(--fog-line);
    padding: 24px 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .brand {
    font-family: "Anton", sans-serif;
    font-size: 20px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--cream-bright);
    padding: 4px 12px 20px;
    border-bottom: 1px solid var(--fog-line);
    margin-bottom: 12px;
  }
  .brand span { color: var(--cyan-bright); }
  .brand small {
    display: block;
    font-family: "JetBrains Mono", monospace;
    font-size: 10px;
    letter-spacing: 0.2em;
    color: var(--fog);
    margin-top: 2px;
    font-weight: 400;
  }
  .nav-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    background: transparent;
    border: 0;
    color: var(--cream);
    opacity: 0.7;
    cursor: pointer;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    font-family: "Inter", sans-serif;
    transition: all 0.15s;
    text-align: left;
    width: 100%;
  }
  .nav-btn:hover { background: var(--glass); opacity: 1; }
  .nav-btn.active { background: rgba(78, 196, 255, 0.1); color: var(--cyan-bright); opacity: 1; }
  .nav-btn .ico { width: 16px; height: 16px; flex-shrink: 0; }

  /* MAIN */
  main { padding: 32px 40px; overflow-x: hidden; }
  .page-head { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 28px; flex-wrap: wrap; gap: 12px; }
  .page-head h1 {
    font-family: "Anton", sans-serif;
    font-size: 40px;
    line-height: 0.95;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: var(--cream-bright);
  }
  .page-head .sub { color: var(--fog); font-size: 14px; }
  .conn-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 999px;
    font-family: "JetBrains Mono", monospace;
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    border: 1px solid var(--fog-line);
    color: var(--fog);
    background: rgba(242, 238, 227, 0.03);
  }
  .conn-pill::before {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--fog);
    box-shadow: 0 0 0 0 rgba(242, 238, 227, 0.2);
  }
  .conn-pill.ok { color: var(--ok); border-color: rgba(74, 222, 128, 0.35); background: rgba(74, 222, 128, 0.08); }
  .conn-pill.ok::before { background: var(--ok); box-shadow: 0 0 0 5px rgba(74, 222, 128, 0.12); }
  .conn-pill.warn { color: var(--warn); border-color: rgba(251, 191, 36, 0.35); background: rgba(251, 191, 36, 0.08); }
  .conn-pill.warn::before { background: var(--warn); box-shadow: 0 0 0 5px rgba(251, 191, 36, 0.12); }
  .conn-pill.err { color: var(--danger); border-color: rgba(248, 113, 113, 0.35); background: rgba(248, 113, 113, 0.08); }
  .conn-pill.err::before { background: var(--danger); box-shadow: 0 0 0 5px rgba(248, 113, 113, 0.12); }

  .view { display: none; }
  .view.active { display: block; }

  /* KPI ROW */
  .kpi-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 32px;
  }
  .kpi {
    background: var(--glass);
    border: 1px solid var(--glass-border);
    border-radius: 14px;
    padding: 20px 22px;
  }
  .kpi .label {
    font-family: "JetBrains Mono", monospace;
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--cyan-bright);
    margin-bottom: 10px;
  }
  .kpi .value {
    font-family: "Anton", sans-serif;
    font-size: 36px;
    line-height: 1;
    color: var(--cream-bright);
    letter-spacing: 0;
  }
  .kpi .sub { font-size: 11px; color: var(--fog); margin-top: 8px; }

  /* CARD */
  .card {
    background: var(--glass);
    border: 1px solid var(--glass-border);
    border-radius: 14px;
    padding: 20px 24px;
    margin-bottom: 20px;
  }
  .card-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 8px;
  }
  .card-head h2 {
    font-family: "Anton", sans-serif;
    font-size: 20px;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    color: var(--cream-bright);
  }
  .card-head .actions { display: flex; gap: 8px; }

  /* BUTTONS */
  button, .btn {
    padding: 8px 14px;
    border-radius: 8px;
    border: 1px solid var(--fog-line);
    background: transparent;
    color: var(--cream);
    font-family: "Inter", sans-serif;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.03em;
    cursor: pointer;
    transition: all 0.15s;
  }
  button:hover { background: var(--glass); border-color: var(--fog); }
  .btn-primary {
    background: var(--cyan);
    color: var(--navy-900);
    border-color: var(--cyan);
    font-weight: 700;
  }
  .btn-primary:hover { background: var(--cyan-bright); border-color: var(--cyan-bright); }
  .btn-danger { color: var(--danger); }
  .btn-danger:hover { background: rgba(248, 113, 113, 0.08); border-color: var(--danger); }
  .btn-sm { padding: 6px 10px; font-size: 11px; }

  /* TABLE */
  .tbl { width: 100%; border-collapse: collapse; font-size: 13px; }
  .tbl th {
    text-align: left;
    padding: 10px 12px;
    font-family: "JetBrains Mono", monospace;
    font-size: 10px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--fog);
    font-weight: 600;
    border-bottom: 1px solid var(--fog-line);
  }
  .tbl td {
    padding: 12px;
    border-bottom: 1px solid var(--fog-line);
    color: var(--cream);
  }
  .tbl tr:hover td { background: rgba(78, 196, 255, 0.03); }
  .tbl .name { font-weight: 600; color: var(--cream-bright); }
  .tbl .muted { color: var(--fog); font-size: 12px; }

  /* STATUS PILLS */
  .pill {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 999px;
    font-family: "JetBrains Mono", monospace;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    border: 1px solid;
  }
  .pill-booked { color: var(--fog); border-color: var(--fog-line); }
  .pill-paid { color: var(--cyan-bright); border-color: rgba(78, 196, 255, 0.35); background: rgba(78, 196, 255, 0.06); }
  .pill-grading { color: var(--warn); border-color: rgba(251, 191, 36, 0.35); background: rgba(251, 191, 36, 0.06); }
  .pill-delivered { color: var(--ok); border-color: rgba(74, 222, 128, 0.35); background: rgba(74, 222, 128, 0.06); }
  .pill-active { color: var(--ok); border-color: rgba(74, 222, 128, 0.5); background: rgba(74, 222, 128, 0.1); }
  .pill-churned { color: var(--danger); border-color: rgba(248, 113, 113, 0.35); background: rgba(248, 113, 113, 0.06); }

  /* GRADE BADGE */
  .grade {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
    font-weight: 600;
    background: rgba(78, 196, 255, 0.1);
    color: var(--cyan-bright);
    border: 1px solid rgba(78, 196, 255, 0.25);
  }
  .grade-none { color: var(--fog); background: transparent; border-color: var(--fog-line); }

  /* FORMS */
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 16px; }
  .form-grid.one { grid-template-columns: 1fr; }
  .field label {
    display: block;
    font-family: "JetBrains Mono", monospace;
    font-size: 10px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--fog);
    margin-bottom: 6px;
    font-weight: 600;
  }
  .field input, .field select, .field textarea {
    width: 100%;
    background: rgba(242, 238, 227, 0.04);
    border: 1px solid var(--fog-line);
    border-radius: 8px;
    padding: 10px 12px;
    color: var(--cream-bright);
    font-family: "Inter", sans-serif;
    font-size: 13px;
    transition: border-color 0.15s, background 0.15s;
  }
  .field input:focus, .field select:focus, .field textarea:focus {
    outline: none; border-color: var(--cyan); background: rgba(78, 196, 255, 0.05);
  }
  .field textarea { min-height: 72px; resize: vertical; font-family: inherit; }
  .field select { appearance: none; cursor: pointer; }

  /* MODAL */
  .modal-backdrop {
    position: fixed; inset: 0;
    background: rgba(5, 12, 22, 0.85);
    backdrop-filter: blur(6px);
    z-index: 100;
    display: none;
    align-items: flex-start; justify-content: center;
    padding: 40px 20px; overflow-y: auto;
  }
  .modal-backdrop.open { display: flex; }
  .modal {
    background: linear-gradient(180deg, var(--navy-800) 0%, var(--navy-900) 100%);
    border: 1px solid var(--glass-border);
    border-radius: 16px;
    width: 100%; max-width: 640px;
    padding: 28px 32px 24px;
    position: relative;
  }
  .modal h3 {
    font-family: "Anton", sans-serif;
    font-size: 24px;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: var(--cream-bright);
    margin-bottom: 6px;
  }
  .modal .sub { color: var(--fog); font-size: 13px; margin-bottom: 20px; }
  .modal .close-x {
    position: absolute; top: 16px; right: 16px;
    width: 30px; height: 30px;
    border: 1px solid var(--fog-line); border-radius: 50%;
    background: transparent; color: var(--cream);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 16px; padding: 0;
  }
  .modal .close-x:hover { border-color: var(--cyan); color: var(--cyan-bright); }
  .modal .footer {
    display: flex; justify-content: space-between; align-items: center;
    margin-top: 20px; padding-top: 20px;
    border-top: 1px solid var(--fog-line);
  }
  .modal .footer-right { display: flex; gap: 8px; }

  /* PUBLIC RANKING PAGE (embed preview) */
  .rank-preview {
    background: linear-gradient(180deg, var(--navy-800) 0%, var(--navy-900) 100%);
    border: 1px solid var(--fog-line);
    border-radius: 12px;
    padding: 20px 24px;
    margin-top: 12px;
  }
  .rank-row {
    display: grid;
    grid-template-columns: 40px 1fr auto auto;
    gap: 14px;
    align-items: center;
    padding: 12px 8px;
    border-bottom: 1px solid var(--fog-line);
  }
  .rank-row:last-child { border-bottom: 0; }
  .rank-num {
    font-family: "Anton", sans-serif;
    font-size: 28px;
    color: var(--cyan-bright);
    line-height: 1;
    text-align: center;
  }
  .rank-row .who { display: flex; flex-direction: column; gap: 2px; }
  .rank-row .athlete-name { font-weight: 600; color: var(--cream-bright); font-size: 15px; }
  .rank-row .meta { font-size: 11px; color: var(--fog); font-family: "JetBrains Mono", monospace; letter-spacing: 0.05em; }
  .rank-row .grade-big {
    font-family: "Anton", sans-serif;
    font-size: 26px;
    color: var(--cyan-bright);
    line-height: 1;
  }
  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: var(--fog);
    font-size: 13px;
  }
  .empty-state .big {
    font-family: "Anton", sans-serif;
    font-size: 28px;
    color: var(--cream-bright);
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  /* TOAST */
  .toast {
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: var(--navy-700);
    border: 1px solid var(--cyan);
    padding: 12px 20px;
    border-radius: 10px;
    color: var(--cream-bright);
    font-size: 13px;
    z-index: 200;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.2s, transform 0.2s;
  }
  .toast.show { opacity: 1; transform: translateY(0); }

  /* LOADING */
  .loading { text-align: center; padding: 40px; color: var(--fog); font-size: 13px; }

  /* FILTERS */
  .filters {
    display: flex; gap: 8px; flex-wrap: wrap;
    margin-bottom: 16px;
  }
  .filters input, .filters select {
    background: rgba(242, 238, 227, 0.04);
    border: 1px solid var(--fog-line);
    border-radius: 8px;
    padding: 8px 12px;
    color: var(--cream-bright);
    font-family: "Inter", sans-serif;
    font-size: 13px;
  }
  .filters input { flex: 1; min-width: 200px; }
  .filters input:focus, .filters select:focus { outline: none; border-color: var(--cyan); }

  @media (max-width: 900px) {
    .app { grid-template-columns: 1fr; }
    aside { border-right: 0; border-bottom: 1px solid var(--fog-line); flex-direction: row; overflow-x: auto; padding: 12px; }
    aside .brand { border-bottom: 0; padding: 4px 8px 4px 0; margin-right: 12px; border-right: 1px solid var(--fog-line); padding-right: 16px; }
    aside .nav-btn { flex-shrink: 0; }
    main { padding: 20px; }
    .kpi-row { grid-template-columns: repeat(2, 1fr); }
    .form-grid { grid-template-columns: 1fr; }
    .page-head h1 { font-size: 28px; }
  }
</style>
</head>
<body>

<!-- LOGIN VIEW -->
<div id="loginView" style="display: none; min-height: 100vh; align-items: center; justify-content: center; padding: 40px 20px;">
  <div style="width: 100%; max-width: 400px; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 16px; padding: 40px 36px;">
    <div style="font-family: 'Anton', sans-serif; font-size: 26px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--cream-bright); margin-bottom: 4px;">
      SUBJECT<span style="color: var(--cyan-bright);">/</span>REPORT
    </div>
    <div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.2em; color: var(--fog); margin-bottom: 32px; text-transform: uppercase;">Admin Â· Sign in</div>

    <form onsubmit="handleLogin(event)">
      <div class="field" style="margin-bottom: 16px;">
        <label>Email</label>
        <input type="email" id="loginEmail" required autofocus autocomplete="email">
      </div>
      <div class="field" style="margin-bottom: 20px;">
        <label>Password</label>
        <input type="password" id="loginPassword" required autocomplete="current-password">
      </div>
      <button type="submit" id="loginBtn" class="btn-primary" style="width: 100%; padding: 12px;">Sign in</button>
      <div id="loginError" style="color: var(--danger); font-size: 12px; margin-top: 12px; min-height: 16px;"></div>
    </form>

    <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--fog-line); font-size: 12px; color: var(--fog); line-height: 1.5;">
      New here? Create a user account in your Supabase project (<strong style="color: var(--cream-bright);">Authentication â†’ Users â†’ Add user</strong>) then sign in above.
    </div>

    <div style="margin-top: 12px; display: flex; justify-content: flex-end;">
      <button type="button" class="btn-sm" onclick="reconnectSupabase()">Reconnect Supabase</button>
    </div>
  </div>
</div>

<div class="app" id="appShell" style="display: none;">
  <!-- SIDEBAR -->
  <aside>
    <div class="brand">
      SUBJECT<span>/</span>REPORT
      <small>Admin Â· v1</small>
    </div>
    <button class="nav-btn active" data-view="dashboard">
      <svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1.5" y="1.5" width="5" height="5"/><rect x="9.5" y="1.5" width="5" height="5"/><rect x="1.5" y="9.5" width="5" height="5"/><rect x="9.5" y="9.5" width="5" height="5"/></svg>
      Dashboard
    </button>
    <button class="nav-btn" data-view="athletes">
      <svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="5" r="3"/><path d="M2 15 C 2 10, 14 10, 14 15"/></svg>
      Athletes
    </button>
    <button class="nav-btn" data-view="rankings">
      <svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M 2 13 L 5 13 L 5 8 L 2 8 Z"/><path d="M 6.5 13 L 9.5 13 L 9.5 4 L 6.5 4 Z"/><path d="M 11 13 L 14 13 L 14 6 L 11 6 Z"/></svg>
      Rankings
    </button>
    <button class="nav-btn" data-view="revenue">
      <svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M 2 4 L 2 12 L 14 12"/><path d="M 4 10 L 7 7 L 9 9 L 13 5"/></svg>
      Revenue
    </button>
    <button class="nav-btn" data-view="settings">
      <svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="2"/><path d="M 8 1 L 8 3 M 8 13 L 8 15 M 1 8 L 3 8 M 13 8 L 15 8 M 3 3 L 4.5 4.5 M 11.5 11.5 L 13 13 M 3 13 L 4.5 11.5 M 11.5 4.5 L 13 3"/></svg>
      Settings
    </button>

    <div style="margin-top: auto; padding-top: 16px; border-top: 1px solid var(--fog-line);">
      <button class="nav-btn" onclick="refreshData()">
        <svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M 13 8 A 5 5 0 1 1 8 3 L 10 3 M 10 1 L 10 5"/></svg>
        Refresh
      </button>
      <div style="padding: 10px 12px; font-size: 11px; color: var(--fog); font-family: 'JetBrains Mono', monospace; letter-spacing: 0.05em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" id="userEmail">â€”</div>
      <button class="nav-btn" onclick="signOut()" style="color: var(--fog);">
        <svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M 10 4 L 10 2 L 2 2 L 2 14 L 10 14 L 10 12"/><path d="M 7 8 L 14 8 M 11 5 L 14 8 L 11 11"/></svg>
        Sign out
      </button>
    </div>
  </aside>

  <!-- MAIN -->
  <main>
    <!-- DASHBOARD -->
    <div class="view active" data-view="dashboard">
      <div class="page-head">
        <div>
          <h1>Dashboard</h1>
          <div class="sub">Operations command center Â· <span id="todayDate"></span></div>
        </div>
        <div class="actions">
          <span id="connStatus" class="conn-pill warn" title="Supabase connection status">Checkingâ€¦</span>
          <button class="btn-primary" onclick="openAddAthlete()">+ New athlete</button>
        </div>
      </div>

      <div class="kpi-row" id="kpiRow">
        <div class="loading">Loadingâ€¦</div>
      </div>

      <div class="card">
        <div class="card-head">
          <h2>Pipeline Â· Needs your attention</h2>
          <button class="btn-sm" onclick="showView('athletes')">View all â†’</button>
        </div>
        <div id="pipelineTable"></div>
      </div>

      <div class="card">
        <div class="card-head">
          <h2>Recent activity</h2>
        </div>
        <div id="activityFeed"></div>
      </div>
    </div>

    <!-- ATHLETES -->
    <div class="view" data-view="athletes">
      <div class="page-head">
        <div>
          <h1>Athletes</h1>
          <div class="sub" id="athleteCount">â€”</div>
        </div>
        <div class="actions">
          <button class="btn-sm" onclick="exportAthleteTemplateCSV()">Template CSV</button>
          <button class="btn-sm" onclick="exportCSV()">Export CSV</button>
          <button class="btn-primary" onclick="openAddAthlete()">+ New athlete</button>
        </div>
      </div>

      <div class="card">
        <div class="filters">
          <input type="text" id="searchInput" placeholder="Search by name, email, positionâ€¦" oninput="renderAthletes()">
          <select id="statusFilter" onchange="renderAthletes()">
            <option value="">All statuses</option>
            <option value="booked">Booked</option>
            <option value="paid">Paid</option>
            <option value="grading">Grading</option>
            <option value="delivered">Delivered</option>
            <option value="active">Active subscriber</option>
            <option value="churned">Churned</option>
          </select>
          <select id="packageFilter" onchange="renderAthletes()">
            <option value="">All packages</option>
            <option value="transcript">Player Transcript</option>
            <option value="program">Recruiting Program</option>
            <option value="full">Full Athlete Package</option>
            <option value="prospect">Prospect Membership</option>
          </select>
        </div>
        <div id="athletesTable"></div>
      </div>
    </div>

    <!-- RANKINGS -->
    <div class="view" data-view="rankings">
      <div class="page-head">
        <div>
          <h1>Rankings</h1>
          <div class="sub">Public ranking board Â· Preview of what shows on subjectreport.com</div>
        </div>
        <div class="actions">
          <button class="btn-sm" onclick="copyRankingsJSON()">Copy JSON for embed</button>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <h2>Filter rankings</h2>
        </div>
        <div class="filters">
          <select id="rankPosition" onchange="renderRankings()">
            <option value="">All positions</option>
            <option>QB</option><option>RB</option><option>WR</option><option>TE</option>
            <option>OL</option><option>DL</option><option>LB</option><option>DB</option>
            <option>K/P</option>
          </select>
          <select id="rankClass" onchange="renderRankings()">
            <option value="">All class years</option>
            <option>2026</option><option>2027</option><option>2028</option>
            <option>2029</option><option>2030</option>
          </select>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <h2>Live preview</h2>
          <div class="sub" style="font-size: 12px; color: var(--fog);" id="rankCount">â€”</div>
        </div>
        <div id="rankingsPreview"></div>
      </div>
    </div>

    <!-- REVENUE -->
    <div class="view" data-view="revenue">
      <div class="page-head">
        <div>
          <h1>Revenue</h1>
          <div class="sub">Pipeline value, MRR, and payouts</div>
        </div>
      </div>

      <div class="kpi-row" id="revKpis"></div>

      <div class="card">
        <div class="card-head">
          <h2>By package</h2>
        </div>
        <div id="revByPackage"></div>
      </div>

      <div class="card">
        <div class="card-head">
          <h2>Recent transactions</h2>
        </div>
        <div id="revTransactions"></div>
      </div>
    </div>

    <!-- SETTINGS -->
    <div class="view" data-view="settings">
      <div class="page-head">
        <div>
          <h1>Settings</h1>
          <div class="sub">Data storage, exports, and danger zone</div>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <h2>Data</h2>
        </div>
        <p style="color: var(--fog); margin-bottom: 16px; font-size: 13px;">
          All athlete data is stored securely in your SubjectReport database. It persists across sessions and syncs to your account. Back up regularly by exporting.
        </p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button onclick="exportCSV()">Export all athletes (CSV)</button>
          <button onclick="document.getElementById('importCsvFile').click()">Import CSV</button>
          <button onclick="exportJSON()">Export full backup (JSON)</button>
          <button onclick="document.getElementById('importFile').click()">Import backup</button>
          <input type="file" id="importCsvFile" accept=".csv,text/csv" style="display:none" onchange="importCSV(event)">
          <input type="file" id="importFile" accept=".json" style="display:none" onchange="importJSON(event)">
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <h2>Templates</h2>
        </div>
        <p style="color: var(--fog); margin-bottom: 16px; font-size: 13px;">
          Download a blank partner-format CSV template for bulk intake. This is separate from manually adding athletes with "+ New athlete".
        </p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button onclick="openTemplatePreview()">View template</button>
          <button onclick="exportAthleteTemplateCSV()">Download athlete CSV template</button>
        </div>
      </div>

      <div class="card" style="border-color: rgba(248, 113, 113, 0.3);">
        <div class="card-head">
          <h2 style="color: var(--danger);">Danger zone</h2>
        </div>
        <p style="color: var(--fog); margin-bottom: 16px; font-size: 13px;">
          Clear all stored data. This cannot be undone. Export a backup first.
        </p>
        <button class="btn-danger" onclick="clearAllData()">Clear all data</button>
      </div>
    </div>
  </main>
</div>

<!-- ADD/EDIT ATHLETE MODAL -->
<div class="modal-backdrop" id="athleteModal" onclick="if(event.target===this) closeAthleteModal()">
  <div class="modal">
    <button class="close-x" onclick="closeAthleteModal()">Ã—</button>
    <h3 id="athleteModalTitle">New athlete</h3>
    <div class="sub" id="athleteModalSub">Add an athlete to your pipeline.</div>

    <form id="athleteForm" onsubmit="saveAthlete(event)">
      <input type="hidden" id="athleteId" value="">

      <div class="form-grid" style="margin-bottom: 16px;">
        <div class="field">
          <label>Jersey #</label>
          <input type="text" id="aJerseyNumber" placeholder="e.g. 6">
        </div>
        <div class="field">
          <label>First name</label>
          <input type="text" id="aFirstName" required>
        </div>
        <div class="field">
          <label>Last name</label>
          <input type="text" id="aLastName" required>
        </div>
        <div class="field">
          <label>Email</label>
          <input type="email" id="aEmail" required>
        </div>
        <div class="field">
          <label>Phone</label>
          <input type="tel" id="aPhone">
        </div>
        <div class="field">
          <label>Position</label>
          <select id="aPosition">
            <option value="">Selectâ€¦</option>
            <option>QB</option><option>RB</option><option>WR</option><option>TE</option>
            <option>OL</option><option>DL</option><option>LB</option><option>DB</option>
            <option>K/P</option><option>Other</option>
          </select>
        </div>
        <div class="field">
          <label>Class year</label>
          <select id="aClassYear">
            <option value="">Selectâ€¦</option>
            <option>2026</option><option>2027</option><option>2028</option>
            <option>2029</option><option>2030</option>
          </select>
        </div>
        <div class="field">
          <label>Height</label>
          <input type="text" id="aHeight" placeholder="e.g. 6'1&quot;">
        </div>
        <div class="field">
          <label>Weight</label>
          <input type="text" id="aWeight" placeholder="e.g. 185">
        </div>
        <div class="field">
          <label>School/Team</label>
          <input type="text" id="aSchool" placeholder="e.g. Plano East">
        </div>
        <div class="field">
          <label>State/Province</label>
          <input type="text" id="aState" placeholder="TX">
        </div>
        <div class="field">
          <label>Rec Team</label>
          <input type="text" id="aRecTeam" placeholder="e.g. Cambridge Bears">
        </div>
        <div class="field">
          <label>Instagram</label>
          <input type="text" id="aInstagram" placeholder="@athlete">
        </div>
        <div class="field">
          <label>X (Twitter)</label>
          <input type="text" id="aXTwitter" placeholder="@athlete">
        </div>
        <div class="field">
          <label>TikTok</label>
          <input type="text" id="aTikTok" placeholder="@athlete">
        </div>
        <div class="field">
          <label>Video URL</label>
          <input type="url" id="aVideoUrl" placeholder="https://...">
        </div>
        <div class="field">
          <label>Package</label>
          <select id="aPackage" required onchange="updatePriceField()">
            <option value="transcript">Player Transcript Â· $249</option>
            <option value="program">Recruiting Program Â· $1,500</option>
            <option value="full">Full Athlete Package Â· $5,000</option>
            <option value="prospect">Prospect Membership Â· $99/mo</option>
          </select>
        </div>
        <div class="field">
          <label>Status</label>
          <select id="aStatus" required>
            <option value="booked">Booked</option>
            <option value="paid">Paid</option>
            <option value="grading">Grading in progress</option>
            <option value="delivered">Report delivered</option>
            <option value="active">Active subscriber</option>
            <option value="churned">Churned</option>
          </select>
        </div>
        <div class="field">
          <label>Overall grade (if graded)</label>
          <input type="number" id="aGrade" min="0" max="100" step="0.1" placeholder="e.g. 87.5">
        </div>
        <div class="field">
          <label>PDF transcript link</label>
          <input type="url" id="aTranscript" placeholder="Drive / DocSend URL">
        </div>
      </div>

      <div class="field" style="margin-bottom: 16px;">
        <label>Notes</label>
        <textarea id="aNotes" placeholder="Offers on the table, goals, contextâ€¦"></textarea>
      </div>

      <div class="footer">
        <button type="button" class="btn-danger" id="deleteBtn" style="display: none;" onclick="deleteAthlete()">Delete</button>
        <div class="footer-right" style="margin-left: auto;">
          <button type="button" onclick="closeAthleteModal()">Cancel</button>
          <button type="submit" class="btn-primary">Save athlete</button>
        </div>
      </div>
    </form>
  </div>
</div>

<div class="toast" id="toast"></div>

<script>
  // ===================== STATE =====================
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

  // ===================== SUPABASE CONFIG =====================
  // Runtime-configurable connection for switching projects without code edits.
  const DEFAULT_SUPABASE_URL = "REPLACE_WITH_YOUR_PROJECT_URL";
  const DEFAULT_SUPABASE_ANON_KEY = "REPLACE_WITH_YOUR_ANON_KEY";
  const SUPABASE_URL = (localStorage.getItem("sr_supabase_url") || DEFAULT_SUPABASE_URL).trim();
  const SUPABASE_ANON_KEY = (localStorage.getItem("sr_supabase_anon_key") || DEFAULT_SUPABASE_ANON_KEY).trim();

  function hasSupabaseConfig() {
    return SUPABASE_URL.startsWith("https://") && SUPABASE_URL.includes(".supabase.co") && !SUPABASE_URL.includes("REPLACE") && !SUPABASE_ANON_KEY.includes("REPLACE") && SUPABASE_ANON_KEY.length > 20;
  }

  function closeReconnectModal() {
    const el = document.getElementById("reconnectModal");
    if (el) el.remove();
  }

  function openReconnectModal() {
    if (document.getElementById("reconnectModal")) return;

    const backdrop = document.createElement("div");
    backdrop.id = "reconnectModal";
    backdrop.style.cssText = "position:fixed;inset:0;z-index:300;background:rgba(5,12,22,.86);display:flex;align-items:center;justify-content:center;padding:16px;";
    backdrop.innerHTML = `
      <div style="width:min(560px,100%);background:linear-gradient(180deg,var(--navy-800) 0%,var(--navy-900) 100%);border:1px solid var(--glass-border);border-radius:14px;padding:22px;">
        <div style="font-family:'Anton',sans-serif;font-size:24px;letter-spacing:.03em;text-transform:uppercase;color:var(--cream-bright);margin-bottom:6px;">Reconnect Supabase</div>
        <div style="color:var(--fog);font-size:13px;margin-bottom:14px;">Paste your new project URL and publishable/anon key.</div>
        <div class="field" style="margin-bottom:12px;">
          <label>Project URL</label>
          <input id="reconnectUrl" type="text" placeholder="https://your-project.supabase.co" value="${escapeAttr(localStorage.getItem("sr_supabase_url") || "")}">
        </div>
        <div class="field" style="margin-bottom:16px;">
          <label>Publishable / anon key</label>
          <input id="reconnectKey" type="text" placeholder="sb_publishable_..." value="${escapeAttr(localStorage.getItem("sr_supabase_anon_key") || "")}">
          <div id="reconnectHelp" style="margin-top:8px;color:var(--fog);font-size:12px;line-height:1.4;">Use the full value from Supabase Settings -> API. Valid examples start with <strong>sb_publishable_</strong> or <strong>eyJ</strong>.</div>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;">
          <button type="button" id="reconnectCancel">Cancel</button>
          <button type="button" class="btn-primary" id="reconnectSave">Save & Reload</button>
        </div>
      </div>
    `;

    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeReconnectModal();
    });

    document.body.appendChild(backdrop);
    document.getElementById("reconnectUrl")?.focus();

    document.getElementById("reconnectCancel")?.addEventListener("click", closeReconnectModal);
    document.getElementById("reconnectSave")?.addEventListener("click", () => {
      const nextUrl = String(document.getElementById("reconnectUrl")?.value || "").trim();
      const helpEl = document.getElementById("reconnectHelp");

      // Normalize paste noise: quotes/newlines/spaces around copied values.
      const rawKey = String(document.getElementById("reconnectKey")?.value || "").trim();
      const nextKey = rawKey.replace(/^['"]+|['"]+$/g, "").replace(/[\r\n\t]/g, "").trim();

      if (!nextUrl.startsWith("https://") || !nextUrl.includes(".supabase.co")) {
        alert("Invalid Supabase URL. Expected: https://your-project.supabase.co");
        return;
      }
      const looksLikeSupabaseKey = nextKey.startsWith("sb_publishable_") || nextKey.startsWith("eyJ");
      if (!looksLikeSupabaseKey || nextKey.length < 40) {
        if (helpEl) {
          helpEl.style.color = "var(--danger)";
          helpEl.textContent = `Key not recognized (length ${nextKey.length}). Paste the complete publishable/anon key from Supabase Settings -> API.`;
        }
        return;
      }

      localStorage.setItem("sr_supabase_url", nextUrl);
      localStorage.setItem("sr_supabase_anon_key", nextKey);
      location.reload();
    });
  }

  function reconnectSupabase() {
    openReconnectModal();
  }

  // ===================== AUTH SESSION =====================
  // We store the JWT from Supabase Auth in sessionStorage. When making API calls
  // we send it as the Bearer token instead of the anon key, which gives us
  // full access per the "authenticated full access" RLS policy.
  let AUTH_TOKEN = null;
  let CURRENT_USER = null;

  function getAuthHeaders() {
    const headers = {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    };
    if (AUTH_TOKEN) {
      headers["Authorization"] = `Bearer ${AUTH_TOKEN}`;
    }
    return headers;
  }

  function setConnectionStatus(kind, label) {
    const el = document.getElementById("connStatus");
    if (!el) return;
    el.className = `conn-pill ${kind}`;
    el.textContent = label;
  }

  async function refreshConnectionStatus() {
    if (!AUTH_TOKEN) {
      setConnectionStatus("warn", "Signed out");
      return;
    }
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/athletes?select=id&limit=1`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) setConnectionStatus("ok", "Supabase connected");
      else if (res.status === 401) setConnectionStatus("warn", "Session expired");
      else setConnectionStatus("err", `Data API ${res.status}`);
    } catch {
      setConnectionStatus("err", "Network error");
    }
  }

  async function signIn(email, password) {
    if (!hasSupabaseConfig()) {
      throw new Error("Supabase not configured â€” see SETUP.md");
    }
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

  function restoreSession() {
    const token = sessionStorage.getItem("sr_token");
    const user = sessionStorage.getItem("sr_user");
    if (token && user) {
      AUTH_TOKEN = token;
      try { CURRENT_USER = JSON.parse(user); } catch { CURRENT_USER = null; }
      return true;
    }
    return false;
  }

  // ===================== ROW MAPPING =====================
  // Supabase columns are snake_case, our JS objects are camelCase.
  const LEGACY_PROFILE_MARKER = "\n\n[[profile_meta]]\n";

  function parseLegacyProfile(rawNotes) {
    const value = String(rawNotes || "");
    const idx = value.indexOf(LEGACY_PROFILE_MARKER);
    if (idx === -1) {
      return { notes: value, profile: {} };
    }

    const plainNotes = value.slice(0, idx);
    const metaRaw = value.slice(idx + LEGACY_PROFILE_MARKER.length);
    try {
      const profile = JSON.parse(metaRaw);
      return { notes: plainNotes, profile: profile && typeof profile === "object" ? profile : {} };
    } catch {
      return { notes: plainNotes, profile: {} };
    }
  }

  function dbToJs(row) {
    const legacy = parseLegacyProfile(row.notes || "");
    const profile = legacy.profile;

    return {
      id:         row.id,
      jerseyNumber: row.jersey_number || profile.jerseyNumber || "",
      firstName:  row.first_name,
      lastName:   row.last_name,
      email:      row.email || "",
      phone:      row.phone || "",
      position:   row.position || "",
      classYear:  row.class_year || "",
      height:     row.height || profile.height || "",
      weight:     row.weight || profile.weight || "",
      school:     row.school || "",
      state:      row.state || "",
      recTeam:    row.rec_team || profile.recTeam || "",
      instagram:  row.instagram || profile.instagram || "",
      xTwitter:   row.x_twitter || profile.xTwitter || "",
      tikTok:     row.tiktok || profile.tikTok || "",
      videoUrl:   row.video_url || profile.videoUrl || "",
      package:    row.package || "transcript",
      status:     row.status || "booked",
      grade:      row.grade,
      transcript: row.transcript_url || "",
      notes:      legacy.notes || "",
      createdAt:  row.created_at ? new Date(row.created_at).getTime() : Date.now(),
      updatedAt:  row.updated_at ? new Date(row.updated_at).getTime() : Date.now(),
    };
  }

  function jsToDb(a) {
    return {
      id:             a.id,
      jersey_number:  a.jerseyNumber || null,
      first_name:     a.firstName,
      last_name:      a.lastName,
      email:          a.email || null,
      phone:          a.phone || null,
      position:       a.position || null,
      class_year:     a.classYear || null,
      height:         a.height || null,
      weight:         a.weight || null,
      school:         a.school || null,
      state:          a.state || null,
      rec_team:       a.recTeam || null,
      instagram:      a.instagram || null,
      x_twitter:      a.xTwitter || null,
      tiktok:         a.tikTok || null,
      video_url:      a.videoUrl || null,
      package:        a.package,
      status:         a.status,
      grade:          (a.grade === "" || a.grade == null) ? null : Number(a.grade),
      transcript_url: a.transcript || null,
      notes:          (a.notes || "").trim() || null,
    };
  }

  // ===================== STORAGE (Supabase) =====================
  async function loadAthletes() {
    if (!AUTH_TOKEN) {
      STATE.athletes = [];
      setConnectionStatus("warn", "Signed out");
      return;
    }
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/athletes?select=*&order=updated_at.desc`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        if (res.status === 401) {
          setConnectionStatus("warn", "Session expired");
          await signOut();
          return;
        }
        setConnectionStatus("err", `Data API ${res.status}`);
        throw new Error(`Load failed: ${res.status}`);
      }
      const rows = await res.json();
      STATE.athletes = rows.map(dbToJs);
      setConnectionStatus("ok", "Supabase connected");
    } catch (err) {
      console.error("loadAthletes:", err);
      toast("Couldn't load athletes â€” check connection", "err");
      STATE.athletes = [];
      setConnectionStatus("err", "Connection failed");
    }
  }

  async function upsertAthlete(athlete) {
    const body = jsToDb(athlete);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/athletes?on_conflict=id`, {
      method: "POST",
      headers: { ...getAuthHeaders(), "Prefer": "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("upsertAthlete:", res.status, errText);
      throw new Error(`Save failed: ${res.status}`);
    }
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

  // Legacy helper kept for interface compatibility â€” no-op in Supabase world,
  // because upsert/delete already persist individually.
  async function saveAthletes() { /* intentional no-op */ }

  // ===================== NAV =====================
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => showView(btn.dataset.view));
  });

  function showView(name) {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.view === name));
    document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", v.dataset.view === name));
    if (name === "dashboard") renderDashboard();
    if (name === "athletes") renderAthletes();
    if (name === "rankings") renderRankings();
    if (name === "revenue") renderRevenue();
  }

  // ===================== DASHBOARD =====================
  function renderDashboard() {
    const total = STATE.athletes.length;
    const active = STATE.athletes.filter(a => a.status === "active").length;
    const needsAction = STATE.athletes.filter(a => ["paid", "grading"].includes(a.status)).length;
    const totalRevenue = STATE.athletes.reduce((sum, a) => {
      if (["paid", "grading", "delivered", "active"].includes(a.status)) {
        return sum + (PACKAGE_META[a.package]?.price || 0);
      }
      return sum;
    }, 0);

    document.getElementById("kpiRow").innerHTML = `
      <div class="kpi">
        <div class="label">Total athletes</div>
        <div class="value">${total}</div>
        <div class="sub">In pipeline or delivered</div>
      </div>
      <div class="kpi">
        <div class="label">Needs action</div>
        <div class="value">${needsAction}</div>
        <div class="sub">Paid or grading in progress</div>
      </div>
      <div class="kpi">
        <div class="label">Active subs</div>
        <div class="value">${active}</div>
        <div class="sub">Prospect members</div>
      </div>
      <div class="kpi">
        <div class="label">Revenue booked</div>
        <div class="value">$${totalRevenue.toLocaleString()}</div>
        <div class="sub">Lifetime (excluding churn)</div>
      </div>
    `;

    // Pipeline table â€” athletes that need action
    const pipeline = STATE.athletes
      .filter(a => ["booked", "paid", "grading"].includes(a.status))
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
      .slice(0, 8);

    document.getElementById("todayDate").textContent = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

    if (pipeline.length === 0) {
      document.getElementById("pipelineTable").innerHTML = `
        <div class="empty-state">
          <div class="big">All caught up</div>
          <div>No athletes need action right now.</div>
        </div>`;
    } else {
      document.getElementById("pipelineTable").innerHTML = renderAthleteRows(pipeline);
    }

    // Activity feed â€” last 8 updates
    const recent = [...STATE.athletes].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)).slice(0, 8);
    if (recent.length === 0) {
      document.getElementById("activityFeed").innerHTML = `
        <div class="empty-state">
          <div class="big">No activity yet</div>
          <div>Add your first athlete to see updates here.</div>
        </div>`;
    } else {
      document.getElementById("activityFeed").innerHTML = recent.map(a => {
        const when = new Date(a.updatedAt).toLocaleDateString();
        return `
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--fog-line); align-items: center;">
            <div>
              <span class="name" style="font-weight: 600; color: var(--cream-bright);">${escapeHtml(a.firstName)} ${escapeHtml(a.lastName)}</span>
              <span style="color: var(--fog); margin-left: 8px; font-size: 12px;">${PACKAGE_META[a.package]?.name || "â€”"}</span>
            </div>
            <div style="display: flex; gap: 12px; align-items: center;">
              <span class="pill pill-${a.status}">${STATUS_LABELS[a.status]}</span>
              <span class="muted" style="font-size: 11px; color: var(--fog); font-family: 'JetBrains Mono', monospace;">${when}</span>
            </div>
          </div>`;
      }).join("");
    }
  }

  // ===================== ATHLETES TABLE =====================
  function renderAthletes() {
    const q = (document.getElementById("searchInput")?.value || "").toLowerCase().trim();
    const statusF = document.getElementById("statusFilter")?.value || "";
    const pkgF = document.getElementById("packageFilter")?.value || "";

    let filtered = STATE.athletes.filter(a => {
      if (statusF && a.status !== statusF) return false;
      if (pkgF && a.package !== pkgF) return false;
      if (q) {
        const hay = `${a.firstName} ${a.lastName} ${a.email} ${a.position || ""} ${a.school || ""} ${a.jerseyNumber || ""} ${a.recTeam || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    }).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

    document.getElementById("athleteCount").textContent = `${filtered.length} of ${STATE.athletes.length} athletes`;

    if (filtered.length === 0) {
      document.getElementById("athletesTable").innerHTML = `
        <div class="empty-state">
          <div class="big">No athletes yet</div>
          <div>Click "+ New athlete" to add your first.</div>
        </div>`;
    } else {
      document.getElementById("athletesTable").innerHTML = renderAthleteRows(filtered);
    }
  }

  function renderAthleteRows(rows) {
    return `
      <table class="tbl">
        <thead>
          <tr>
            <th>Name</th>
            <th>Package</th>
            <th>Status</th>
            <th>Jersey</th>
            <th>Position</th>
            <th>Class</th>
            <th>Grade</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(a => `
            <tr>
              <td>
                <div class="name">${escapeHtml(a.firstName)} ${escapeHtml(a.lastName)}</div>
                <div class="muted">${escapeHtml(a.email || "")}</div>
              </td>
              <td>${PACKAGE_META[a.package]?.name || "â€”"}</td>
              <td><span class="pill pill-${a.status}">${STATUS_LABELS[a.status]}</span></td>
              <td>${escapeHtml(a.jerseyNumber || "â€”")}</td>
              <td>${escapeHtml(a.position || "â€”")}</td>
              <td>${escapeHtml(a.classYear || "â€”")}</td>
              <td>${a.grade != null && a.grade !== "" ? `<span class="grade">${a.grade}</span>` : '<span class="grade grade-none">â€”</span>'}</td>
              <td><button class="btn-sm" onclick="openEditAthlete('${a.id}')">Edit</button></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  }

  // ===================== RANKINGS =====================
  function renderRankings() {
    const posF = document.getElementById("rankPosition")?.value || "";
    const classF = document.getElementById("rankClass")?.value || "";

    let ranked = STATE.athletes.filter(a => {
      if (a.grade == null || a.grade === "") return false;
      if (posF && a.position !== posF) return false;
      if (classF && a.classYear !== classF) return false;
      return true;
    }).sort((a, b) => parseFloat(b.grade) - parseFloat(a.grade));

    document.getElementById("rankCount").textContent = `${ranked.length} ranked ${ranked.length === 1 ? "athlete" : "athletes"}`;

    if (ranked.length === 0) {
      document.getElementById("rankingsPreview").innerHTML = `
        <div class="empty-state">
          <div class="big">No rankings yet</div>
          <div>Grade an athlete to start the board.</div>
        </div>`;
      return;
    }

    document.getElementById("rankingsPreview").innerHTML = `
      <div class="rank-preview">
        ${ranked.map((a, i) => `
          <div class="rank-row">
            <div class="rank-num">${i + 1}</div>
            <div class="who">
              <div class="athlete-name">${escapeHtml(a.firstName)} ${escapeHtml(a.lastName)}</div>
              <div class="meta">${escapeHtml(a.position || "â€”")} Â· ${escapeHtml(a.classYear || "â€”")} Â· ${escapeHtml(a.school || "â€”")}${a.state ? ", " + escapeHtml(a.state) : ""}</div>
            </div>
            <div class="grade-big">${a.grade}</div>
            <div>${a.transcript ? `<a href="${escapeAttr(a.transcript)}" target="_blank" rel="noopener" class="btn-sm" style="text-decoration: none;">View transcript</a>` : ""}</div>
          </div>
        `).join("")}
      </div>
    `;
  }

  function copyRankingsJSON() {
    const ranked = STATE.athletes.filter(a => a.grade != null && a.grade !== "").sort((a, b) => parseFloat(b.grade) - parseFloat(a.grade));
    const data = ranked.map((a, i) => ({
      rank: i + 1,
      name: `${a.firstName} ${a.lastName}`,
      position: a.position,
      classYear: a.classYear,
      school: a.school,
      state: a.state,
      grade: a.grade,
      transcript: a.transcript,
    }));
    navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then(() => toast("Rankings JSON copied"));
  }

  // ===================== REVENUE =====================
  function renderRevenue() {
    const booked = STATE.athletes.filter(a => ["paid", "grading", "delivered", "active"].includes(a.status));
    const totalRev = booked.reduce((s, a) => s + (PACKAGE_META[a.package]?.price || 0), 0);
    const oneTimeRev = booked.filter(a => !PACKAGE_META[a.package]?.recurring).reduce((s, a) => s + (PACKAGE_META[a.package]?.price || 0), 0);
    const mrr = STATE.athletes.filter(a => a.status === "active" && PACKAGE_META[a.package]?.recurring).reduce((s, a) => s + (PACKAGE_META[a.package]?.price || 0), 0);
    const arr = mrr * 12;

    document.getElementById("revKpis").innerHTML = `
      <div class="kpi"><div class="label">One-time revenue</div><div class="value">$${oneTimeRev.toLocaleString()}</div><div class="sub">Transcripts, programs, full packages</div></div>
      <div class="kpi"><div class="label">MRR</div><div class="value">$${mrr.toLocaleString()}</div><div class="sub">Active Prospect subs</div></div>
      <div class="kpi"><div class="label">ARR (proj.)</div><div class="value">$${arr.toLocaleString()}</div><div class="sub">MRR Ã— 12</div></div>
      <div class="kpi"><div class="label">Total booked</div><div class="value">$${totalRev.toLocaleString()}</div><div class="sub">Lifetime</div></div>
    `;

    // Revenue by package
    const byPkg = {};
    Object.keys(PACKAGE_META).forEach(k => byPkg[k] = { count: 0, revenue: 0 });
    booked.forEach(a => {
      if (byPkg[a.package]) {
        byPkg[a.package].count++;
        byPkg[a.package].revenue += PACKAGE_META[a.package].price;
      }
    });

    document.getElementById("revByPackage").innerHTML = `
      <table class="tbl">
        <thead><tr><th>Package</th><th>Customers</th><th>Revenue</th></tr></thead>
        <tbody>
          ${Object.entries(byPkg).map(([k, v]) => `
            <tr>
              <td class="name">${PACKAGE_META[k].name}${PACKAGE_META[k].recurring ? ' <span class="muted">(recurring)</span>' : ""}</td>
              <td>${v.count}</td>
              <td class="name">$${v.revenue.toLocaleString()}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;

    // Transactions
    if (booked.length === 0) {
      document.getElementById("revTransactions").innerHTML = `<div class="empty-state"><div>No paid athletes yet.</div></div>`;
    } else {
      document.getElementById("revTransactions").innerHTML = renderAthleteRows([...booked].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)).slice(0, 10));
    }
  }

  // ===================== MODAL =====================
  function openAddAthlete() {
    document.getElementById("athleteForm").reset();
    document.getElementById("athleteId").value = "";
    document.getElementById("athleteModalTitle").textContent = "New athlete";
    document.getElementById("athleteModalSub").textContent = "Add an athlete to your pipeline.";
    document.getElementById("deleteBtn").style.display = "none";
    document.getElementById("athleteModal").classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function openEditAthlete(id) {
    const a = STATE.athletes.find(x => x.id === id);
    if (!a) return;
    document.getElementById("athleteId").value = a.id;
    document.getElementById("aJerseyNumber").value = a.jerseyNumber || "";
    document.getElementById("aFirstName").value = a.firstName || "";
    document.getElementById("aLastName").value = a.lastName || "";
    document.getElementById("aEmail").value = a.email || "";
    document.getElementById("aPhone").value = a.phone || "";
    document.getElementById("aPosition").value = a.position || "";
    document.getElementById("aClassYear").value = a.classYear || "";
    document.getElementById("aHeight").value = a.height || "";
    document.getElementById("aWeight").value = a.weight || "";
    document.getElementById("aSchool").value = a.school || "";
    document.getElementById("aState").value = a.state || "";
    document.getElementById("aRecTeam").value = a.recTeam || "";
    document.getElementById("aInstagram").value = a.instagram || "";
    document.getElementById("aXTwitter").value = a.xTwitter || "";
    document.getElementById("aTikTok").value = a.tikTok || "";
    document.getElementById("aVideoUrl").value = a.videoUrl || "";
    document.getElementById("aPackage").value = a.package || "transcript";
    document.getElementById("aStatus").value = a.status || "booked";
    document.getElementById("aGrade").value = a.grade ?? "";
    document.getElementById("aTranscript").value = a.transcript || "";
    document.getElementById("aNotes").value = a.notes || "";
    document.getElementById("athleteModalTitle").textContent = `${a.firstName} ${a.lastName}`;
    document.getElementById("athleteModalSub").textContent = "Edit athlete details, update grade, change status.";
    document.getElementById("deleteBtn").style.display = "inline-block";
    document.getElementById("athleteModal").classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeAthleteModal() {
    document.getElementById("athleteModal").classList.remove("open");
    document.body.style.overflow = "";
  }

  function updatePriceField() {} // placeholder for future price display logic

  async function saveAthlete(e) {
    e.preventDefault();
    const id = document.getElementById("athleteId").value || `ath_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
    const data = {
      id,
      jerseyNumber: document.getElementById("aJerseyNumber").value.trim(),
      firstName: document.getElementById("aFirstName").value.trim(),
      lastName:  document.getElementById("aLastName").value.trim(),
      email:     document.getElementById("aEmail").value.trim(),
      phone:     document.getElementById("aPhone").value.trim(),
      position:  document.getElementById("aPosition").value,
      classYear: document.getElementById("aClassYear").value,
      height:    document.getElementById("aHeight").value.trim(),
      weight:    document.getElementById("aWeight").value.trim(),
      school:    document.getElementById("aSchool").value.trim(),
      state:     document.getElementById("aState").value.trim(),
      recTeam:   document.getElementById("aRecTeam").value.trim(),
      instagram: document.getElementById("aInstagram").value.trim(),
      xTwitter:  document.getElementById("aXTwitter").value.trim(),
      tikTok:    document.getElementById("aTikTok").value.trim(),
      videoUrl:  document.getElementById("aVideoUrl").value.trim(),
      package:   document.getElementById("aPackage").value,
      status:    document.getElementById("aStatus").value,
      grade:     document.getElementById("aGrade").value,
      transcript: document.getElementById("aTranscript").value.trim(),
      notes:     document.getElementById("aNotes").value.trim(),
    };

    const wasExisting = STATE.athletes.some(a => a.id === id);

    try {
      const saved = await upsertAthlete(data);
      const idx = STATE.athletes.findIndex(a => a.id === id);
      if (idx >= 0) STATE.athletes[idx] = saved;
      else STATE.athletes.unshift(saved);
      closeAthleteModal();
      toast(wasExisting ? "Athlete updated" : "Athlete added");
      const currentView = document.querySelector(".view.active").dataset.view;
      showView(currentView);
    } catch (err) {
      console.error(err);
      toast("Save failed â€” " + err.message, "err");
    }
  }

  async function deleteAthlete() {
    const id = document.getElementById("athleteId").value;
    if (!id) return;
    if (!confirm("Delete this athlete? This cannot be undone.")) return;
    try {
      await deleteAthleteRow(id);
      STATE.athletes = STATE.athletes.filter(a => a.id !== id);
      closeAthleteModal();
      toast("Athlete deleted");
      const currentView = document.querySelector(".view.active").dataset.view;
      showView(currentView);
    } catch (err) {
      console.error(err);
      toast("Delete failed â€” " + err.message, "err");
    }
  }

  // ===================== EXPORT / IMPORT =====================
  function exportCSV() {
    if (STATE.athletes.length === 0) return toast("No athletes to export", "err");
    const cols = [
      ["Jersey #", "jerseyNumber"],
      ["First Name", "firstName"],
      ["Last Name", "lastName"],
      ["Position", "position"],
      ["Email", "email"],
      ["Class/Yr", "classYear"],
      ["Height", "height"],
      ["Weight", "weight"],
      ["State/Province", "state"],
      ["School/Team", "school"],
      ["Rec Team", "recTeam"],
      ["Instagram", "instagram"],
      ["X (Twitter)", "xTwitter"],
      ["TikTok", "tikTok"],
      ["Video Url", "videoUrl"],
      ["Package", "package"],
      ["Status", "status"],
      ["Grade", "grade"],
      ["Transcript", "transcript"],
      ["Notes", "notes"],
      ["Created At", "createdAt"],
      ["Updated At", "updatedAt"],
    ];
    const esc = v => { if (v == null) return ""; const s = String(v); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s; };
    const csv = [
      cols.map(([header]) => header).join(","),
      ...STATE.athletes.map(a => cols.map(([, key]) => esc(a[key])).join(",")),
    ].join("\n");
    downloadFile(csv, `subjectreport-athletes-${new Date().toISOString().slice(0,10)}.csv`, "text/csv");
    toast("CSV exported");
  }

  function exportAthleteTemplateCSV() {
    const headers = [
      "Jersey #",
      "First Name",
      "Last Name",
      "Position",
      "Email",
      "Phone",
      "Class/Yr",
      "Height",
      "Weight",
      "State/Province",
      "School/Team",
      "Rec Team",
      "Instagram",
      "X (Twitter)",
      "TikTok",
      "Video Url",
      "Package",
      "Status",
      "Grade",
      "Transcript",
      "Notes",
    ];
    const csv = `${headers.join(",")}\n`;
    downloadFile(csv, "groundfloorsports-athlete-template.csv", "text/csv");
    toast("Template exported");
  }

  function openTemplatePreview() {
    window.open("template-preview.html", "_blank", "noopener,noreferrer");
  }

  function exportJSON() {
    const data = { version: 1, exportedAt: new Date().toISOString(), athletes: STATE.athletes };
    downloadFile(JSON.stringify(data, null, 2), `subjectreport-backup-${new Date().toISOString().slice(0,10)}.json`, "application/json");
    toast("Backup exported");
  }

  function normalizeHeader(s) {
    return String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
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
        if (ch === '"' && next === '"') {
          cell += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          cell += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ',') {
          row.push(cell);
          cell = "";
        } else if (ch === '\n') {
          row.push(cell);
          rows.push(row);
          row = [];
          cell = "";
        } else if (ch === '\r') {
          // Ignore CR. LF will terminate row in CRLF files.
        } else {
          cell += ch;
        }
      }
    }

    if (cell.length > 0 || row.length > 0) {
      row.push(cell);
      rows.push(row);
    }

    return rows;
  }

  async function importCSV(e) {
    const file = e.target.files[0];
    if (!file) return;

    const HEADER_ALIASES = {
      id: ["id"],
      jerseyNumber: ["jerseynumber", "jersey#", "jersey"],
      firstName: ["firstname", "first"],
      lastName: ["lastname", "last"],
      position: ["position", "pos"],
      email: ["email", "emailaddress"],
      phone: ["phone", "phonenumber"],
      classYear: ["classyr", "classyear", "class", "gradyear", "graduationyear"],
      height: ["height", "ht"],
      weight: ["weight", "wt"],
      state: ["stateprovince", "state", "province"],
      school: ["schoolteam", "school", "team", "highschool"],
      recTeam: ["recteam", "recreationalteam"],
      instagram: ["instagram", "instagramhandle"],
      xTwitter: ["xtwitter", "twitter", "x"],
      tikTok: ["tiktok", "tik tok"],
      videoUrl: ["videourl", "videolink", "video"],
      package: ["package"],
      status: ["status"],
      grade: ["grade", "overallgrade"],
      transcript: ["transcript", "transcripturl", "pdftranscriptlink"],
      notes: ["notes"],
      createdAt: ["createdat", "created"],
      updatedAt: ["updatedat", "updated"],
    };

    const byAlias = new Map();
    Object.entries(HEADER_ALIASES).forEach(([key, aliases]) => {
      aliases.forEach(alias => byAlias.set(normalizeHeader(alias), key));
    });

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = String(evt.target.result || "");
        const rows = parseCSV(text).filter(r => r.some(cell => String(cell || "").trim() !== ""));
        if (rows.length < 2) throw new Error("CSV has no data rows");

        const headerRow = rows[0].map(h => String(h || "").trim());
        const colToField = headerRow.map(h => byAlias.get(normalizeHeader(h)) || null);

        if (!colToField.some(Boolean)) throw new Error("No recognized columns in CSV");

        const imported = [];
        for (let i = 1; i < rows.length; i++) {
          const r = rows[i];
          const rowObj = {};

          colToField.forEach((field, idx) => {
            if (!field) return;
            rowObj[field] = String(r[idx] || "").trim();
          });

          if (!rowObj.firstName && !rowObj.lastName && !rowObj.email) continue;

          if (!rowObj.id) {
            rowObj.id = `ath_${Date.now()}_${i}_${Math.random().toString(36).slice(2,7)}`;
          }

          const existing = STATE.athletes.find(a => a.id === rowObj.id);
          const merged = {
            ...(existing || {}),
            ...rowObj,
          };

          if (merged.grade === "") merged.grade = null;
          if (!merged.updatedAt) merged.updatedAt = Date.now();
          if (!merged.package) merged.package = existing?.package || "transcript";
          if (!merged.status) merged.status = existing?.status || "booked";

          imported.push(merged);
        }

        if (imported.length === 0) throw new Error("No valid athlete rows found");
        if (!confirm(`Import ${imported.length} athletes from CSV?`)) return;

        const savedRows = [];
        for (const athlete of imported) {
          const saved = await upsertAthlete(athlete);
          savedRows.push(saved);
        }

        const existingMap = new Map(STATE.athletes.map(a => [a.id, a]));
        savedRows.forEach(a => existingMap.set(a.id, a));
        STATE.athletes = Array.from(existingMap.values());

        toast(`Imported ${savedRows.length} athletes from CSV`);
        showView(document.querySelector(".view.active").dataset.view);
      } catch (err) {
        console.error(err);
        toast("CSV import failed â€” " + err.message, "err");
      }
      e.target.value = "";
    };

    reader.readAsText(file);
  }

  function importJSON(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        if (!data.athletes || !Array.isArray(data.athletes)) throw new Error("Invalid file");
        if (!confirm(`Import ${data.athletes.length} athletes? This will merge with your current data.`)) return;
        // Merge by id, newer wins
        const existing = new Map(STATE.athletes.map(a => [a.id, a]));
        data.athletes.forEach(a => {
          const cur = existing.get(a.id);
          if (!cur || (a.updatedAt || 0) > (cur.updatedAt || 0)) existing.set(a.id, a);
        });
        const merged = Array.from(existing.values());
        const savedRows = [];
        for (const athlete of merged) {
          const saved = await upsertAthlete(athlete);
          savedRows.push(saved);
        }
        STATE.athletes = savedRows;
        toast(`Imported ${data.athletes.length} athletes`);
        showView(document.querySelector(".view.active").dataset.view);
      } catch (err) {
        toast("Import failed â€” invalid file", "err");
      }
      e.target.value = "";
    };
    reader.readAsText(file);
  }

  async function clearAllData() {
    if (!confirm("Clear ALL athlete data? This cannot be undone. Export first.")) return;
    if (!confirm("Really sure? This deletes every athlete from your Supabase database.")) return;
    try {
      // Delete every row. Supabase requires a filter â€” use id.neq.__never__ to match all.
      const res = await fetch(`${SUPABASE_URL}/rest/v1/athletes?id=neq.__never__`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      STATE.athletes = [];
      toast("All data cleared");
      showView("dashboard");
    } catch (err) {
      toast("Clear failed â€” " + err.message, "err");
    }
  }

  // ===================== REFRESH =====================
  async function refreshData() {
    await loadAthletes();
    showView("dashboard");
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      const kpiRow = document.getElementById("kpiRow");
      if (kpiRow) {
        kpiRow.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 0);
    toast("Refreshed");
  }

  function downloadFile(content, name, type) {
    const blob = new Blob([content], { type });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // ===================== UTIL =====================
  function escapeHtml(s) {
    return String(s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }
  function escapeAttr(s) { return escapeHtml(s); }

  function toast(msg, kind) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.style.borderColor = kind === "err" ? "var(--danger)" : "var(--cyan)";
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 2400);
  }

  // ===================== BOOT =====================
  function showLogin() {
    document.getElementById("loginView").style.display = "flex";
    document.getElementById("appShell").style.display = "none";
    setConnectionStatus("warn", "Signed out");
  }

  function showApp() {
    document.getElementById("loginView").style.display = "none";
    document.getElementById("appShell").style.display = "grid";
    if (CURRENT_USER?.email) {
      const el = document.getElementById("userEmail");
      if (el) el.textContent = CURRENT_USER.email;
    }
    refreshConnectionStatus();
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
      if (routeMap[href]) {
        link.setAttribute("href", routeMap[href]);
      }
    });
  }

  async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const pw = document.getElementById("loginPassword").value;
    const err = document.getElementById("loginError");
    const btn = document.getElementById("loginBtn");
    err.textContent = "";
    btn.disabled = true;
    btn.textContent = "Signing inâ€¦";
    try {
      await signIn(email, pw);
      await loadAthletes();
      showApp();
      renderDashboard();
    } catch (e) {
      err.textContent = e.message;
      btn.disabled = false;
      btn.textContent = "Sign in";
    }
  }

  (async function init() {
    applyStaticPreviewFallbackLinks();

    if (!hasSupabaseConfig()) {
      // Friendly config warning
      document.body.innerHTML = `
        <div style="max-width: 560px; margin: 80px auto; padding: 40px; background: rgba(242,238,227,0.04); border: 1px solid rgba(242,238,227,0.15); border-radius: 14px; font-family: Inter, sans-serif; color: #f2eee3;">
          <h1 style="font-family: 'Anton', sans-serif; font-size: 32px; margin-bottom: 12px; text-transform: uppercase;">Setup needed</h1>
          <p style="color: rgba(242,238,227,0.65); margin-bottom: 20px;">This dashboard isn't configured yet. Click below to connect your new Supabase project.</p>
          <button onclick="reconnectSupabase()" style="padding: 10px 14px; border-radius: 8px; border: 1px solid rgba(78,196,255,0.45); background: rgba(78,196,255,0.14); color: #4ec4ff; cursor: pointer;">Reconnect Supabase</button>
          <p style="color: rgba(242,238,227,0.65); margin-top: 16px;">See <code style="background: rgba(78,196,255,0.1); padding: 2px 6px; border-radius: 4px; color: #4ec4ff;">SETUP.md</code> for step-by-step instructions.</p>
        </div>`;
      return;
    }

    if (restoreSession()) {
      await loadAthletes();
      if (!AUTH_TOKEN) { showLogin(); return; } // session was invalidated
      showApp();
      renderDashboard();
    } else {
      showLogin();
    }
  })();
</script>

</body>
</html>

`

## Prompt For Claude
`	ext
Review this full HTML source (structure + CSS + JS) for the page.

Please evaluate:
1. UX clarity and conversion flow
2. Accessibility (semantic structure, keyboard behavior, focus flow, contrast)
3. CSS maintainability and responsiveness
4. JavaScript reliability and edge cases
5. Security/privacy risks (especially for auth/admin pages)
6. Performance opportunities

Return:
1. Top 12 improvements ranked by impact
2. Quick wins under 30 minutes
3. Medium improvements (1-3 hours)
4. High-risk refactors to defer
5. Concrete code-level suggestions for top 3 issues
`
"@;

   = @"
# Admin Full Source Review Packet

## Source File
- admin.html

## Full HTML Source
`html

