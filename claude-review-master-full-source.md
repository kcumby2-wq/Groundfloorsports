# Claude Master Review Packet

This file combines 4 full-source page packets for one upload.


---

## Source Packet: claude-review-marketplace-full-source.md

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GroundfloorSports — Marketplace</title>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
<!--
  GFS Marketplace Browse Page
  Static HTML prototype for conversion to React/Next.js component.

  Architecture notes for the engineer:
  - Page route: /marketplace
  - Component tree: <MarketplacePage> wraps <Header />, <HeroBar />, <SearchBar />, <FilterBar />, <ResultsHeader />, <GameGrid /> with <GameCard /> children, <Pagination />
  - Data: GET /api/games?sport=&date_range=&sort=&media_type=&event_type=&page=
  - GameCard click -> navigates to /marketplace/games/[slug]
  - "Find My Clips" search -> /search?q=[player_or_jersey]&team=[team]
  - Mock data here represents the SR/SM/Blu Chips/Pylon ecosystem
-->
<style>
:root{
  --navy:#0a1628;--navy-deep:#050b16;--navy-card:#0e1d33;
  --magenta:#ec4899;--magenta-light:#f472b6;--magenta-dim:rgba(236,72,153,.18);--magenta-faint:rgba(236,72,153,.06);
  --blue:#4db8ff;--coral:#ff7849;--gold:#d4a84a;
  --white:#fff;--muted:rgba(255,255,255,.62);--muted-strong:rgba(255,255,255,.82);
  --line:rgba(255,255,255,.1);--pill-bg:rgba(255,255,255,.04);--pill-border:rgba(255,255,255,.12);
  --input-bg:rgba(255,255,255,.04);--input-border:rgba(255,255,255,.14);
}
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{font-family:'DM Sans',sans-serif;color:var(--white);background:var(--navy-deep);line-height:1.55;min-height:100vh}
a{text-decoration:none;color:inherit}
button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit}
input,select{font-family:inherit}

/* NAV - consistent with landing */
.nav{position:sticky;top:0;left:0;right:0;z-index:100;padding:16px 48px;display:flex;justify-content:space-between;align-items:center;background:rgba(10,22,40,.92);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid var(--line)}
.nav-logo{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:.08em;display:flex;align-items:center;gap:10px}
.nav-logo span{color:var(--magenta)}
.nav-logo-mark{width:30px;height:30px;border:2px solid var(--magenta);border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--magenta);font-size:13px;background:rgba(236,72,153,.08)}
.nav-links{display:flex;gap:28px;align-items:center}
.nav-link{font-size:13px;color:var(--muted-strong);letter-spacing:.02em;transition:color .2s}
.nav-link:hover,.nav-link.active{color:var(--magenta)}
.nav-link.active{font-weight:500}
.nav-cta{background:var(--magenta);color:var(--navy-deep);font-family:'Bebas Neue',sans-serif;font-size:12px;letter-spacing:.15em;padding:8px 16px;border-radius:6px;text-transform:uppercase;font-weight:700}

/* PAGE HEADER */
.page-header{padding:60px 48px 40px;background:radial-gradient(ellipse 600px 300px at 30% 0%,rgba(236,72,153,.10),transparent 70%)}
.page-header-inner{max-width:1280px;margin:0 auto}
.page-eyebrow{font-size:11px;letter-spacing:.28em;color:var(--magenta);text-transform:uppercase;font-weight:700;margin-bottom:12px;display:inline-block}
.page-title{font-family:'Bebas Neue',sans-serif;font-size:72px;line-height:.95;text-transform:uppercase;letter-spacing:-.005em;margin-bottom:14px}
.page-title .magenta{color:var(--magenta)}
.page-sub{font-size:16px;color:var(--muted-strong);line-height:1.55;max-width:680px}

/* SEARCH BAR */
.search-section{padding:0 48px;margin-bottom:32px}
.search-inner{max-width:1280px;margin:0 auto}
.search-bar{background:var(--navy-card);border:1px solid var(--input-border);border-radius:14px;padding:12px;display:grid;grid-template-columns:1.5fr 1fr auto;gap:10px;align-items:center;box-shadow:0 4px 20px rgba(0,0,0,.2)}
.search-input{background:var(--input-bg);border:1px solid var(--input-border);border-radius:10px;padding:14px 18px;color:var(--white);font-size:14px;width:100%;outline:none;transition:border-color .2s}
.search-input:focus{border-color:var(--magenta)}
.search-input::placeholder{color:var(--muted)}
.search-btn{background:var(--magenta);color:var(--navy-deep);font-family:'Bebas Neue',sans-serif;font-size:14px;letter-spacing:.16em;padding:14px 28px;border-radius:10px;text-transform:uppercase;font-weight:700;transition:all .2s;display:flex;align-items:center;gap:8px;white-space:nowrap}
.search-btn:hover{background:var(--magenta-light)}
.search-btn .arrow{font-size:16px}

/* FILTER BAR */
.filter-section{padding:0 48px;margin-bottom:32px}
.filter-inner{max-width:1280px;margin:0 auto}
.filter-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px}
.filter-row:last-child{margin-bottom:0}
.filter-label{font-family:'Bebas Neue',sans-serif;font-size:11px;letter-spacing:.22em;color:var(--muted);text-transform:uppercase;margin-right:8px;min-width:60px}
.filter-pill{background:var(--pill-bg);border:1px solid var(--pill-border);border-radius:30px;padding:7px 14px;font-size:12px;color:var(--muted-strong);transition:all .15s;cursor:pointer;white-space:nowrap}
.filter-pill:hover{border-color:rgba(255,255,255,.25);color:var(--white)}
.filter-pill.active{background:var(--magenta);border-color:var(--magenta);color:var(--navy-deep);font-weight:600}

/* RESULTS HEADER */
.results-section{padding:0 48px 80px}
.results-inner{max-width:1280px;margin:0 auto}
.results-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;padding-bottom:18px;border-bottom:1px solid var(--line)}
.results-count{font-size:14px;color:var(--muted-strong)}
.results-count strong{color:var(--white);font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:.04em;margin-right:6px}
.view-toggle{display:flex;gap:4px;background:var(--pill-bg);border:1px solid var(--pill-border);border-radius:8px;padding:3px}
.view-btn{padding:6px 12px;font-size:11px;color:var(--muted);border-radius:5px;letter-spacing:.1em;text-transform:uppercase;font-family:'Bebas Neue',sans-serif}
.view-btn.active{background:var(--magenta);color:var(--navy-deep);font-weight:700}

/* DASHBOARD ROWS */
.market-overview{padding:0 48px 34px}
.market-overview-inner{max-width:1280px;margin:0 auto;display:grid;grid-template-columns:1.35fr .95fr;gap:16px;align-items:stretch}
.overview-panel,.spotlight-panel,.insights-panel{background:var(--navy-card);border:1px solid var(--pill-border);border-radius:16px;overflow:hidden}
.overview-panel{padding:22px 22px 20px;background:linear-gradient(145deg,rgba(14,29,51,.98),rgba(7,16,29,.98));position:relative}
.overview-panel::before{content:'';position:absolute;inset:-1px;background:radial-gradient(circle at 82% 0%,rgba(236,72,153,.18),transparent 24%),radial-gradient(circle at 100% 100%,rgba(77,184,255,.13),transparent 30%);pointer-events:none}
.overview-kicker{font-family:'Bebas Neue',sans-serif;font-size:11px;letter-spacing:.22em;color:var(--magenta);text-transform:uppercase;margin-bottom:10px;position:relative;z-index:1}
.overview-title{font-family:'Bebas Neue',sans-serif;font-size:38px;line-height:.92;text-transform:uppercase;letter-spacing:-.01em;position:relative;z-index:1}
.overview-title .magenta{color:var(--magenta)}
.overview-copy{margin-top:12px;max-width:700px;color:var(--muted-strong);position:relative;z-index:1}
.overview-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px;position:relative;z-index:1}
.overview-cta{background:var(--magenta);color:var(--navy-deep);font-family:'Bebas Neue',sans-serif;font-size:12px;letter-spacing:.15em;padding:10px 16px;border-radius:8px;text-transform:uppercase;font-weight:700}
.overview-ghost{border:1px solid var(--pill-border);border-radius:8px;padding:10px 16px;color:var(--muted-strong);font-family:'Bebas Neue',sans-serif;font-size:12px;letter-spacing:.12em;text-transform:uppercase}
.stat-strip{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:18px;position:relative;z-index:1}
.stat-card{background:rgba(255,255,255,.03);border:1px solid var(--pill-border);border-radius:12px;padding:14px}
.stat-label{font-family:'Bebas Neue',sans-serif;font-size:10px;letter-spacing:.18em;color:var(--muted);text-transform:uppercase;margin-bottom:8px}
.stat-value{font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:.02em;color:var(--white);line-height:1}
.stat-sub{font-size:12px;color:var(--muted);margin-top:6px}
.spotlight-panel{padding:18px}
.spotlight-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px}
.spotlight-head h2{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:.03em;text-transform:uppercase}
.spotlight-pills{display:flex;gap:6px;flex-wrap:wrap}
.spotlight-pill{background:var(--pill-bg);border:1px solid var(--pill-border);border-radius:999px;padding:7px 12px;font-size:11px;color:var(--muted-strong);font-family:'Bebas Neue',sans-serif;letter-spacing:.1em;text-transform:uppercase}
.spotlight-pill.magenta{background:var(--magenta);color:var(--navy-deep);border-color:var(--magenta)}
.spotlight-grid{display:grid;grid-template-columns:1fr;gap:12px}
.spot-card{padding:14px;border:1px solid var(--pill-border);border-radius:12px;background:rgba(255,255,255,.03)}
.spot-card-top{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px}
.spot-card-title{font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:.03em;text-transform:uppercase}
.spot-card-meta{font-size:12px;color:var(--muted)}
.spot-card-row{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:8px;padding-top:10px;border-top:1px solid var(--line)}
.spot-card-value{font-family:'Bebas Neue',sans-serif;font-size:24px;color:var(--magenta);line-height:1}
.insights-panel{padding:18px;margin:0 48px 26px;max-width:1280px;overflow:hidden}
.insights-inner{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.insight-box{padding:16px;border:1px solid var(--pill-border);border-radius:12px;background:rgba(255,255,255,.03)}
.insight-title{font-family:'Bebas Neue',sans-serif;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);margin-bottom:8px}
.insight-copy{font-size:13px;color:var(--muted-strong);line-height:1.55}
.insight-copy strong{color:var(--white)}
.seller-list{margin-top:12px;display:flex;flex-wrap:wrap;gap:8px}
.seller-chip{padding:8px 12px;border-radius:999px;background:var(--pill-bg);border:1px solid var(--pill-border);font-size:12px;color:var(--muted-strong)}
.seller-chip strong{color:var(--white)}

