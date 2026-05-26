"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import SiteHeader from '@/components/gfs/SiteHeader';
import SiteFooter from '@/components/gfs/SiteFooter';
import VideoShowcase from '@/components/gfs/VideoShowcase';
import { getFunnelSessionId, initClientEventAutoFlush, trackClientEvent } from '@/lib/clientEventTracker';

const SPORT_OPTIONS = ['All Sports', 'Football', '7v7', 'Combines', 'Camps'];
const DATE_OPTIONS = ['All Dates', 'Last 30 Days', 'This Season'];
const SORT_OPTIONS = ['Most Recent', 'Most Clips'];
const MEDIA_OPTIONS = ['All Media', 'Videos Only', 'Photos Only'];
const DEFAULT_POPULAR_TAGS = ['Highlight', 'Goal', 'Touchdown', 'Interception', 'Assist', 'Tackle'];
const DEFAULT_RESULTS = {
  items: [],
  totalClips: 0,
  totalGames: 0,
  totalPages: 1,
  page: 1,
};

const DEFAULT_FILTERS = {
  sport: 'All Sports',
  date_range: 'All Dates',
  sort: 'Most Recent',
  media_type: 'All Media',
};

const TRACKING_SOURCE = 'gfs_marketplace_app';
const RECENT_SEARCHES_KEY = 'gfs_marketplace_recent_searches';
const SAVED_FILTERS_KEY = 'gfs_marketplace_saved_filters';
const FILTER_PRESETS_KEY = 'gfs_marketplace_filter_presets';
const HEALTH_REPORT_KEY = 'gfs_marketplace_static_health_report';

const SELLER_LABELS = {
  'Subject Report': 'SR',
  'Subject Media': 'SM',
  'Blu Chips': 'BC',
  'Rated 7v7': 'R7',
};

function tagClass(tag) {
  if (tag === 'Live') return 'game-tag live';
  if (tag === 'Hot') return 'game-tag hot';
  if (tag === 'Subject Report') return 'game-tag sr';
  if (tag === 'Subject Media') return 'game-tag sm';
  if (tag.includes('Blu') || tag.includes('Pylon') || tag.includes('Rated')) return 'game-tag bc';
  return 'game-tag';
}

