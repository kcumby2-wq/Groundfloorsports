"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import SiteHeader from '@/components/gfs/SiteHeader';
import SiteFooter from '@/components/gfs/SiteFooter';
import { games as seedGames } from '@/components/gfs/marketplaceData';

const initialDemoClips = seedGames.slice(0, 6).map((game, index) => ({
  id: game.slug,
  gameSlug: game.slug,
  title: game.name,
  seller: game.seller,
  team: game.team,
  jersey: [2, 6, 10, 32, 14, 18][index % 6],
  clips: game.clips,
  price: [12, 16, 18, 14, 20, 15][index % 6],
  status: 'Preview',
  owned: false,
}));

const filterOptions = ['All', 'Football', '7v7', 'Combines', 'Camps'];

export default function DemoPage() {
  const [clips, setClips] = useState(initialDemoClips);
  const [selectedClipId, setSelectedClipId] = useState(initialDemoClips[0]?.id || '');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [ownedIds, setOwnedIds] = useState([]);
  const [uploadForm, setUploadForm] = useState({
    title: 'New Demo Clip',
    seller: 'Subject Report',
    team: 'Allen',
    jersey: '24',
    price: '19',
    sport: 'Football',
  });
  const [demoMessage, setDemoMessage] = useState('Browse clips, upload one, then buy it to move it into the owned library.');

  const selectedClip = clips.find((clip) => clip.id === selectedClipId) || clips[0];

  const visibleClips = useMemo(() => {
    return clips.filter((clip) => {
      const matchesSearch = `${clip.title} ${clip.team} ${clip.seller} ${clip.jersey}`.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'All' || clip.sport === filter;
      return matchesSearch && matchesFilter;
    });
  }, [clips, search, filter]);

  const ownedClips = clips.filter((clip) => ownedIds.includes(clip.id));

  function selectClip(clip) {
    setSelectedClipId(clip.id);
    setDemoMessage(`Selected ${clip.title}. Preview the clip, then buy it to unlock owned access.`);
  }

  function buyClip(clipId) {
    setOwnedIds((current) => (current.includes(clipId) ? current : [...current, clipId]));
    setClips((current) => current.map((clip) => (clip.id === clipId ? { ...clip, owned: true, status: 'Owned' } : clip)));
    setDemoMessage('Purchase complete. The clip moved into the owned library and is now available to stream or download.');
  }

  function addDemoClip(event) {
    event.preventDefault();
    const newClip = {
      id: `demo-${Date.now()}`,
      gameSlug: `demo-${Date.now()}`,
      title: uploadForm.title,
      seller: uploadForm.seller,
      team: uploadForm.team,
      jersey: Number(uploadForm.jersey || '0'),
      clips: 1,
      price: Number(uploadForm.price || '0'),
      sport: uploadForm.sport,
      status: 'Uploaded',
      owned: false,
    };

    setClips((current) => [newClip, ...current]);
    setSelectedClipId(newClip.id);
    setDemoMessage('Upload saved. The new clip is visible in the marketplace demo and ready to purchase.');
  }

  return (
    <main className="gfs-page">
      <SiteHeader active="marketplace" />

      <section className="hero-shell" style={{ maxWidth: 1280 }}>
        <p className="hero-eyebrow">Functional Demo</p>
        <h1 className="hero-title">Browse. Upload. Buy. Own.</h1>
        <p className="hero-sub">
          This is a working product demo built from the current workspace. It uses sample marketplace data,
          local state, and simple interactions so you can click through the full MVP loop without a backend.
        </p>
        <div className="hero-actions">
          <Link href="/marketplace" className="hero-btn primary">Open Marketplace</Link>
          <Link href="/admin.html" className="hero-btn">Open Admin</Link>
          <a href="#demo-upload" className="hero-btn">Add a Clip</a>
        </div>
        <div className="demo-workflow-strip">
          <div className="demo-workflow-step">
            <span>01</span>
            Browse sample clips
          </div>
          <div className="demo-workflow-step">
            <span>02</span>
            Upload a new listing
          </div>
          <div className="demo-workflow-step">
            <span>03</span>
            Buy and unlock access
          </div>
        </div>
      </section>

      <section className="market-overview">
        <div className="market-overview-inner">
          <div className="overview-panel">
            <div className="overview-kicker">Demo loop</div>
            <div className="overview-title">
              Real sample inventory with a <span className="magenta">working buyer flow</span>.
            </div>
            <p className="overview-copy">
              The goal here is simple: prove the product shape. The clip cards are searchable, uploads add a new listing,
              and buying a clip immediately moves it into the owned state.
            </p>
            <div className="overview-actions">
              <button type="button" className="overview-cta" onClick={() => setFilter('All')}>Reset Filters</button>
              <button type="button" className="overview-ghost" onClick={() => buyClip(selectedClip?.id)}>Buy Selected</button>
            </div>
            <div className="stat-strip">
              <div className="stat-card">
                <div className="stat-label">Visible clips</div>
                <div className="stat-value">{visibleClips.length}</div>
                <div className="stat-sub">Search + filter results</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Owned clips</div>
                <div className="stat-value">{ownedClips.length}</div>
                <div className="stat-sub">Unlocked after purchase</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Uploads</div>
                <div className="stat-value">{clips.filter((clip) => clip.status === 'Uploaded').length}</div>
                <div className="stat-sub">Created in the demo</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">MVP focus</div>
                <div className="stat-value">1 Loop</div>
                <div className="stat-sub">Browse → upload → buy</div>
              </div>
            </div>
          </div>

          <aside className="spotlight-panel">
            <div className="spotlight-head">
              <h2>Selected clip</h2>
              <div className="spotlight-pills">
                <span className="spotlight-pill magenta">Live</span>
                <span className="spotlight-pill">Demo</span>
              </div>
            </div>
            <div className="spotlight-grid">
              {selectedClip ? (
                <button type="button" className="spot-card" onClick={() => buyClip(selectedClip.id)}>
                  <div className="demo-preview-frame">
                    <div className="demo-preview-overlay">
                      <span className="spotlight-pill magenta">Preview</span>
                      <span className="spotlight-pill">Instant access</span>
                    </div>
                    <div className="demo-preview-text">
                      <div className="demo-preview-title">{selectedClip.title}</div>
                      <div className="demo-preview-sub">Tap to buy and move this clip into the owned library.</div>
                    </div>
                  </div>
                  <div className="spot-card-top">
                    <div>
                      <div className="spot-card-title">{selectedClip.title}</div>
                      <div className="spot-card-meta">{selectedClip.team} · {selectedClip.seller}</div>
                    </div>
                    <div className="spot-card-value">${selectedClip.price}</div>
                  </div>
                  <div className="spot-card-row">
                    <span className="spot-card-meta">Jersey #{selectedClip.jersey}</span>
                    <span className="spot-card-meta">{selectedClip.owned ? 'Owned' : selectedClip.status}</span>
                  </div>
                  <div className="spot-card-row" style={{ borderTop: 'none', marginTop: 0, paddingTop: 8 }}>
                    <span className="spot-card-meta">Seller: {selectedClip.seller}</span>
                    <span className="spot-card-meta">Click to buy</span>
                  </div>
                </button>
              ) : null}
              <div className="spot-card">
                <div className="spot-card-top">
                  <div>
                    <div className="spot-card-title">Demo message</div>
                    <div className="spot-card-meta">Functional state updates</div>
                  </div>
                </div>
                <div className="spot-card-row" style={{ alignItems: 'flex-start' }}>
                  <span className="spot-card-meta" style={{ lineHeight: 1.5 }}>{demoMessage}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="insights-panel">
        <div className="insights-inner">
          <div className="insight-box">
            <div className="insight-title">Browse</div>
            <div className="insight-copy">Use the search field and sport filter to narrow sample clips.</div>
          </div>
          <div className="insight-box">
            <div className="insight-title">Upload</div>
            <div className="insight-copy">Submit the demo form and the new clip appears at the top of the list.</div>
          </div>
          <div className="insight-box">
            <div className="insight-title">Own</div>
            <div className="insight-copy">Click buy on any clip and it instantly moves into the owned state.</div>
          </div>
        </div>
      </section>

      <section className="filter-section">
        <div className="filter-inner">
          <div className="filter-row">
            <span className="filter-label">Search</span>
            <input
              className="search-input"
              style={{ maxWidth: 420 }}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by team, seller, or jersey"
            />
          </div>
          <div className="filter-row">
            <span className="filter-label">Sport</span>
            {filterOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={option === filter ? 'filter-pill active' : 'filter-pill'}
                onClick={() => setFilter(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="results-section" id="results">
        <div className="results-inner">
          <div className="results-header">
            <div className="results-count">
              <strong>{visibleClips.length}</strong> clips across <strong>{new Set(visibleClips.map((clip) => clip.gameSlug)).size}</strong> games
            </div>
          </div>

          <div className="game-grid">
            {visibleClips.map((clip, index) => (
              <button
                key={clip.id}
                type="button"
                className="game-card"
                onClick={() => selectClip(clip)}
                style={{ textAlign: 'left', cursor: 'pointer', border: selectedClipId === clip.id ? '1px solid var(--magenta)' : undefined }}
              >
                <div className="game-thumb" style={{ '--gx': `${25 + (index % 5) * 10}%` }}>
                  <div className="game-thumb-content">
                    <div className="game-tags">
                      <span className="game-tag live">{clip.owned ? 'Owned' : clip.status}</span>
                      <span className="game-tag sr">{clip.seller}</span>
                    </div>
                    <div className="game-clipcount"><strong>{clip.clips}</strong> clips</div>
                  </div>
                </div>
                <div className="game-info">
                  <div className="game-name">{clip.title}</div>
                  <div className="game-meta">{clip.team} · Jersey #{clip.jersey}</div>
                  <div className="game-bottom">
                    <div className="game-seller">${clip.price} · {clip.owned ? 'owned' : 'buy to unlock'}</div>
                    <span className="game-arrow">-&gt;</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="market-overview" id="demo-upload">
        <div className="market-overview-inner">
          <div className="overview-panel">
            <div className="overview-kicker">Seller upload</div>
            <div className="overview-title">Add a clip to the demo list.</div>
            <p className="overview-copy">This form is local-only, but it behaves like the MVP upload flow: fill in metadata, save the clip, and it becomes visible immediately.</p>
            <form className="phase-tasks" onSubmit={addDemoClip} style={{ marginTop: 18 }}>
              <input className="search-input" value={uploadForm.title} onChange={(event) => setUploadForm((current) => ({ ...current, title: event.target.value }))} placeholder="Clip title" />
              <input className="search-input" value={uploadForm.seller} onChange={(event) => setUploadForm((current) => ({ ...current, seller: event.target.value }))} placeholder="Seller" />
              <div className="scope-row" style={{ marginTop: 0 }}>
                <input className="search-input" value={uploadForm.team} onChange={(event) => setUploadForm((current) => ({ ...current, team: event.target.value }))} placeholder="Team" />
                <input className="search-input" value={uploadForm.jersey} onChange={(event) => setUploadForm((current) => ({ ...current, jersey: event.target.value }))} placeholder="Jersey #" />
              </div>
              <div className="scope-row" style={{ marginTop: 0 }}>
                <input className="search-input" value={uploadForm.price} onChange={(event) => setUploadForm((current) => ({ ...current, price: event.target.value }))} placeholder="Price" />
                <input className="search-input" value={uploadForm.sport} onChange={(event) => setUploadForm((current) => ({ ...current, sport: event.target.value }))} placeholder="Sport" />
              </div>
              <button type="submit" className="search-btn">Save Clip -&gt;</button>
            </form>
          </div>

          <aside className="spotlight-panel">
            <div className="spotlight-head">
              <h2>Owned clips</h2>
              <div className="spotlight-pills">
                <span className="spotlight-pill">Locked</span>
                <span className="spotlight-pill magenta">Unlocked</span>
              </div>
            </div>
            <div className="spotlight-grid">
              {ownedClips.length ? ownedClips.map((clip) => (
                <div key={clip.id} className="spot-card">
                  <div className="spot-card-top">
                    <div>
                      <div className="spot-card-title">{clip.title}</div>
                      <div className="spot-card-meta">Stream + download available</div>
                    </div>
                    <div className="spot-card-value">OWNED</div>
                  </div>
                  <div className="spot-card-row">
                    <span className="spot-card-meta">{clip.team}</span>
                    <span className="spot-card-meta">${clip.price}</span>
                  </div>
                </div>
              )) : (
                <div className="spot-card">
                  <div className="spot-card-top">
                    <div>
                      <div className="spot-card-title">No owned clips yet</div>
                      <div className="spot-card-meta">Buy a clip to populate this panel.</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