/* GAME GRID */
.game-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.game-card{background:var(--navy-card);border:1px solid var(--pill-border);border-radius:14px;overflow:hidden;transition:all .25s;cursor:pointer;text-decoration:none;color:inherit;display:flex;flex-direction:column}
.game-card:hover{transform:translateY(-3px);border-color:var(--magenta);box-shadow:0 12px 40px rgba(236,72,153,.15)}
.game-thumb{aspect-ratio:16/9;position:relative;overflow:hidden;background:linear-gradient(135deg,#1a2c4a,#0e1d33)}
.game-thumb::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at var(--gx,30%) 40%,rgba(236,72,153,.22) 0%,transparent 55%),radial-gradient(circle at 75% 75%,rgba(77,184,255,.15) 0%,transparent 50%)}
.game-thumb::after{content:'';position:absolute;left:0;right:0;bottom:0;height:60%;background:linear-gradient(180deg,transparent,rgba(5,11,22,.85))}
.game-thumb-content{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:space-between;padding:14px;z-index:1}
.game-tags{display:flex;gap:6px;flex-wrap:wrap}
.game-tag{background:rgba(0,0,0,.55);backdrop-filter:blur(6px);font-size:9px;letter-spacing:.15em;text-transform:uppercase;padding:5px 9px;border-radius:4px;font-family:'Bebas Neue',sans-serif;color:#fff}
.game-tag.live{background:var(--magenta);color:var(--navy-deep);font-weight:700}
.game-tag.hot{background:var(--gold);color:var(--navy-deep);font-weight:700}
.game-tag.sr{background:rgba(77,184,255,.85);color:var(--navy-deep)}
.game-tag.sm{background:rgba(255,120,73,.85);color:var(--navy-deep)}
.game-tag.bc{background:rgba(95,217,156,.85);color:var(--navy-deep)}
.game-clipcount{align-self:flex-end;font-family:'Bebas Neue',sans-serif;font-size:14px;letter-spacing:.06em;color:#fff;background:rgba(0,0,0,.5);backdrop-filter:blur(6px);padding:6px 12px;border-radius:6px}
.game-clipcount strong{color:var(--magenta);font-size:18px;margin-right:4px}
.game-info{padding:16px 18px 18px;flex:1;display:flex;flex-direction:column}
.game-name{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:.02em;line-height:1.1;margin-bottom:6px;text-transform:uppercase}
.game-meta{font-size:12px;color:var(--muted);margin-bottom:14px}
.game-meta .dot{color:var(--magenta);margin:0 6px}
.game-bottom{display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid var(--line);margin-top:auto}
.game-seller{font-size:11px;color:var(--muted)}
.game-seller strong{color:var(--white);font-weight:600}
.game-arrow{font-size:18px;color:var(--magenta)}

/* PAGINATION */
.pagination{margin-top:48px;display:flex;justify-content:center;align-items:center;gap:8px}
.pg-btn{padding:10px 16px;font-size:13px;border:1px solid var(--pill-border);border-radius:8px;background:var(--pill-bg);color:var(--muted-strong);font-family:'Bebas Neue',sans-serif;letter-spacing:.1em;text-transform:uppercase;transition:all .2s}
.pg-btn:hover{border-color:var(--magenta);color:var(--magenta)}
.pg-btn.active{background:var(--magenta);color:var(--navy-deep);border-color:var(--magenta);font-weight:700}
.pg-btn:disabled{opacity:.4;cursor:not-allowed}
.pg-info{font-size:12px;color:var(--muted);margin:0 12px}

/* FOOTER */
footer{background:var(--navy-deep);padding:48px 48px 30px;border-top:1px solid var(--line);margin-top:40px}
.footer-inner{max-width:1280px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;font-size:11px;color:var(--muted);letter-spacing:.12em;text-transform:uppercase}
.footer-inner .magenta-text{color:var(--magenta)}

@media(max-width:1024px){
  .market-overview-inner,.insights-inner{grid-template-columns:1fr}
  .stat-strip{grid-template-columns:repeat(2,1fr)}
  .game-grid{grid-template-columns:repeat(2,1fr)}
  .page-title{font-size:48px}
  .search-bar{grid-template-columns:1fr}
}
@media(max-width:640px){
  .nav{padding:14px 20px}
  .nav-links{display:none}
  .page-header,.search-section,.filter-section,.results-section,footer{padding-left:20px;padding-right:20px}
  .market-overview,.insights-panel{padding-left:20px;padding-right:20px}
  .page-title{font-size:38px}
  .game-grid{grid-template-columns:1fr}
  .filter-row{overflow-x:auto;flex-wrap:nowrap;padding-bottom:6px;-webkit-overflow-scrolling:touch}
  .filter-row::-webkit-scrollbar{display:none}
  .footer-inner{flex-direction:column;gap:12px;text-align:center}
}
</style>
</head>
<body>

<!-- NAV -->
<nav class="nav">
  <a href="Subjectreport.html" class="nav-logo">
    <span class="nav-logo-mark">G</span>
    GROUNDFLOOR<span>SPORTS</span>
  </a>
  <div class="nav-links">
    <a href="marketplace.html" class="nav-link active">Marketplace</a>
    <a href="/athletes" class="nav-link">Athletes</a>
    <a href="/nft" class="nav-link">NFT Drops</a>
    <a href="/brands" class="nav-link">For Brands</a>
    <a href="sign-in.html" class="nav-link">Sign In</a>
    <a href="/sell" class="nav-cta">List Your Footage</a>
  </div>
</nav>

<!-- PAGE HEADER -->
<header class="page-header">
  <div class="page-header-inner">
    <div class="page-eyebrow">The Marketplace</div>
    <h1 class="page-title">Find your <span class="magenta">game.</span></h1>
    <p class="page-sub">Browse highlights from every game on the platform. Search by team, school, jersey number, or event. Every clip is listed by the original capture brand - Subject Report, Subject Media, Blu Chips, or approved event circuits.</p>
  </div>
</header>

<!-- OVERVIEW -->
<section class="market-overview">
  <div class="market-overview-inner">
    <div class="overview-panel">
      <div class="overview-kicker">Live marketplace snapshot</div>
      <div class="overview-title">Built for coaches, parents, and athletes who need <span class="magenta">fast access</span> to the right footage.</div>
      <p class="overview-copy">This marketplace is designed to convert browsing into clip purchases quickly. Every game card carries seller, date, and clip count details so users can move from discovery to checkout with fewer clicks.</p>
      <div class="overview-actions">
        <a href="#results" class="overview-cta">Browse games</a>
        <a href="template-preview.html" class="overview-ghost">View athlete template</a>
      </div>
      <div class="stat-strip">
        <div class="stat-card">
          <div class="stat-label">Total Clips</div>
          <div class="stat-value">4,218</div>
          <div class="stat-sub">Video + photo assets live</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Games Live</div>
          <div class="stat-value">96</div>
          <div class="stat-sub">Across all sellers</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Featured Sellers</div>
          <div class="stat-value">4</div>
          <div class="stat-sub">Subject Report, Media, Blu Chips, Pylon</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Buy Flow</div>
          <div class="stat-value">1 Click</div>
          <div class="stat-sub">Find, preview, purchase</div>
        </div>
      </div>
    </div>

    <aside class="spotlight-panel">
      <div class="spotlight-head">
        <h2>Featured drops</h2>
        <div class="spotlight-pills">
          <span class="spotlight-pill magenta">Hot</span>
          <span class="spotlight-pill">New</span>
        </div>
      </div>
      <div class="spotlight-grid">
        <div class="spot-card">
          <div class="spot-card-top">
            <div>
              <div class="spot-card-title">Allen vs Plano East</div>
              <div class="spot-card-meta">Live game coverage · Subject Report</div>
            </div>
            <div class="spot-card-value">142</div>
          </div>
          <div class="spot-card-row">
            <span class="spot-card-meta">Instant clip access</span>
            <span class="game-tag live">Live</span>
          </div>
        </div>
        <div class="spot-card">
          <div class="spot-card-top">
            <div>
              <div class="spot-card-title">Blu Chips TX Combine</div>
              <div class="spot-card-meta">High-volume athlete capture</div>
            </div>
            <div class="spot-card-value">342</div>
          </div>
          <div class="spot-card-row">
            <span class="spot-card-meta">180 athletes</span>
            <span class="game-tag hot">Hot</span>
          </div>
        </div>
        <div class="spot-card">
          <div class="spot-card-top">
            <div>
              <div class="spot-card-title">SR Spring Camp</div>
              <div class="spot-card-meta">Recruiting-ready camp content</div>
            </div>
            <div class="spot-card-value">218</div>
          </div>
          <div class="spot-card-row">
            <span class="spot-card-meta">110 players tracked</span>
            <span class="game-tag sr">Subject Report</span>
          </div>
        </div>
      </div>
    </aside>
  </div>
</section>

<section class="insights-panel">
  <div class="insights-inner">
    <div class="insight-box">
      <div class="insight-title">Search behavior</div>
      <div class="insight-copy">Players and families search by <strong>jersey number</strong>, <strong>team</strong>, and <strong>school</strong> to find their exact game footage faster.</div>
    </div>
    <div class="insight-box">
      <div class="insight-title">Seller network</div>
      <div class="insight-copy">The marketplace supports multiple capture brands so the platform can scale with partner events while keeping every listing consistent.</div>
      <div class="seller-list">
        <span class="seller-chip"><strong>SR</strong> Subject Report</span>
        <span class="seller-chip"><strong>SM</strong> Subject Media</span>
        <span class="seller-chip"><strong>BC</strong> Blu Chips</span>
        <span class="seller-chip"><strong>PY</strong> Pylon</span>
      </div>
    </div>
    <div class="insight-box">
      <div class="insight-title">Conversion path</div>
      <div class="insight-copy">The page is organized to move a visitor from <strong>browse</strong> to <strong>game detail</strong> to <strong>checkout</strong> with fewer friction points and a stronger featured-first layout.</div>
    </div>
  </div>
</section>

<!-- SEARCH BAR -->
<div class="search-section">
  <div class="search-inner">
    <div class="search-bar">
      <input type="text" class="search-input" placeholder="Search by jersey number or player name (e.g. #7 or Holloway)" aria-label="Player or jersey search">
      <input type="text" class="search-input" placeholder="Team or school (e.g. Allen, Westlake)" aria-label="Team search">
      <button class="search-btn">Find My Clips <span class="arrow">-></span></button>
    </div>
  </div>
</div>

<!-- FILTERS -->
<section class="filter-section">
  <div class="filter-inner">
    <div class="filter-row">
      <span class="filter-label">Sport</span>
      <button class="filter-pill active">All Sports</button>
      <button class="filter-pill">Football</button>
      <button class="filter-pill">7v7</button>
      <button class="filter-pill">Combines</button>
      <button class="filter-pill">Camps</button>
      <button class="filter-pill">Basketball</button>
    </div>
    <div class="filter-row">
      <span class="filter-label">Dates</span>
      <button class="filter-pill active">All Dates</button>
      <button class="filter-pill">Last 7 Days</button>
      <button class="filter-pill">Last 30 Days</button>
      <button class="filter-pill">This Season</button>
      <button class="filter-pill">Upcoming</button>
    </div>
    <div class="filter-row">
      <span class="filter-label">Sort</span>
      <button class="filter-pill active">Most Recent</button>
      <button class="filter-pill">Most Clips</button>
      <button class="filter-pill">Price: Low -> High</button>
      <button class="filter-pill">Price: High -> Low</button>
    </div>
    <div class="filter-row">
      <span class="filter-label">Media</span>
      <button class="filter-pill active">All Media</button>
      <button class="filter-pill">Videos Only</button>
      <button class="filter-pill">Photos Only</button>
      <button class="filter-pill">NFTs Only</button>
    </div>
  </div>
</section>

<!-- RESULTS -->
<section class="results-section" id="results">
  <div class="results-inner">
    <div class="results-header">
      <div class="results-count">
        <strong>4,218</strong> clips - <strong>312</strong> photos across <strong>96</strong> games
      </div>
      <div class="view-toggle">
        <button class="view-btn active">Grid</button>
        <button class="view-btn">List</button>
      </div>
    </div>

    <div class="game-grid">

      <a href="/marketplace/games/2026-10-18-allen-vs-plano-east" class="game-card">
        <div class="game-thumb" style="--gx:25%">
          <div class="game-thumb-content">
            <div class="game-tags">
              <span class="game-tag live">Live</span>
              <span class="game-tag sr">Subject Report</span>
            </div>
            <div class="game-clipcount"><strong>142</strong>clips</div>
          </div>
        </div>
        <div class="game-info">
          <div class="game-name">Allen vs Plano East</div>
          <div class="game-meta">Oct 18, 2026<span class="dot">.</span>Friday Night HS<span class="dot">.</span>District 6-6A</div>
          <div class="game-bottom">
            <div class="game-seller">listed by <strong>Subject Report</strong></div>
            <span class="game-arrow">-></span>
          </div>
        </div>
      </a>

      <a href="/marketplace/games/2026-10-18-westlake-vs-lake-travis" class="game-card">
        <div class="game-thumb" style="--gx:55%">
          <div class="game-thumb-content">
            <div class="game-tags">
              <span class="game-tag hot">Hot</span>
              <span class="game-tag sm">Subject Media</span>
            </div>
            <div class="game-clipcount"><strong>128</strong>clips</div>
          </div>
        </div>
        <div class="game-info">
          <div class="game-name">Westlake vs Lake Travis</div>
          <div class="game-meta">Oct 18, 2026<span class="dot">.</span>Battle of the Lakes</div>
          <div class="game-bottom">
            <div class="game-seller">listed by <strong>Subject Media</strong></div>
            <span class="game-arrow">-></span>
          </div>
        </div>
      </a>

      <a href="/marketplace/games/2026-10-17-duncanville-vs-desoto" class="game-card">
        <div class="game-thumb" style="--gx:40%">
          <div class="game-thumb-content">
            <div class="game-tags">
              <span class="game-tag sr">Subject Report</span>
            </div>
            <div class="game-clipcount"><strong>156</strong>clips</div>
          </div>
        </div>
        <div class="game-info">
          <div class="game-name">Duncanville vs DeSoto</div>
          <div class="game-meta">Oct 17, 2026<span class="dot">.</span>Friday Night HS</div>
          <div class="game-bottom">
            <div class="game-seller">listed by <strong>Subject Report</strong></div>
            <span class="game-arrow">-></span>
          </div>
        </div>
      </a>

      <a href="/marketplace/games/2026-10-12-pylon-7v7-dallas" class="game-card">
        <div class="game-thumb" style="--gx:60%">
          <div class="game-thumb-content">
            <div class="game-tags">
              <span class="game-tag bc">Pylon 7v7</span>
            </div>
            <div class="game-clipcount"><strong>284</strong>clips</div>
          </div>
        </div>
        <div class="game-info">
          <div class="game-name">Pylon 7v7 . Dallas Spring Series</div>
          <div class="game-meta">Oct 12, 2026<span class="dot">.</span>National Circuit<span class="dot">.</span>48 Teams</div>
          <div class="game-bottom">
            <div class="game-seller">listed by <strong>Pylon 7v7</strong></div>
            <span class="game-arrow">-></span>
          </div>
        </div>
      </a>

      <a href="/marketplace/games/2026-10-11-north-shore-vs-galena-park" class="game-card">
        <div class="game-thumb" style="--gx:35%">
          <div class="game-thumb-content">
            <div class="game-tags">
              <span class="game-tag sr">Subject Report</span>
            </div>
            <div class="game-clipcount"><strong>119</strong>clips</div>
          </div>
        </div>
        <div class="game-info">
          <div class="game-name">North Shore vs Galena Park</div>
          <div class="game-meta">Oct 11, 2026<span class="dot">.</span>Houston Area<span class="dot">.</span>21-6A</div>
          <div class="game-bottom">
            <div class="game-seller">listed by <strong>Subject Report</strong></div>
            <span class="game-arrow">-></span>
          </div>
        </div>
      </a>

      <a href="/marketplace/games/2026-10-11-aledo-vs-wylie-east" class="game-card">
        <div class="game-thumb" style="--gx:50%">
          <div class="game-thumb-content">
            <div class="game-tags">
              <span class="game-tag sm">Subject Media</span>
            </div>
            <div class="game-clipcount"><strong>87</strong>clips</div>
          </div>
        </div>
        <div class="game-info">
          <div class="game-name">Aledo vs Wylie East</div>
          <div class="game-meta">Oct 11, 2026<span class="dot">.</span>Friday Night HS</div>
          <div class="game-bottom">
            <div class="game-seller">listed by <strong>Subject Media</strong></div>
            <span class="game-arrow">-></span>
          </div>
        </div>
      </a>

      <a href="/marketplace/games/2026-10-05-blu-chips-tx-combine" class="game-card">
        <div class="game-thumb" style="--gx:45%">
          <div class="game-thumb-content">
            <div class="game-tags">
              <span class="game-tag hot">Hot</span>
              <span class="game-tag bc">Blu Chips</span>
            </div>
            <div class="game-clipcount"><strong>342</strong>clips</div>
          </div>
        </div>
        <div class="game-info">
          <div class="game-name">Blu Chips TX Combine . Dallas</div>
          <div class="game-meta">Oct 5, 2026<span class="dot">.</span>Combine<span class="dot">.</span>180 Athletes</div>
          <div class="game-bottom">
            <div class="game-seller">listed by <strong>Blu Chips</strong></div>
            <span class="game-arrow">-></span>
          </div>
        </div>
      </a>

      <a href="/marketplace/games/2026-10-04-highland-park-vs-mckinney" class="game-card">
        <div class="game-thumb" style="--gx:55%">
          <div class="game-thumb-content">
            <div class="game-tags">
              <span class="game-tag sr">Subject Report</span>
            </div>
            <div class="game-clipcount"><strong>96</strong>clips</div>
          </div>
        </div>
        <div class="game-info">
          <div class="game-name">Highland Park vs McKinney</div>
          <div class="game-meta">Oct 4, 2026<span class="dot">.</span>Friday Night HS</div>
          <div class="game-bottom">
            <div class="game-seller">listed by <strong>Subject Report</strong></div>
            <span class="game-arrow">-></span>
          </div>
        </div>
      </a>

      <a href="/marketplace/games/2026-09-28-sr-spring-camp-dallas" class="game-card">
        <div class="game-thumb" style="--gx:30%">
          <div class="game-thumb-content">
            <div class="game-tags">
              <span class="game-tag sr">Subject Report</span>
            </div>
            <div class="game-clipcount"><strong>218</strong>clips</div>
          </div>
        </div>
        <div class="game-info">
          <div class="game-name">SR Spring Camp . Dallas</div>
          <div class="game-meta">Sep 28, 2026<span class="dot">.</span>SR-Hosted Camp<span class="dot">.</span>110 Players</div>
          <div class="game-bottom">
            <div class="game-seller">listed by <strong>Subject Report</strong></div>
            <span class="game-arrow">-></span>
          </div>
        </div>
      </a>

      <a href="/marketplace/games/2026-09-27-cedar-hill-vs-mansfield" class="game-card">
        <div class="game-thumb" style="--gx:45%">
          <div class="game-thumb-content">
            <div class="game-tags">
              <span class="game-tag sm">Subject Media</span>
            </div>
            <div class="game-clipcount"><strong>104</strong>clips</div>
          </div>
        </div>
        <div class="game-info">
          <div class="game-name">Cedar Hill vs Mansfield Lake Ridge</div>
          <div class="game-meta">Sep 27, 2026<span class="dot">.</span>Friday Night HS</div>
          <div class="game-bottom">
            <div class="game-seller">listed by <strong>Subject Media</strong></div>
            <span class="game-arrow">-></span>
          </div>
        </div>
      </a>

      <a href="/marketplace/games/2026-09-21-southlake-carroll-vs-keller" class="game-card">
        <div class="game-thumb" style="--gx:40%">
          <div class="game-thumb-content">
            <div class="game-tags">
              <span class="game-tag sr">Subject Report</span>
            </div>
            <div class="game-clipcount"><strong>134</strong>clips</div>
          </div>
        </div>
        <div class="game-info">
          <div class="game-name">Southlake Carroll vs Keller</div>
          <div class="game-meta">Sep 21, 2026<span class="dot">.</span>Friday Night HS</div>
          <div class="game-bottom">
            <div class="game-seller">listed by <strong>Subject Report</strong></div>
            <span class="game-arrow">-></span>
          </div>
        </div>
      </a>

      <a href="/marketplace/games/2026-09-20-katy-vs-katy-tompkins" class="game-card">
        <div class="game-thumb" style="--gx:50%">
          <div class="game-thumb-content">
            <div class="game-tags">
              <span class="game-tag sm">Subject Media</span>
            </div>
            <div class="game-clipcount"><strong>78</strong>clips</div>
          </div>
        </div>
        <div class="game-info">
          <div class="game-name">Katy vs Katy Tompkins</div>
          <div class="game-meta">Sep 20, 2026<span class="dot">.</span>Houston District</div>
          <div class="game-bottom">
            <div class="game-seller">listed by <strong>Subject Media</strong></div>
            <span class="game-arrow">-></span>
          </div>
        </div>
      </a>

    </div>


    <div class="pagination">
      <button class="pg-btn" disabled><- Prev</button>
      <button class="pg-btn active">1</button>
      <button class="pg-btn">2</button>
      <button class="pg-btn">3</button>
      <button class="pg-btn">4</button>
      <span class="pg-info">of 8</span>
      <button class="pg-btn">Next -></button>
    </div>
  </div>
</section>

<footer>
  <div class="footer-inner">
    <div>&copy; 2026 GroundfloorSports . <span class="magenta-text">A Subject Ecosystem Brand</span></div>
    <div>Terms . Privacy . NIL Policy . Help</div>
  </div>
</footer>


<script>
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
    const isFilePreview = window.location.protocol === 'file:';
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


    function enableStaticPreviewRouting() {
      if (!isFilePreview) return;

      const navMap = {
        '/athletes': 'preview-route.html?path=%2Fathletes',
        '/nft': 'preview-route.html?path=%2Fnft',
        '/brands': 'preview-route.html?path=%2Fbrands',
        '/sell': 'preview-route.html?path=%2Fsell'
      };

      const logoLink = document.querySelector('.nav-logo');
      if (logoLink) {
        logoLink.setAttribute('href', 'Subjectreport.html');
      }

      document.querySelectorAll('.nav a[href^="/"]').forEach((link) => {
        const href = link.getAttribute('href') || '';
        if (navMap[href]) {
          link.setAttribute('href', navMap[href]);
        }
      });

      cards.forEach((card) => {
        const originalHref = card.getAttribute('href') || '';
        const slug = originalHref.split('/').filter(Boolean).pop() || '';
        const name = (card.querySelector('.game-name')?.textContent || '').trim();
        const meta = (card.querySelector('.game-meta')?.textContent || '').replace(/\s+/g, ' ').trim();
        const seller = (card.querySelector('.game-seller strong')?.textContent || '').trim();
        const clips = String(card._meta?.clips || 0);

        const params = new URLSearchParams({
          slug,
          title: name,
          meta,
          seller,
          clips
        });

        card.setAttribute('href', `marketplace-game-preview.html?${params.toString()}`);
      });
    }
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

      if (sort === 'Most Clips') {
        filtered = filtered.slice().sort((a, b) => b._meta.clips - a._meta.clips);
      } else {
        filtered = filtered.slice().sort((a, b) => b._meta.date - a._meta.date);
      }

      const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
      if (currentPage > totalPages) currentPage = totalPages;

      const start = (currentPage - 1) * pageSize;
      const visible = new Set(filtered.slice(start, start + pageSize));

      cards.forEach((card) => {
        card.style.display = visible.has(card) ? '' : 'none';
      });

      filtered.forEach((card) => gameGrid.appendChild(card));

      const clipTotal = filtered.reduce((sum, card) => sum + card._meta.clips, 0);
      resultsCount.innerHTML = `<strong>${clipTotal.toLocaleString()}</strong> clips across <strong>${filtered.length}</strong> games`;

      if (emptyState) {
        emptyState.style.display = filtered.length ? 'none' : 'block';
      }

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

    enableStaticPreviewRouting();
    applyFilters();
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
# Marketplace Full Source Review Packet

## Source File
- marketplace.html

## Full HTML Source
`html



---

## Source Packet: claude-review-sign-in-full-source.md

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sign In - GroundfloorSports</title>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
<!--
  GFS Sign-In Page
  Static HTML prototype. Designed for Clerk integration.

  Engineer notes:
  - Page route: /sign-in
  - Clerk components map: <SignIn /> from @clerk/nextjs replaces the form
  - Brand panel on left stays as marketing surface
  - Form on right is the Clerk mounting point
  - Add Clerk SDK provider in layout and replace .auth-form div with <SignIn appearance={...} />
  - Email/phone toggle, passkey, password reset all handled by Clerk natively
-->
<style>
:root{
  --navy:#0a1628;--navy-deep:#050b16;--navy-card:#0e1d33;
  --magenta:#ec4899;--magenta-light:#f472b6;--magenta-dim:rgba(236,72,153,.18);
  --blue:#4db8ff;--coral:#ff7849;--gold:#d4a84a;
  --white:#fff;--muted:rgba(255,255,255,.62);--muted-strong:rgba(255,255,255,.82);
  --line:rgba(255,255,255,.1);--pill-bg:rgba(255,255,255,.04);--pill-border:rgba(255,255,255,.14);
  --input-bg:rgba(255,255,255,.04);--input-border:rgba(255,255,255,.14);
}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'DM Sans',sans-serif;color:var(--white);background:var(--navy-deep);line-height:1.55;min-height:100vh}
a{text-decoration:none;color:inherit}
button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit}
input{font-family:inherit;outline:none}

.page{min-height:100vh;display:grid;grid-template-columns:1.1fr 1fr}

/* LEFT - Brand panel */
.brand-panel{position:relative;padding:60px 56px;display:flex;flex-direction:column;justify-content:space-between;background:
  radial-gradient(ellipse 700px 500px at 30% 30%,rgba(236,72,153,.20) 0%,transparent 60%),
  radial-gradient(ellipse 500px 400px at 80% 80%,rgba(77,184,255,.10) 0%,transparent 50%),
  linear-gradient(135deg,var(--navy-deep) 0%,var(--navy) 100%);
  overflow:hidden}
.brand-panel::before{content:'';position:absolute;top:-100px;right:-100px;width:400px;height:400px;background:radial-gradient(circle,rgba(236,72,153,.15),transparent 70%);pointer-events:none}
.brand-logo{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:.08em;display:flex;align-items:center;gap:10px;position:relative;z-index:2}
.brand-logo span{color:var(--magenta)}
.brand-logo-mark{width:32px;height:32px;border:2px solid var(--magenta);border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--magenta);font-size:14px;background:rgba(236,72,153,.08)}

.brand-hero{position:relative;z-index:2;max-width:520px}
.brand-eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:11px;letter-spacing:.25em;color:var(--magenta);text-transform:uppercase;font-weight:700;margin-bottom:24px;padding:7px 13px;border:1px solid var(--magenta);border-radius:30px;background:rgba(236,72,153,.06)}
.brand-eyebrow::before{content:'';width:6px;height:6px;background:var(--magenta);border-radius:50%;box-shadow:0 0 12px var(--magenta)}
.brand-headline{font-family:'Bebas Neue',sans-serif;font-size:88px;line-height:.88;letter-spacing:-.005em;text-transform:uppercase;margin-bottom:22px}
.brand-headline .magenta{color:var(--magenta)}
.brand-sub{font-size:16px;color:var(--muted-strong);line-height:1.55;max-width:440px;margin-bottom:32px}

/* Floating cards in brand panel */
.float-cards{position:relative;height:240px;margin-top:8px}
.float-card{position:absolute;background:var(--navy-card);border:1px solid var(--pill-border);border-radius:14px;padding:14px 16px;width:280px;backdrop-filter:blur(20px);box-shadow:0 16px 40px rgba(0,0,0,.4)}
.fc1{top:0;left:0;transform:rotate(-3deg);border-color:var(--magenta)}
.fc2{top:80px;left:120px;transform:rotate(2deg);z-index:2}
.float-card-name{font-family:'Bebas Neue',sans-serif;font-size:15px;letter-spacing:.04em;margin-bottom:3px;line-height:1.05}
.float-card-meta{font-size:10px;color:var(--muted);margin-bottom:8px}
.float-card-bottom{display:flex;justify-content:space-between;align-items:baseline;padding-top:8px;border-top:1px solid var(--line);font-size:9px;letter-spacing:.18em;color:var(--muted);text-transform:uppercase}
.float-card-price{font-family:'Bebas Neue',sans-serif;font-size:18px;color:var(--magenta);letter-spacing:.04em}

.brand-footer{position:relative;z-index:2;font-size:11px;color:var(--muted);letter-spacing:.18em;text-transform:uppercase}

/* RIGHT - Auth form */
.auth-panel{padding:60px 56px;display:flex;flex-direction:column;justify-content:center;background:var(--navy)}
.auth-form{max-width:420px;margin:0 auto;width:100%}
.auth-header{margin-bottom:32px}
.auth-eyebrow{font-size:11px;letter-spacing:.28em;color:var(--magenta);text-transform:uppercase;font-weight:700;margin-bottom:10px}
.auth-title{font-family:'Bebas Neue',sans-serif;font-size:44px;line-height:1;letter-spacing:-.005em;margin-bottom:10px;text-transform:uppercase}
.auth-sub{font-size:14px;color:var(--muted-strong);line-height:1.5}

/* Social */
.social-btns{display:flex;flex-direction:column;gap:10px;margin-bottom:24px}
.social-btn{display:flex;align-items:center;justify-content:center;gap:10px;padding:13px 16px;background:var(--input-bg);border:1px solid var(--input-border);border-radius:10px;font-size:13.5px;color:var(--white);transition:all .2s;width:100%}
.social-btn:hover{border-color:var(--magenta);background:rgba(236,72,153,.04)}
.social-btn svg{width:18px;height:18px}

.divider{display:flex;align-items:center;gap:12px;margin:20px 0;color:var(--muted);font-size:11px;letter-spacing:.2em;text-transform:uppercase}
.divider::before,.divider::after{content:'';flex:1;height:1px;background:var(--line)}

/* Form fields */
.field{margin-bottom:16px}
.field-label{display:flex;justify-content:space-between;align-items:center;font-size:11px;letter-spacing:.18em;color:var(--muted);text-transform:uppercase;font-weight:600;margin-bottom:7px}
.field-label .toggle{color:var(--magenta);font-size:10px;cursor:pointer;transition:color .2s}
.field-label .toggle:hover{color:var(--magenta-light)}
.input{width:100%;padding:13px 16px;background:var(--input-bg);border:1px solid var(--input-border);border-radius:10px;color:var(--white);font-size:14px;transition:border-color .2s}
.input:focus{border-color:var(--magenta);background:rgba(236,72,153,.04)}
.input::placeholder{color:var(--muted)}

.field-helper{display:flex;justify-content:space-between;align-items:center;margin-top:6px;font-size:11px}
.field-helper a{color:var(--magenta);transition:color .2s}
.field-helper a:hover{color:var(--magenta-light)}

/* Submit */
.submit-btn{width:100%;padding:14px 16px;background:var(--magenta);color:var(--navy-deep);font-family:'Bebas Neue',sans-serif;font-size:14px;letter-spacing:.18em;border-radius:10px;text-transform:uppercase;font-weight:700;margin-top:8px;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 0 30px rgba(236,72,153,.3)}
.submit-btn:hover{background:var(--magenta-light);transform:translateY(-1px);box-shadow:0 4px 30px rgba(236,72,153,.45)}
.submit-btn .arrow{font-size:16px}

/* Footer */
.auth-footer{margin-top:24px;text-align:center;font-size:13px;color:var(--muted-strong)}
.auth-footer a{color:var(--magenta);font-weight:600;transition:color .2s}
.auth-footer a:hover{color:var(--magenta-light)}
.secured-by{margin-top:28px;text-align:center;font-size:10px;color:var(--muted);letter-spacing:.18em;text-transform:uppercase}
.secured-by strong{color:var(--muted-strong);font-weight:600}

/* Mobile */
@media(max-width:900px){
  .page{grid-template-columns:1fr}
  .brand-panel{display:none}
  .auth-panel{padding:40px 24px}
}
</style>
</head>
<body>

<div class="page">

  <!-- BRAND PANEL -->
  <div class="brand-panel">
    <a href="Subjectreport.html" class="brand-logo">
      <span class="brand-logo-mark">G</span>
      GROUNDFLOOR<span>SPORTS</span>
    </a>

    <div class="brand-hero">
      <div class="brand-eyebrow">Welcome back</div>
      <h1 class="brand-headline">Own the<br><span class="magenta">play.</span></h1>
      <p class="brand-sub">Sign in to browse clips, manage your athlete profile, claim NFT drops, or track sales on your seller dashboard.</p>

      <div class="float-cards">
        <div class="float-card fc1">
          <div class="float-card-name">Tre'Sean Holloway</div>
          <div class="float-card-meta">Allen HS . TX . QB . Class of '27</div>
          <div class="float-card-bottom">
            <span>Season Pack</span>
            <span class="float-card-price">$79</span>
          </div>
        </div>
        <div class="float-card fc2">
          <div class="float-card-name">Pylon 7v7 . Dallas</div>
          <div class="float-card-meta">Spring Series . 48 Teams . Event Bundle</div>
          <div class="float-card-bottom">
            <span>Circuit Pack</span>
            <span class="float-card-price">$899</span>
          </div>
        </div>
      </div>
    </div>

    <div class="brand-footer">A Subject Ecosystem Brand . SR . SM . TOJ . GFS</div>
  </div>

  <!-- AUTH PANEL -->
  <div class="auth-panel">
    <div class="auth-form">
      <div class="auth-header">
        <div class="auth-eyebrow">Sign In</div>
        <h2 class="auth-title">Welcome <span style="color:var(--magenta)">back.</span></h2>
        <p class="auth-sub">Sign in to your GroundfloorSports account to continue.</p>
      </div>

      <!-- Social sign-in options (Clerk handles these natively) -->
      <div class="social-btns">
        <button class="social-btn" type="button" data-clerk-provider="google">
          <svg viewBox="0 0 24 24" fill="none"><path d="M22 12.27c0-.78-.07-1.53-.2-2.27H12v4.5h5.62c-.24 1.3-.97 2.4-2.07 3.14v2.6h3.35c1.96-1.8 3.1-4.47 3.1-7.97z" fill="#4285F4"/><path d="M12 22c2.8 0 5.15-.93 6.87-2.52l-3.35-2.6c-.93.62-2.12.99-3.52.99-2.71 0-5-1.83-5.82-4.29H2.74v2.69A10 10 0 0 0 12 22z" fill="#34A853"/><path d="M6.18 13.58A6 6 0 0 1 5.86 12c0-.55.1-1.08.32-1.58V7.73H2.74A10 10 0 0 0 2 12c0 1.61.38 3.14 1.06 4.5l3.12-2.92z" fill="#FBBC05"/><path d="M12 5.94c1.53 0 2.9.52 3.97 1.55l2.97-2.97A9.84 9.84 0 0 0 12 2 10 10 0 0 0 2.74 7.73l3.43 2.69A6 6 0 0 1 12 5.94z" fill="#EA4335"/></svg>
          Continue with Google
        </button>
        <button class="social-btn" type="button" data-clerk-provider="apple">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 12.04c-.03-3 2.45-4.45 2.56-4.52-1.4-2.04-3.57-2.32-4.34-2.35-1.85-.19-3.61 1.09-4.55 1.09-.95 0-2.4-1.06-3.95-1.03C4.7 5.27 2.85 6.43 1.85 8.27c-1.97 3.42-.5 8.46 1.4 11.22.94 1.36 2.04 2.87 3.5 2.82 1.4-.06 1.94-.91 3.64-.91 1.69 0 2.18.91 3.67.88 1.52-.03 2.48-1.37 3.4-2.74 1.07-1.57 1.51-3.1 1.54-3.18-.03-.01-2.97-1.14-3-4.52zM14.5 4.07c.76-.94 1.28-2.23 1.13-3.51-1.1.05-2.43.74-3.22 1.67-.71.82-1.33 2.14-1.17 3.4 1.23.1 2.49-.62 3.26-1.56z"/></svg>
          Continue with Apple
        </button>
      </div>

      <div class="divider">or</div>

      <!-- Email / Password fields -->
      <div class="field">
        <div class="field-label">
          <span>Email address</span>
          <button type="button" class="toggle">Use phone instead</button>
        </div>
        <input type="email" class="input" placeholder="you@example.com" autocomplete="email">
      </div>

      <div class="field">
        <div class="field-label">
          <span>Password</span>
          <button type="button" class="toggle">Use passkey instead</button>
        </div>
        <input type="password" class="input" placeholder="........" autocomplete="current-password">
        <div class="field-helper">
          <span></span>
          <a href="preview-route.html?path=%2Fforgot-password">Forgot password?</a>
        </div>
      </div>

      <button class="submit-btn" type="submit">Sign In <span class="arrow">-></span></button>

      <div class="auth-footer">
        First time here? <a href="sign-up.html">Create an account</a>
      </div>

      <div class="secured-by">Secured by <strong>Clerk</strong></div>
    </div>
  </div>

</div>

<script>
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
# Sign-In Full Source Review Packet

## Source File
- sign-in.html

## Full HTML Source
`html



---

## Source Packet: claude-review-sign-up-full-source.md

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sign Up - GroundfloorSports</title>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
<!--
  GFS Sign-Up Page
  Static HTML prototype. Designed for Clerk integration.

  Engineer notes:
  - Page route: /sign-up
  - Clerk components map: <SignUp /> from @clerk/nextjs replaces the form
  - Account type selector (Fan/Seller/Athlete) drives post-signup routing:
      Fan -> /marketplace
      Seller -> /seller/onboarding (requires Stripe Connect setup)
      Athlete -> /athletes/claim-profile (curation workflow)
  - Store account type as Clerk publicMetadata.role at signup
  - Password validation matches Clerk default policy (8+ chars)
-->
<style>
:root{
  --navy:#0a1628;--navy-deep:#050b16;--navy-card:#0e1d33;
  --magenta:#ec4899;--magenta-light:#f472b6;--magenta-dim:rgba(236,72,153,.18);
  --blue:#4db8ff;--coral:#ff7849;--gold:#d4a84a;
  --white:#fff;--muted:rgba(255,255,255,.62);--muted-strong:rgba(255,255,255,.82);
  --line:rgba(255,255,255,.1);--pill-bg:rgba(255,255,255,.04);--pill-border:rgba(255,255,255,.14);
  --input-bg:rgba(255,255,255,.04);--input-border:rgba(255,255,255,.14);
}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'DM Sans',sans-serif;color:var(--white);background:var(--navy-deep);line-height:1.55;min-height:100vh}
a{text-decoration:none;color:inherit}
button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit}
input,select{font-family:inherit;outline:none}