export default function MarketplacePage() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [playerSearch, setPlayerSearch] = useState(searchParams.get('q') || '');
  const [teamSearch, setTeamSearch] = useState(searchParams.get('team') || '');
  const [tagSearch, setTagSearch] = useState(searchParams.get('tags') || '');
  const [results, setResults] = useState(DEFAULT_RESULTS);
  const [isLoading, setIsLoading] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [savedPresets, setSavedPresets] = useState([]);
  const [selectedPresetId, setSelectedPresetId] = useState('');
  const [saveStatus, setSaveStatus] = useState('idle');
  const [copyStatus, setCopyStatus] = useState('idle');
  const [healthSnapshot, setHealthSnapshot] = useState(null);

  const playerInputRef = useRef(null);
  const filterSectionRef = useRef(null);
  const presetImportInputRef = useRef(null);

  const sport = searchParams.get('sport') || 'All Sports';
  const dates = searchParams.get('date_range') || 'All Dates';
  const sort = searchParams.get('sort') || 'Most Recent';
  const media = searchParams.get('media_type') || 'All Media';
  const page = Number(searchParams.get('page') || '1');
  const featuredGames = results.items.slice(0, 3);
  const activeTagList = tagSearch
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

  const popularTags = Array.from(
    new Set([
      ...DEFAULT_POPULAR_TAGS,
      ...results.items.flatMap((game) => (Array.isArray(game.tags) ? game.tags : [])),
    ]),
  )
    .map((tag) => String(tag || '').trim())
    .filter(Boolean)
    .slice(0, 12);

  const activeFilterChips = useMemo(() => {
    const chips = [];
    if (playerSearch.trim()) chips.push(`Player: ${playerSearch.trim()}`);
    if (teamSearch.trim()) chips.push(`Team: ${teamSearch.trim()}`);
    if (activeTagList.length) chips.push(`Tags: ${activeTagList.join(', ')}`);
    if (sport !== 'All Sports') chips.push(sport);
    if (dates !== 'All Dates') chips.push(dates);
    if (sort !== 'Most Recent') chips.push(sort);
    if (media !== 'All Media') chips.push(media);
    return chips;
  }, [activeTagList, dates, media, playerSearch, sort, sport, teamSearch]);

  function logEvent(eventName, detail = {}) {
    const funnelSessionId = getFunnelSessionId();
    trackClientEvent(eventName, {
      ...detail,
      funnelSessionId,
      route: '/marketplace',
    }, TRACKING_SOURCE);
  }

  function readLocalJson(key, fallback) {
    if (typeof window === 'undefined') return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed ?? fallback;
    } catch {
      return fallback;
    }
  }

  function writeLocalJson(key, value) {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore browser storage failures.
    }
  }

  function buildFilterSnapshot() {
    return {
      q: playerSearch,
      team: teamSearch,
      tags: tagSearch,
      sport,
      date_range: dates,
      sort,
      media_type: media,
    };
  }

  function normalizePresetCollection(raw) {
    if (Array.isArray(raw)) {
      return raw
        .map((item, idx) => ({
          id: String(item?.id || `preset-${idx}`),
          name: String(item?.name || `Preset ${idx + 1}`),
          filters: {
            ...DEFAULT_FILTERS,
            ...(item?.filters || {}),
          },
          createdAt: Number(item?.createdAt || Date.now()),
        }))
        .filter((item) => item.name.trim());
    }

    if (raw && typeof raw === 'object') {
      return [{
        id: `preset-legacy-${Date.now()}`,
        name: 'Saved Filters',
        filters: {
          ...DEFAULT_FILTERS,
          ...raw,
        },
        createdAt: Date.now(),
      }];
    }

    return [];
  }

  function buildQueryFromFilters(filters) {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.team) params.set('team', filters.team);
    if (filters.tags) params.set('tags', filters.tags);
    if (filters.sport && filters.sport !== 'All Sports') params.set('sport', filters.sport);
    if (filters.date_range && filters.date_range !== 'All Dates') params.set('date_range', filters.date_range);
    if (filters.sort && filters.sort !== 'Most Recent') params.set('sort', filters.sort);
    if (filters.media_type && filters.media_type !== 'All Media') params.set('media_type', filters.media_type);
    return params;
  }

  function patchQuery(nextValues, eventMeta = null) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(nextValues).forEach(([key, value]) => {
      if (!value || value === 'All Sports' || value === 'All Dates' || value === 'Most Recent' || value === 'All Media') {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    const nextQuery = params.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname);

    if (eventMeta?.eventName) {
      logEvent(eventMeta.eventName, eventMeta.detail || {});
    }
  }

  function onSearchSubmit(event) {
    event.preventDefault();
    const trimmedPlayer = playerSearch.trim();
    const trimmedTeam = teamSearch.trim();

    if (trimmedPlayer || trimmedTeam) {
      const existing = recentSearches.filter((entry) => entry.player !== trimmedPlayer || entry.team !== trimmedTeam);
      const nextRecent = [{ player: trimmedPlayer, team: trimmedTeam, at: Date.now() }, ...existing].slice(0, 6);
      setRecentSearches(nextRecent);
      writeLocalJson(RECENT_SEARCHES_KEY, nextRecent);
      logEvent('marketplace_recent_search_save', {
        hasPlayer: Boolean(trimmedPlayer),
        hasTeam: Boolean(trimmedTeam),
      });
    }

    patchQuery(
      { q: playerSearch, team: teamSearch, tags: tagSearch, page: 1 },
      {
        eventName: 'marketplace_search_submit',
        detail: {
          hasPlayer: Boolean(playerSearch.trim()),
          hasTeam: Boolean(teamSearch.trim()),
          hasTags: Boolean(tagSearch.trim()),
        },
      },
    );
  }

  function saveCurrentFilters() {
    const nameInput = window.prompt('Save preset name', `Preset ${savedPresets.length + 1}`);
    const presetName = String(nameInput || '').trim();
    if (!presetName) return;

    const filters = buildFilterSnapshot();
    const nextPreset = {
      id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: presetName,
      filters,
      createdAt: Date.now(),
    };

    const withoutSameName = savedPresets.filter((item) => item.name.toLowerCase() !== presetName.toLowerCase());
    const nextPresets = [nextPreset, ...withoutSameName].slice(0, 12);

    writeLocalJson(SAVED_FILTERS_KEY, filters);
    writeLocalJson(FILTER_PRESETS_KEY, nextPresets);
    setSavedPresets(nextPresets);
    setSelectedPresetId(nextPreset.id);
    setSaveStatus('saved');
    window.setTimeout(() => setSaveStatus('idle'), 1200);
    logEvent('marketplace_filter_preset_saved', {
      name: presetName,
      totalPresets: nextPresets.length,
    });
  }

  function renameSelectedPreset() {
    const preset = savedPresets.find((item) => item.id === selectedPresetId) || savedPresets[0];
    if (!preset) return;

    const nextNameInput = window.prompt('Rename preset', preset.name);
    const nextName = String(nextNameInput || '').trim();
    if (!nextName || nextName === preset.name) return;

    const nextPresets = savedPresets.map((item) => {
      if (item.id !== preset.id) return item;
      return {
        ...item,
        name: nextName,
      };
    });

    writeLocalJson(FILTER_PRESETS_KEY, nextPresets);
    setSavedPresets(nextPresets);
    setSelectedPresetId(preset.id);
    logEvent('marketplace_filter_preset_renamed', {
      previous: preset.name,
      next: nextName,
    });
  }

  function deleteSelectedPreset() {
    const preset = savedPresets.find((item) => item.id === selectedPresetId) || savedPresets[0];
    if (!preset) return;

    const confirmed = window.confirm(`Delete preset "${preset.name}"?`);
    if (!confirmed) return;

    const nextPresets = savedPresets.filter((item) => item.id !== preset.id);
    writeLocalJson(FILTER_PRESETS_KEY, nextPresets);
    setSavedPresets(nextPresets);
    setSelectedPresetId(nextPresets[0]?.id || '');
    logEvent('marketplace_filter_preset_deleted', {
      name: preset.name,
      remaining: nextPresets.length,
    });
  }

  function applySavedFilters(presetId = selectedPresetId) {
    let targetPreset = savedPresets.find((item) => item.id === presetId);

    if (!targetPreset && savedPresets.length) {
      targetPreset = savedPresets[0];
      setSelectedPresetId(targetPreset.id);
    }

    if (!targetPreset) {
      const saved = readLocalJson(SAVED_FILTERS_KEY, null);
      if (!saved) return;
      targetPreset = {
        id: 'legacy',
        name: 'Saved Filters',
        filters: {
          ...DEFAULT_FILTERS,
          ...saved,
        },
      };
    }

    const saved = targetPreset.filters;

    setPlayerSearch(saved.q || '');
    setTeamSearch(saved.team || '');
    setTagSearch(saved.tags || '');
    patchQuery(
      {
        q: saved.q || '',
        team: saved.team || '',
        tags: saved.tags || '',
        sport: saved.sport || 'All Sports',
        date_range: saved.date_range || 'All Dates',
        sort: saved.sort || 'Most Recent',
        media_type: saved.media_type || 'All Media',
        page: 1,
      },
      {
        eventName: 'marketplace_filter_preset_applied',
        detail: { name: targetPreset.name },
      },
    );
  }

  async function copyPresetQuickLink(presetId = selectedPresetId) {
    const preset = savedPresets.find((item) => item.id === presetId);
    if (!preset) return;

    const params = buildQueryFromFilters(preset.filters);
    const query = params.toString();
    const url = `${window.location.origin}${pathname}${query ? `?${query}` : ''}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopyStatus('copied');
      logEvent('marketplace_filter_preset_link_copy', { presetName: preset.name, hasQuery: Boolean(query) });
    } catch {
      setCopyStatus('failed');
    }

    window.setTimeout(() => setCopyStatus('idle'), 1400);
  }

  async function copyPresetPayload(presetId = selectedPresetId) {
    const preset = savedPresets.find((item) => item.id === presetId);
    if (!preset) return;

    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      preset,
    };

    const encoded = window.btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    const sharePayload = `gfs-preset://${encoded}`;

    try {
      await navigator.clipboard.writeText(sharePayload);
      setCopyStatus('copied');
      logEvent('marketplace_filter_preset_payload_copy', {
        presetName: preset.name,
      });
    } catch {
      setCopyStatus('failed');
    }

    window.setTimeout(() => setCopyStatus('idle'), 1400);
  }

  function importPresetPayload() {
    const payloadInput = window.prompt('Paste preset payload (gfs-preset://...)');
    const raw = String(payloadInput || '').trim();
    if (!raw) return;

    try {
      const encoded = raw.startsWith('gfs-preset://') ? raw.slice('gfs-preset://'.length) : raw;
      const decoded = decodeURIComponent(escape(window.atob(encoded)));
      const parsed = JSON.parse(decoded);
      const importedRaw = parsed?.preset ? [parsed.preset] : [];
      const imported = normalizePresetCollection(importedRaw);
      if (!imported.length) {
        throw new Error('No preset in payload.');
      }

      const merged = [...imported, ...savedPresets]
        .filter((item, idx, arr) => arr.findIndex((candidate) => candidate.name.toLowerCase() === item.name.toLowerCase()) === idx)
        .slice(0, 12);

      writeLocalJson(FILTER_PRESETS_KEY, merged);
      setSavedPresets(merged);
      setSelectedPresetId(merged[0]?.id || '');
      logEvent('marketplace_filter_preset_payload_import', { imported: imported.length });
    } catch {
      window.alert('Unable to import preset payload.');
    }
  }

  function exportPresetCollection() {
    if (!savedPresets.length) return;
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      presets: savedPresets,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const href = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.download = 'gfs-marketplace-presets.json';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(href);
    logEvent('marketplace_filter_preset_export', { count: savedPresets.length });
  }

  function importPresetCollection(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'));
        const importedRaw = Array.isArray(parsed?.presets) ? parsed.presets : (parsed?.preset ? [parsed.preset] : []);
        const imported = normalizePresetCollection(importedRaw).slice(0, 12);
        if (!imported.length) {
          throw new Error('No presets found in file.');
        }

        const merged = [...imported, ...savedPresets]
          .filter((item, idx, arr) => arr.findIndex((candidate) => candidate.name.toLowerCase() === item.name.toLowerCase()) === idx)
          .slice(0, 12);

        writeLocalJson(FILTER_PRESETS_KEY, merged);
        setSavedPresets(merged);
        setSelectedPresetId(merged[0]?.id || '');
        logEvent('marketplace_filter_preset_import', { imported: imported.length, merged: merged.length });
      } catch {
        window.alert('Unable to import presets from this file.');
      }
    };
    reader.readAsText(file);
  }

  function applyRecentSearch(value) {
    if (!value) return;
    const [playerEncoded, teamEncoded] = value.split('||');
    const nextPlayer = decodeURIComponent(playerEncoded || '');
    const nextTeam = decodeURIComponent(teamEncoded || '');
    setPlayerSearch(nextPlayer);
    setTeamSearch(nextTeam);
    patchQuery(
      { q: nextPlayer, team: nextTeam, page: 1 },
      {
        eventName: 'marketplace_recent_search_apply',
        detail: {
          hasPlayer: Boolean(nextPlayer),
          hasTeam: Boolean(nextTeam),
        },
      },
    );
  }

  function applyEmptyRecovery(action) {
    if (action === 'clear') {
      clearAllFilters();
      return;
    }

    if (action === 'last30') {
      patchQuery(
        { date_range: 'Last 30 Days', page: 1 },
        {
          eventName: 'marketplace_empty_recovery',
          detail: { action: 'last30' },
        },
      );
      return;
    }

    if (action === 'videos') {
      patchQuery(
        { media_type: 'Videos Only', page: 1 },
        {
          eventName: 'marketplace_empty_recovery',
          detail: { action: 'videos' },
        },
      );
    }
  }

  function toggleMobileSort() {
    const nextSort = sort === 'Most Clips' ? 'Most Recent' : 'Most Clips';
    patchQuery(
      { sort: nextSort, page: 1 },
      {
        eventName: 'marketplace_mobile_sort_toggle',
        detail: { sort: nextSort },
      },
    );
  }

  async function copyFilteredView() {
    const query = searchParams.toString();
    const url = `${window.location.origin}${pathname}${query ? `?${query}` : ''}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopyStatus('copied');
      logEvent('marketplace_filtered_link_copy', { hasQuery: Boolean(query) });
    } catch {
      setCopyStatus('failed');
    }

    window.setTimeout(() => setCopyStatus('idle'), 1400);
  }

  function clearSearch() {
    setPlayerSearch('');
    setTeamSearch('');
    setTagSearch('');
    patchQuery(
      { q: '', team: '', tags: '', page: 1 },
      {
        eventName: 'marketplace_search_clear',
      },
    );
  }

  function clearAllFilters() {
    setPlayerSearch('');
    setTeamSearch('');
    setTagSearch('');
    setMobileFiltersOpen(false);
    patchQuery(
      {
        q: '',
        team: '',
        tags: '',
        ...DEFAULT_FILTERS,
        page: 1,
      },
      {
        eventName: 'marketplace_filters_clear_all',
      },
    );
  }

  function toggleTag(tag) {
    const safeTag = String(tag || '').trim();
    if (!safeTag) {
      return;
    }

    const exists = activeTagList.some((item) => item.toLowerCase() === safeTag.toLowerCase());
    const nextTags = exists
      ? activeTagList.filter((item) => item.toLowerCase() !== safeTag.toLowerCase())
      : [...activeTagList, safeTag];

    const nextTagValue = nextTags.join(', ');
    setTagSearch(nextTagValue);
    patchQuery(
      { tags: nextTagValue, page: 1 },
      {
        eventName: 'marketplace_tag_toggle',
        detail: {
          tag: safeTag,
          state: exists ? 'removed' : 'added',
        },
      },
    );
  }

  function clearTags() {
    setTagSearch('');
    patchQuery(
      { tags: '', page: 1 },
      {
        eventName: 'marketplace_tag_clear',
      },
    );
  }

  useEffect(() => {
    const stopAutoFlush = initClientEventAutoFlush(TRACKING_SOURCE);
    return stopAutoFlush;
  }, []);

  useEffect(() => {
    setRecentSearches(readLocalJson(RECENT_SEARCHES_KEY, []));
    const rawPresets = readLocalJson(FILTER_PRESETS_KEY, []);
    let normalized = normalizePresetCollection(rawPresets);

    if (!normalized.length) {
      const legacySaved = readLocalJson(SAVED_FILTERS_KEY, null);
      if (legacySaved) {
        normalized = normalizePresetCollection(legacySaved);
        writeLocalJson(FILTER_PRESETS_KEY, normalized);
      }
    }

    setSavedPresets(normalized);
    if (normalized[0]?.id) {
      setSelectedPresetId(normalized[0].id);
    }

    const report = readLocalJson(HEALTH_REPORT_KEY, null);
    setHealthSnapshot(report);
  }, []);

  useEffect(() => {
    function onKeydown(event) {
      const target = event.target;
      const isTypingField = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable);

      if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !isTypingField) {
        event.preventDefault();
        playerInputRef.current?.focus();
        playerInputRef.current?.select();
        logEvent('marketplace_search_shortcut', { key: '/' });
      }
    }

    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  }, [playerSearch, teamSearch, tagSearch, sport, dates, sort, media]);

  useEffect(() => {
    let isActive = true;

    async function loadGames() {
      const query = searchParams.toString();
      setIsLoading(true);

      try {
        const response = await fetch(`/api/games${query ? `?${query}` : ''}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch games');
        }

        const data = await response.json();

        if (isActive) {
          setResults(data);
        }
      } catch {
        if (isActive) {
          setResults(DEFAULT_RESULTS);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadGames();

    return () => {
      isActive = false;
    };
  }, [searchParams]);

  return (
    <main className="gfs-page">
      <SiteHeader active="marketplace" />

      <header className="page-header">
        <div className="page-header-inner">
          <div className="page-eyebrow">The Marketplace</div>
          <h1 className="page-title">Find your <span className="magenta">game.</span></h1>
          <p className="page-sub">
            Browse highlights from every game on the platform. Search by team, school,
            jersey number, or event.
          </p>
          <VideoShowcase
            compact
            title="Live Market Tape"
            sub="Scrolling the marketplace should feel like standing on the sideline."
          />
        </div>
      </header>

      <section className="market-overview">
        <div className="market-overview-inner">
          <div className="overview-panel">
            <div className="overview-kicker">Live marketplace snapshot</div>
            <div className="overview-title">
              Built for coaches, parents, and athletes who need <span className="magenta">fast access</span> to the right footage.
            </div>
            <p className="overview-copy">
              The marketplace is organized to move visitors from browsing to clip purchases with fewer clicks.
              Each listing shows seller, date, and clip count, while the featured section surfaces the most active drops.
            </p>
            <div className="overview-actions">
              <a className="overview-cta" href="#results">Browse games</a>
              <a className="overview-ghost" href="#results">Open results</a>
            </div>
          </div>

          <aside className="spotlight-panel">
            <div className="spotlight-head">
              <h2>Featured drops</h2>
              <div className="spotlight-pills">
                <span className="spotlight-pill magenta">Hot</span>
                <span className="spotlight-pill">New</span>
              </div>
            </div>
            <div className="spotlight-grid">
              {featuredGames.map((game) => {
                const sellerBadge = SELLER_LABELS[game.seller] || game.seller.slice(0, 2).toUpperCase();

                return (
                  <Link
                    key={game.slug}
                    href={`/marketplace/games/${game.slug}`}
                    className="spot-card"
                    onClick={() => logEvent('marketplace_purchase_intent', {
                      intent: 'open_game_detail',
                      location: 'featured_drop',
                      slug: game.slug,
                    })}
                  >
                    <div className="spot-card-top">
                      <div>
                        <div className="spot-card-title">{game.name}</div>
                        <div className="spot-card-meta">{game.meta} · {game.seller}</div>
                      </div>
                      <div className="spot-card-value">{game.clips}</div>
                    </div>
                    <div className="spot-card-row">
                      <span className="spot-card-meta">Instant clip access</span>
                      <span className={game.tags.some((tag) => tag === 'Live' || tag === 'Hot') ? 'game-tag live' : 'game-tag sr'}>
                        {sellerBadge}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </aside>
        </div>
      </section>

      <section className="insights-panel">
        <div className="insights-inner">
          <div className="insight-box">
            <div className="insight-title">Search behavior</div>
            <div className="insight-copy">
              Players and families search by <strong>jersey number</strong>, <strong>team</strong>, and <strong>school</strong> to find their exact game footage faster.
            </div>
          </div>
          <div className="insight-box">
            <div className="insight-title">Seller network</div>
            <div className="insight-copy">
              The marketplace supports multiple capture brands so the platform can scale with partner events while keeping every listing consistent.
            </div>
            <div className="seller-list">
              <span className="seller-chip"><strong>SR</strong> Subject Report</span>
              <span className="seller-chip"><strong>SM</strong> Subject Media</span>
              <span className="seller-chip"><strong>BC</strong> Blu Chips</span>
              <span className="seller-chip"><strong>R7</strong> Rated 7v7</span>
            </div>
          </div>
          <div className="insight-box">
            <div className="insight-title">Conversion path</div>
            <div className="insight-copy">
              The page is organized to move a visitor from <strong>browse</strong> to <strong>game detail</strong> to <strong>checkout</strong> with fewer friction points.
            </div>
          </div>
        </div>
      </section>

      <section className="search-section">
        <div className="search-inner">
          <form className="search-bar" onSubmit={onSearchSubmit}>
            <input
              className="search-input"
              placeholder="Search by jersey number or player name"
              ref={playerInputRef}
              value={playerSearch}
              onChange={(event) => setPlayerSearch(event.target.value)}
            />
            <input
              className="search-input"
              placeholder="Team or school"
              value={teamSearch}
              onChange={(event) => setTeamSearch(event.target.value)}
            />
            <input
              className="search-input search-input-tags"
              placeholder="Tags (comma separated)"
              value={tagSearch}
              onChange={(event) => setTagSearch(event.target.value)}
            />
            <div className="search-actions">
              <button className="search-btn" type="submit">Find My Clips <span className="arrow">-&gt;</span></button>
              <button className="search-clear" type="button" onClick={clearSearch}>Clear Search</button>
            </div>
          </form>

          <div className="search-tools">
            <select
              className="search-recent"
              defaultValue=""
              onChange={(event) => applyRecentSearch(event.target.value)}
              aria-label="Recent searches"
            >
              <option value="">Recent searches</option>
              {recentSearches.map((entry) => {
                const encoded = `${encodeURIComponent(entry.player || '')}||${encodeURIComponent(entry.team || '')}`;
                const label = [entry.player || '', entry.team || ''].filter(Boolean).join(' • ') || 'Empty search';
                return (
                  <option key={`${encoded}-${entry.at || 0}`} value={encoded}>{label}</option>
                );
              })}
            </select>

            <div className="filter-extra-actions">
              <button type="button" className="filter-extra-btn" onClick={saveCurrentFilters}>
                {saveStatus === 'saved' ? 'Saved' : 'Save Preset'}
              </button>
              <select
                className="search-recent"
                value={selectedPresetId}
                onChange={(event) => setSelectedPresetId(event.target.value)}
                aria-label="Saved filter presets"
              >
                <option value="">Saved presets</option>
                {savedPresets.map((preset) => (
                  <option key={preset.id} value={preset.id}>{preset.name}</option>
                ))}
              </select>
              <button type="button" className="filter-extra-btn" onClick={() => applySavedFilters()} disabled={!savedPresets.length}>
                Use Preset
              </button>
              <button type="button" className="filter-extra-btn" onClick={() => copyPresetQuickLink()} disabled={!savedPresets.length}>
                Quick Link
              </button>
              <button type="button" className="filter-extra-btn" onClick={() => copyPresetPayload()} disabled={!savedPresets.length}>
                Copy Payload
              </button>
              <button type="button" className="filter-extra-btn" onClick={importPresetPayload}>
                Import Payload
              </button>
              <button type="button" className="filter-extra-btn" onClick={exportPresetCollection} disabled={!savedPresets.length}>
                Export
              </button>
              <button type="button" className="filter-extra-btn" onClick={() => presetImportInputRef.current?.click()}>
                Import
              </button>
              <button type="button" className="filter-extra-btn" onClick={renameSelectedPreset} disabled={!savedPresets.length}>
                Rename
              </button>
              <button type="button" className="filter-extra-btn filter-extra-btn-danger" onClick={deleteSelectedPreset} disabled={!savedPresets.length}>
                Delete
              </button>
            </div>

            <input
              ref={presetImportInputRef}
              type="file"
              accept="application/json"
              style={{ display: 'none' }}
              onChange={(event) => {
                const nextFile = event.target.files?.[0];
                importPresetCollection(nextFile);
                event.target.value = '';
              }}
            />
          </div>

          {healthSnapshot ? (
            <div className={healthSnapshot.passed ? 'health-status pass' : 'health-status fail'}>
              <strong>{healthSnapshot.passed ? 'Health Check: PASS' : 'Health Check: FAIL'}</strong>
              <div>Last run: {healthSnapshot.timestamp ? new Date(healthSnapshot.timestamp).toLocaleString() : 'Unknown'}</div>
            </div>
          ) : null}

          {savedPresets.length ? (
            <div className="saved-preset-links" aria-label="Saved filter quick links">
              {savedPresets.slice(0, 5).map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className="search-tag-chip"
                  onClick={() => applySavedFilters(preset.id)}
                  title={`Apply ${preset.name}`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          ) : null}

          <div className="search-tag-chips" role="group" aria-label="Popular tags">
            {activeTagList.length > 0 ? (
              <button
                type="button"
                className="search-tag-clear"
                onClick={clearTags}
              >
                Clear tags
              </button>
            ) : null}

            {popularTags.map((tag) => {
              const isActive = activeTagList.some((item) => item.toLowerCase() === tag.toLowerCase());

              return (
                <button
                  key={tag}
                  type="button"
                  className={isActive ? 'search-tag-chip active' : 'search-tag-chip'}
                  onClick={() => toggleTag(tag)}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section ref={filterSectionRef} className={mobileFiltersOpen ? 'filter-section open' : 'filter-section'}>
        <div className="filter-inner">
          <div className="filter-mobile-bar">
            <div>
              <div className="filter-mobile-kicker">Filters</div>
              <div className="filter-mobile-copy">Refine by sport, date, sort, and media.</div>
            </div>
            <button
              type="button"
              className="filter-mobile-toggle"
              onClick={() => setMobileFiltersOpen((value) => !value)}
              aria-expanded={mobileFiltersOpen}
            >
              {mobileFiltersOpen ? 'Hide filters' : 'Show filters'}
            </button>
          </div>
          <div className="filter-row">
            <span className="filter-label">Sport</span>
            {SPORT_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                className={option === sport ? 'filter-pill active' : 'filter-pill'}
                aria-pressed={option === sport}
                onClick={() => patchQuery(
                  { sport: option, page: 1 },
                  {
                    eventName: 'marketplace_filter_change',
                    detail: { group: 'sport', value: option },
                  },
                )}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="filters-drawer">
            <div className="filter-row">
              <span className="filter-label">Dates</span>
              {DATE_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={option === dates ? 'filter-pill active' : 'filter-pill'}
                  aria-pressed={option === dates}
                  onClick={() => patchQuery(
                    { date_range: option, page: 1 },
                    {
                      eventName: 'marketplace_filter_change',
                      detail: { group: 'dates', value: option },
                    },
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="filter-row">
              <span className="filter-label">Sort</span>
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={option === sort ? 'filter-pill active' : 'filter-pill'}
                  aria-pressed={option === sort}
                  onClick={() => patchQuery(
                    { sort: option, page: 1 },
                    {
                      eventName: 'marketplace_filter_change',
                      detail: { group: 'sort', value: option },
                    },
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="filter-row">
              <span className="filter-label">Media</span>
              {MEDIA_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={option === media ? 'filter-pill active' : 'filter-pill'}
                  aria-pressed={option === media}
                  onClick={() => patchQuery(
                    { media_type: option, page: 1 },
                    {
                      eventName: 'marketplace_filter_change',
                      detail: { group: 'media', value: option },
                    },
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="filter-actions">
              <button type="button" className="filter-reset" onClick={clearAllFilters}>Clear All Filters</button>
            </div>
          </div>
        </div>
      </section>

      <div className="mobile-action-bar" aria-label="Mobile quick actions">
        <button
          type="button"
          className="mobile-action-btn"
          onClick={() => filterSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        >
          Filter
        </button>
        <button type="button" className="mobile-action-btn" onClick={toggleMobileSort}>Sort</button>
        <button type="button" className="mobile-action-btn" onClick={clearAllFilters}>Clear</button>
      </div>

      <section className="results-section" id="results">
        <div className="results-inner">
          <div className="results-header">
            <div className="results-count" aria-live="polite">
              <strong>{results.totalClips.toLocaleString()}</strong> clips across <strong>{results.totalGames}</strong> games
            </div>
            <div className="results-actions">
              <button type="button" className="filter-extra-btn" onClick={copyFilteredView}>
                {copyStatus === 'copied' ? 'Link Copied' : copyStatus === 'failed' ? 'Copy Failed' : 'Copy Filtered View'}
              </button>
            </div>
          </div>

          <div className="active-filters" aria-live="polite">
            {activeFilterChips.length
              ? activeFilterChips.map((chip) => <span key={chip} className="active-chip">{chip}</span>)
              : <span className="active-chip">No active filters</span>}
          </div>

          {isLoading ? <div className="results-status">Loading results...</div> : null}

          {!isLoading && results.items.length === 0 ? (
            <div className="results-empty">
              <span className="results-empty-title">No results for this filter set</span>
              <span>Try one of these quick recovery actions.</span>
              <div className="results-empty-actions">
                <button type="button" className="results-empty-btn" onClick={() => applyEmptyRecovery('clear')}>Clear all filters</button>
                <button type="button" className="results-empty-btn" onClick={() => applyEmptyRecovery('last30')}>Use Last 30 Days</button>
                <button type="button" className="results-empty-btn" onClick={() => applyEmptyRecovery('videos')}>Videos only</button>
              </div>
            </div>
          ) : null}

          <div className={isLoading ? 'game-grid is-loading' : 'game-grid'}>
            {isLoading
              ? Array.from({ length: 6 }).map((_, idx) => (
                <div key={`skeleton-${idx}`} className="game-card skeleton-card" aria-hidden="true">
                  <div className="game-thumb">
                    <div className="game-thumb-content">
                      <div className="game-tags">
                        <span className="game-tag">Loading</span>
                      </div>
                      <div className="game-clipcount"><strong>000</strong>clips</div>
                    </div>
                  </div>
                  <div className="game-info">
                    <div className="game-name">Loading game</div>
                    <div className="game-meta">Loading metadata</div>
                    <div className="game-bottom">
                      <div className="game-seller">listed by <strong>Loading</strong></div>
                      <span className="game-arrow">-&gt;</span>
                    </div>
                  </div>
                </div>
              ))
              : results.items.map((game, idx) => (
              <Link
                key={game.slug}
                href={`/marketplace/games/${game.slug}`}
                className="game-card"
                onClick={() => {
                  logEvent('marketplace_game_open', { slug: game.slug, seller: game.seller });
                  logEvent('marketplace_purchase_intent', {
                    intent: 'open_game_detail',
                    location: 'results_grid',
                    slug: game.slug,
                    q: playerSearch.trim() || null,
                    team: teamSearch.trim() || null,
                    tags: activeTagList,
                    matchReasons: game.matchReasons || [],
                    relevanceScore: game.relevanceScore ?? null,
                  });
                }}
              >
                <div className="game-thumb" style={{ '--gx': `${25 + (idx % 5) * 10}%` }}>
                  <div className="game-thumb-content">
                    <div className="game-tags">
                      {game.tags.map((tag) => (
                        <span key={tag} className={tagClass(tag)}>{tag}</span>
                      ))}
                    </div>
                    <div className="game-clipcount"><strong>{game.clips}</strong>clips</div>
                  </div>
                </div>
                <div className="game-info">
                  <div className="game-name">{game.name}</div>
                  <div className="game-meta">{game.meta}</div>
                  {Array.isArray(game.matchReasons) && game.matchReasons.length ? (
                    <div className="game-match-reasons" aria-label="Why this result matched">
                      {game.matchReasons.slice(0, 3).map((reason) => (
                        <span key={`${game.slug}-${reason}`} className="game-match-reason">{reason}</span>
                      ))}
                    </div>
                  ) : null}
                  <div className="game-bottom">
                    <div className="game-seller">listed by <strong>{game.seller}</strong></div>
                    <span className="game-arrow">-&gt;</span>
                  </div>
                </div>
              </Link>
              ))}
          </div>

          <div className="pagination">
            <button
              className="pg-btn"
              disabled={page <= 1}
              onClick={() => patchQuery(
                { page: page - 1 },
                {
                  eventName: 'marketplace_page_change',
                  detail: { direction: 'prev', page: page - 1 },
                },
              )}
            >
              Prev
            </button>
            <span className="pg-info">Page {results.page} of {results.totalPages}</span>
            <button
              className="pg-btn"
              disabled={page >= results.totalPages}
              onClick={() => patchQuery(
                { page: page + 1 },
                {
                  eventName: 'marketplace_page_change',
                  detail: { direction: 'next', page: page + 1 },
                },
              )}
            >
              Next
            </button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