.page{min-height:100vh;display:grid;grid-template-columns:1.1fr 1fr}

/* LEFT - Brand panel */
.brand-panel{position:relative;padding:60px 56px;display:flex;flex-direction:column;justify-content:space-between;background:
  radial-gradient(ellipse 700px 500px at 30% 30%,rgba(236,72,153,.20) 0%,transparent 60%),
  radial-gradient(ellipse 500px 400px at 80% 80%,rgba(77,184,255,.10) 0%,transparent 50%),
  linear-gradient(135deg,var(--navy-deep) 0%,var(--navy) 100%);
  overflow:hidden}
.brand-panel::before{content:'';position:absolute;top:-100px;right:-100px;width:400px;height:400px;background:radial-gradient(circle,rgba(236,72,153,.15),transparent 70%);pointer-events:none}
.brand-logo{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:.08em;display:flex;align-items:center;gap:10px;position:relative;z-index:2}
.brand-logo span{color:var(--magenta)}
.brand-logo-mark{width:32px;height:32px;border:2px solid var(--magenta);border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--magenta);font-size:14px;background:rgba(236,72,153,.08)}

.brand-hero{position:relative;z-index:2;max-width:520px}
.brand-eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:11px;letter-spacing:.25em;color:var(--magenta);text-transform:uppercase;font-weight:700;margin-bottom:24px;padding:7px 13px;border:1px solid var(--magenta);border-radius:30px;background:rgba(236,72,153,.06)}
.brand-eyebrow::before{content:'';width:6px;height:6px;background:var(--magenta);border-radius:50%;box-shadow:0 0 12px var(--magenta)}
.brand-headline{font-family:'Bebas Neue',sans-serif;font-size:80px;line-height:.9;letter-spacing:-.005em;text-transform:uppercase;margin-bottom:22px}
.brand-headline .magenta{color:var(--magenta)}
.brand-sub{font-size:16px;color:var(--muted-strong);line-height:1.55;max-width:440px;margin-bottom:32px}

.benefits{display:flex;flex-direction:column;gap:14px;margin-top:8px}
.benefit{display:flex;gap:14px;align-items:flex-start}
.benefit-icon{width:36px;height:36px;border-radius:8px;background:rgba(236,72,153,.12);border:1px solid var(--magenta-dim);display:flex;align-items:center;justify-content:center;color:var(--magenta);flex-shrink:0}
.benefit-icon svg{width:18px;height:18px}
.benefit-text{flex:1}
.benefit-title{font-family:'Bebas Neue',sans-serif;font-size:15px;letter-spacing:.04em;margin-bottom:2px}
.benefit-desc{font-size:12px;color:var(--muted);line-height:1.5}

.brand-footer{position:relative;z-index:2;font-size:11px;color:var(--muted);letter-spacing:.18em;text-transform:uppercase}

/* RIGHT - Auth form */
.auth-panel{padding:40px 56px;display:flex;flex-direction:column;justify-content:center;background:var(--navy);overflow-y:auto}
.auth-form{max-width:440px;margin:0 auto;width:100%}
.auth-header{margin-bottom:24px}
.auth-eyebrow{font-size:11px;letter-spacing:.28em;color:var(--magenta);text-transform:uppercase;font-weight:700;margin-bottom:10px}
.auth-title{font-family:'Bebas Neue',sans-serif;font-size:40px;line-height:1;letter-spacing:-.005em;margin-bottom:8px;text-transform:uppercase}
.auth-title .magenta{color:var(--magenta)}
.auth-sub{font-size:14px;color:var(--muted-strong);line-height:1.5}

/* Social */
.social-btns{display:flex;flex-direction:column;gap:10px;margin-bottom:18px}
.social-btn{display:flex;align-items:center;justify-content:center;gap:10px;padding:12px 16px;background:var(--input-bg);border:1px solid var(--input-border);border-radius:10px;font-size:13.5px;color:var(--white);transition:all .2s;width:100%}
.social-btn:hover{border-color:var(--magenta);background:rgba(236,72,153,.04)}
.social-btn svg{width:18px;height:18px}

.divider{display:flex;align-items:center;gap:12px;margin:16px 0;color:var(--muted);font-size:11px;letter-spacing:.2em;text-transform:uppercase}
.divider::before,.divider::after{content:'';flex:1;height:1px;background:var(--line)}

/* Account type selector */
.account-type{margin-bottom:18px}
.account-type-label{font-size:11px;letter-spacing:.18em;color:var(--muted);text-transform:uppercase;font-weight:600;margin-bottom:8px}
.account-type-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px}
.type-card{background:var(--input-bg);border:1px solid var(--input-border);border-radius:9px;padding:11px 8px;cursor:pointer;text-align:center;transition:all .15s}
.type-card:hover{border-color:rgba(255,255,255,.25)}
.type-card.active{border-color:var(--magenta);background:rgba(236,72,153,.06)}
.type-card.active .type-name{color:var(--magenta)}
.type-name{font-family:'Bebas Neue',sans-serif;font-size:12px;letter-spacing:.06em;color:var(--white);margin-bottom:2px}
.type-desc{font-size:9px;color:var(--muted);line-height:1.3}

/* Form fields */
.field-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}
.field{margin-bottom:14px}
.field-label{display:block;font-size:11px;letter-spacing:.18em;color:var(--muted);text-transform:uppercase;font-weight:600;margin-bottom:6px}
.field-label .optional{color:var(--muted);font-size:9px;margin-left:4px;font-weight:400;text-transform:none;letter-spacing:0}
.input{width:100%;padding:12px 14px;background:var(--input-bg);border:1px solid var(--input-border);border-radius:10px;color:var(--white);font-size:14px;transition:border-color .2s}
.input:focus{border-color:var(--magenta);background:rgba(236,72,153,.04)}
.input::placeholder{color:var(--muted)}

.phone-row{display:grid;grid-template-columns:90px 1fr;gap:8px}
.phone-row select{padding:12px 10px;background:var(--input-bg);border:1px solid var(--input-border);border-radius:10px;color:var(--white);font-size:14px;cursor:pointer}

.field-helper{font-size:11px;color:var(--muted);margin-top:6px;line-height:1.4}

/* Submit */
.submit-btn{width:100%;padding:14px 16px;background:var(--magenta);color:var(--navy-deep);font-family:'Bebas Neue',sans-serif;font-size:14px;letter-spacing:.18em;border-radius:10px;text-transform:uppercase;font-weight:700;margin-top:8px;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 0 30px rgba(236,72,153,.3)}
.submit-btn:hover{background:var(--magenta-light);transform:translateY(-1px);box-shadow:0 4px 30px rgba(236,72,153,.45)}
.submit-btn .arrow{font-size:16px}

.terms{font-size:11px;color:var(--muted);text-align:center;margin-top:14px;line-height:1.5}
.terms a{color:var(--magenta);transition:color .2s}
.terms a:hover{color:var(--magenta-light)}

.auth-footer{margin-top:20px;text-align:center;font-size:13px;color:var(--muted-strong)}
.auth-footer a{color:var(--magenta);font-weight:600;transition:color .2s}
.auth-footer a:hover{color:var(--magenta-light)}
.secured-by{margin-top:24px;text-align:center;font-size:10px;color:var(--muted);letter-spacing:.18em;text-transform:uppercase}
.secured-by strong{color:var(--muted-strong);font-weight:600}

/* Mobile */
@media(max-width:900px){
  .page{grid-template-columns:1fr}
  .brand-panel{display:none}
  .auth-panel{padding:30px 24px}
  .field-row{grid-template-columns:1fr}
}
</style>
</head>
<body>

<div class="page">

  <!-- BRAND PANEL -->
  <div class="brand-panel">
    <a href="Subjectreport.html" class="brand-logo">
      <span class="brand-logo-mark">G</span>
      GROUNDFLOOR<span>SPORTS</span>
    </a>

    <div class="brand-hero">
      <div class="brand-eyebrow">Get started</div>
      <h1 class="brand-headline">Every play.<br><span class="magenta">Ownable.</span></h1>
      <p class="brand-sub">Create your account to browse clips, build athlete profiles, claim NFT drops, or list your captured footage.</p>

      <div class="benefits">
        <div class="benefit">
          <div class="benefit-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
          </div>
          <div class="benefit-text">
            <div class="benefit-title">Find Your Clips</div>
            <div class="benefit-desc">Search 4,000+ tagged clips by jersey number, team, or game</div>
          </div>
        </div>
        <div class="benefit">
          <div class="benefit-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
          <div class="benefit-text">
            <div class="benefit-title">Claim NFT Drops</div>
            <div class="benefit-desc">Own commercial-grade moments. Athlete-favored splits.</div>
          </div>
        </div>
        <div class="benefit">
          <div class="benefit-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-9-9c2.5 0 4.8 1 6.5 2.5"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div class="benefit-text">
            <div class="benefit-title">Sell Your Footage</div>
            <div class="benefit-desc">Set your own prices. Single clips, season packs, circuit bundles.</div>
          </div>
        </div>
      </div>
    </div>

    <div class="brand-footer">A Subject Ecosystem Brand . SR . SM . TOJ . GFS</div>
  </div>

  <!-- AUTH PANEL -->
  <div class="auth-panel">
    <div class="auth-form">
      <div class="auth-header">
        <div class="auth-eyebrow">Create Account</div>
        <h2 class="auth-title">Join <span class="magenta">GFS.</span></h2>
        <p class="auth-sub">Set up your account in under a minute. You can upgrade to seller or athlete after.</p>
      </div>

      <!-- Social sign-up options -->
      <div class="social-btns">
        <button class="social-btn" type="button" data-clerk-provider="google">
          <svg viewBox="0 0 24 24" fill="none"><path d="M22 12.27c0-.78-.07-1.53-.2-2.27H12v4.5h5.62c-.24 1.3-.97 2.4-2.07 3.14v2.6h3.35c1.96-1.8 3.1-4.47 3.1-7.97z" fill="#4285F4"/><path d="M12 22c2.8 0 5.15-.93 6.87-2.52l-3.35-2.6c-.93.62-2.12.99-3.52.99-2.71 0-5-1.83-5.82-4.29H2.74v2.69A10 10 0 0 0 12 22z" fill="#34A853"/><path d="M6.18 13.58A6 6 0 0 1 5.86 12c0-.55.1-1.08.32-1.58V7.73H2.74A10 10 0 0 0 2 12c0 1.61.38 3.14 1.06 4.5l3.12-2.92z" fill="#FBBC05"/><path d="M12 5.94c1.53 0 2.9.52 3.97 1.55l2.97-2.97A9.84 9.84 0 0 0 12 2 10 10 0 0 0 2.74 7.73l3.43 2.69A6 6 0 0 1 12 5.94z" fill="#EA4335"/></svg>
          Continue with Google
        </button>
        <button class="social-btn" type="button" data-clerk-provider="apple">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 12.04c-.03-3 2.45-4.45 2.56-4.52-1.4-2.04-3.57-2.32-4.34-2.35-1.85-.19-3.61 1.09-4.55 1.09-.95 0-2.4-1.06-3.95-1.03C4.7 5.27 2.85 6.43 1.85 8.27c-1.97 3.42-.5 8.46 1.4 11.22.94 1.36 2.04 2.87 3.5 2.82 1.4-.06 1.94-.91 3.64-.91 1.69 0 2.18.91 3.67.88 1.52-.03 2.48-1.37 3.4-2.74 1.07-1.57 1.51-3.1 1.54-3.18-.03-.01-2.97-1.14-3-4.52zM14.5 4.07c.76-.94 1.28-2.23 1.13-3.51-1.1.05-2.43.74-3.22 1.67-.71.82-1.33 2.14-1.17 3.4 1.23.1 2.49-.62 3.26-1.56z"/></svg>
          Continue with Apple
        </button>
      </div>

      <div class="divider">or use email</div>

      <!-- Account type selector -->
      <div class="account-type">
        <div class="account-type-label">I'm here to</div>
        <div class="account-type-grid">
          <button type="button" class="type-card active" data-role="fan">
            <div class="type-name">Buy &amp; Browse</div>
            <div class="type-desc">Find clips of my athlete</div>
          </button>
          <button type="button" class="type-card" data-role="athlete">
            <div class="type-name">Claim Profile</div>
            <div class="type-desc">I'm an athlete</div>
          </button>
          <button type="button" class="type-card" data-role="seller">
            <div class="type-name">Sell Footage</div>
            <div class="type-desc">Capture brand or circuit</div>
          </button>
        </div>
      </div>

      <!-- Name fields -->
      <div class="field-row">
        <div class="field">
          <label class="field-label">First name</label>
          <input type="text" class="input" placeholder="First" autocomplete="given-name">
        </div>
        <div class="field">
          <label class="field-label">Last name</label>
          <input type="text" class="input" placeholder="Last" autocomplete="family-name">
        </div>
      </div>

      <!-- Email -->
      <div class="field">
        <label class="field-label">Email address</label>
        <input type="email" class="input" placeholder="you@example.com" autocomplete="email">
      </div>

      <!-- Phone (optional) -->
      <div class="field">
        <label class="field-label">Phone number <span class="optional">(optional)</span></label>
        <div class="phone-row">
          <select aria-label="Country code">
            <option value="+1">+1 US</option>
            <option value="+44">+44 UK</option>
            <option value="+61">+61 AU</option>
            <option value="+1">+1 CA</option>
          </select>
          <input type="tel" class="input" placeholder="(555) 123-4567" autocomplete="tel">
        </div>
      </div>

      <!-- Password -->
      <div class="field">
        <label class="field-label">Password</label>
        <input type="password" class="input" placeholder="........" autocomplete="new-password">
        <div class="field-helper">Must contain 8 or more characters.</div>
      </div>

      <button class="submit-btn" type="submit">Create Account <span class="arrow">-></span></button>

      <div class="terms">
        By signing up, you agree to our <a href="preview-route.html?path=%2Fterms">Terms</a>, <a href="preview-route.html?path=%2Fprivacy">Privacy Policy</a>, and <a href="preview-route.html?path=%2Fnil">NIL Policy</a>.
      </div>

      <div class="auth-footer">
        Already have an account? <a href="sign-in.html">Sign in</a>
      </div>

      <div class="secured-by">Secured by <strong>Clerk</strong></div>
    </div>
  </div>

</div>

<script>
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
# Sign-Up Full Source Review Packet

## Source File
- sign-up.html

## Full HTML Source
`html



---

## Source Packet: claude-review-admin-full-source.md

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Subjectreport Admin · Operations Dashboard</title>
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
    <div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.2em; color: var(--fog); margin-bottom: 32px; text-transform: uppercase;">Admin · Sign in</div>

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
      New here? Create a user account in your Supabase project (<strong style="color: var(--cream-bright);">Authentication → Users → Add user</strong>) then sign in above.
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
      <small>Admin · v1</small>
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
      <div style="padding: 10px 12px; font-size: 11px; color: var(--fog); font-family: 'JetBrains Mono', monospace; letter-spacing: 0.05em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" id="userEmail">—</div>
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
          <div class="sub">Operations command center · <span id="todayDate"></span></div>
        </div>
        <div class="actions">
          <span id="connStatus" class="conn-pill warn" title="Supabase connection status">Checking…</span>
          <button class="btn-primary" onclick="openAddAthlete()">+ New athlete</button>
        </div>
      </div>

      <div class="kpi-row" id="kpiRow">
        <div class="loading">Loading…</div>
      </div>

      <div class="card">
        <div class="card-head">
          <h2>Pipeline · Needs your attention</h2>
          <button class="btn-sm" onclick="showView('athletes')">View all →</button>
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
          <div class="sub" id="athleteCount">—</div>
        </div>
        <div class="actions">
          <button class="btn-sm" onclick="exportAthleteTemplateCSV()">Template CSV</button>
          <button class="btn-sm" onclick="exportCSV()">Export CSV</button>
          <button class="btn-primary" onclick="openAddAthlete()">+ New athlete</button>
        </div>
      </div>

      <div class="card">
        <div class="filters">
          <input type="text" id="searchInput" placeholder="Search by name, email, position…" oninput="renderAthletes()">
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
          <div class="sub">Public ranking board · Preview of what shows on subjectreport.com</div>
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
          <div class="sub" style="font-size: 12px; color: var(--fog);" id="rankCount">—</div>
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
    <button class="close-x" onclick="closeAthleteModal()">×</button>
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
            <option value="">Select…</option>
            <option>QB</option><option>RB</option><option>WR</option><option>TE</option>
            <option>OL</option><option>DL</option><option>LB</option><option>DB</option>
            <option>K/P</option><option>Other</option>
          </select>
        </div>
        <div class="field">
          <label>Class year</label>
          <select id="aClassYear">
            <option value="">Select…</option>
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
            <option value="transcript">Player Transcript · $249</option>
            <option value="program">Recruiting Program · $1,500</option>
            <option value="full">Full Athlete Package · $5,000</option>
            <option value="prospect">Prospect Membership · $99/mo</option>
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
        <textarea id="aNotes" placeholder="Offers on the table, goals, context…"></textarea>
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
      throw new Error("Supabase not configured — see SETUP.md");
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
      toast("Couldn't load athletes — check connection", "err");
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

  // Legacy helper kept for interface compatibility — no-op in Supabase world,
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

    // Pipeline table — athletes that need action
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

    // Activity feed — last 8 updates
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
              <span style="color: var(--fog); margin-left: 8px; font-size: 12px;">${PACKAGE_META[a.package]?.name || "—"}</span>
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
              <td>${PACKAGE_META[a.package]?.name || "—"}</td>
              <td><span class="pill pill-${a.status}">${STATUS_LABELS[a.status]}</span></td>
              <td>${escapeHtml(a.jerseyNumber || "—")}</td>
              <td>${escapeHtml(a.position || "—")}</td>
              <td>${escapeHtml(a.classYear || "—")}</td>
              <td>${a.grade != null && a.grade !== "" ? `<span class="grade">${a.grade}</span>` : '<span class="grade grade-none">—</span>'}</td>
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
              <div class="meta">${escapeHtml(a.position || "—")} · ${escapeHtml(a.classYear || "—")} · ${escapeHtml(a.school || "—")}${a.state ? ", " + escapeHtml(a.state) : ""}</div>
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
      <div class="kpi"><div class="label">ARR (proj.)</div><div class="value">$${arr.toLocaleString()}</div><div class="sub">MRR × 12</div></div>
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
      toast("Save failed — " + err.message, "err");
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
      toast("Delete failed — " + err.message, "err");
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
        toast("CSV import failed — " + err.message, "err");
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
        toast("Import failed — invalid file", "err");
      }
      e.target.value = "";
    };
    reader.readAsText(file);
  }

  async function clearAllData() {
    if (!confirm("Clear ALL athlete data? This cannot be undone. Export first.")) return;
    if (!confirm("Really sure? This deletes every athlete from your Supabase database.")) return;
    try {
      // Delete every row. Supabase requires a filter — use id.neq.__never__ to match all.
      const res = await fetch(`${SUPABASE_URL}/rest/v1/athletes?id=neq.__never__`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      STATE.athletes = [];
      toast("All data cleared");
      showView("dashboard");
    } catch (err) {
      toast("Clear failed — " + err.message, "err");
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
    btn.textContent = "Signing in…";
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


