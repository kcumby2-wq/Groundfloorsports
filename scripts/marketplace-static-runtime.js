(function () {
    const searchInputs = Array.from(document.querySelectorAll('.search-input'));
    const playerInput = searchInputs[0] || null;
    const teamInput = searchInputs[1] || null;
    const searchBtn = document.querySelector('.search-btn');
    const clearSearchBtn = document.querySelector('.search-clear');
    const clearAllFiltersBtn = document.getElementById('clearAllFilters');
    const gameGrid = document.querySelector('.game-grid');
    const resultsCount = document.getElementById('resultsCount') || document.querySelector('.results-count');
    const emptyState = document.getElementById('resultsEmpty') || document.querySelector('.results-empty');
    const activeFilters = document.getElementById('activeFilters');
    const pagination = document.querySelector('.pagination');
    const filterSection = document.querySelector('.filter-section');
    const searchBar = document.querySelector('.search-bar');
    const filterActions = document.querySelector('.filter-actions');

    if (!gameGrid || !resultsCount || !pagination) return;

    const filterRows = Array.from(document.querySelectorAll('.filter-row'));
    const prevBtn = Array.from(pagination.querySelectorAll('.pg-btn')).find((btn) => btn.textContent.includes('Prev'));
    const nextBtn = Array.from(pagination.querySelectorAll('.pg-btn')).find((btn) => btn.textContent.includes('Next'));
    const pageButtons = Array.from(pagination.querySelectorAll('.pg-btn')).filter((btn) => /^\d+$/.test(btn.textContent.trim()));
    const pageInfo = pagination.querySelector('.pg-info');
    const cards = Array.from(gameGrid.querySelectorAll('.game-card'));
    const pageSize = 6;
    let currentPage = 1;
    let loadingTimer = null;
    const STORAGE_KEY = 'sr_event_queue';
    const TRACKING_SOURCE = 'gfs_marketplace_static';
    const RECENT_SEARCHES_KEY = 'gfs_marketplace_recent_searches';
    const SAVED_FILTERS_KEY = 'gfs_marketplace_saved_filters';
    const FILTER_PRESETS_KEY = 'gfs_marketplace_filter_presets';
    const HEALTH_REPORT_KEY = 'gfs_marketplace_static_health_report';
    const FUNNEL_SESSION_KEY = 'gfs_marketplace_funnel_session_id';

    function injectEnhancementStyles() {
      if (document.getElementById('marketplaceQuickWinStyles')) return;
      const style = document.createElement('style');
      style.id = 'marketplaceQuickWinStyles';
      style.textContent = `
        .search-recent{width:100%;background:var(--input-bg);border:1px solid var(--input-border);border-radius:10px;padding:12px 14px;color:var(--muted-strong)}
        .search-recent option{color:#111}
        .filter-extra-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;margin-top:8px}
        .filter-extra-btn{border:1px solid var(--pill-border);border-radius:8px;padding:10px 12px;font-family:'Bebas Neue',sans-serif;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted-strong)}
        .filter-extra-btn:hover{border-color:var(--magenta);color:var(--magenta)}
        .filter-extra-btn-danger{border-color:rgba(239,68,68,.45);color:#fecaca}
        .filter-extra-btn-danger:hover{border-color:rgba(239,68,68,.8);color:#fee2e2}
        .saved-preset-links{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
        .health-status{margin-top:8px;border:1px solid var(--pill-border);border-radius:10px;padding:8px 10px;background:rgba(255,255,255,.02);font-size:11px;letter-spacing:.04em;color:var(--muted-strong)}
        .health-status strong{color:var(--white)}
        .health-status.pass{border-color:rgba(74,222,128,.45);color:#86efac}
        .health-status.fail{border-color:rgba(239,68,68,.45);color:#fca5a5}
        .game-match-reasons{margin-top:8px;display:flex;gap:6px;flex-wrap:wrap}
        .game-match-reason{border:1px solid rgba(236,72,153,.45);background:rgba(236,72,153,.08);color:var(--magenta-light);padding:4px 8px;border-radius:999px;font-size:10px;letter-spacing:.08em;text-transform:uppercase}
        .results-empty-title{display:block;font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:.05em;margin-bottom:6px;color:var(--white)}
        .results-empty-actions{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:12px}
        .results-empty-btn{border:1px solid var(--pill-border);border-radius:999px;padding:8px 12px;font-size:12px;letter-spacing:.06em;color:var(--muted-strong);background:var(--pill-bg)}
        .results-empty-btn:hover{border-color:var(--magenta);color:var(--magenta)}
        .game-grid.is-loading .game-card{pointer-events:none}
        .game-grid.is-loading .game-thumb-content,.game-grid.is-loading .game-name,.game-grid.is-loading .game-meta,.game-grid.is-loading .game-seller,.game-grid.is-loading .game-tag,.game-grid.is-loading .game-clipcount{color:transparent!important;background:linear-gradient(90deg,rgba(255,255,255,.08),rgba(255,255,255,.18),rgba(255,255,255,.08));background-size:220% 100%;border-radius:8px;animation:marketplaceShimmer 1.1s infinite}
        .game-grid.is-loading .game-tag{border-color:transparent}
        @keyframes marketplaceShimmer{0%{background-position:220% 0}100%{background-position:-220% 0}}
        .mobile-action-bar{position:fixed;left:12px;right:12px;bottom:12px;z-index:140;display:none;grid-template-columns:repeat(3,1fr);gap:8px;padding:10px;border:1px solid var(--line);border-radius:14px;background:rgba(10,22,40,.96);backdrop-filter:blur(12px)}
        .mobile-action-btn{border:1px solid var(--pill-border);border-radius:10px;padding:10px 8px;font-family:'Bebas Neue',sans-serif;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted-strong);text-align:center}
        .mobile-action-btn:hover{border-color:var(--magenta);color:var(--magenta)}
        @media (max-width:640px){
          .mobile-action-bar{display:grid}
          .results-section{padding-bottom:96px}
          .search-bar{grid-template-columns:1fr}
        }
      `;
      document.head.appendChild(style);
    }

    function canFlushRemotely() {
      return window.location.protocol === 'http:' || window.location.protocol === 'https:';
    }

    function readQueue() {
      try {
        const queue = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        return Array.isArray(queue) ? queue : [];
      } catch {
        return [];
      }
    }

    function writeQueue(queue) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(queue.slice(-250)));
      } catch {
      }
    }

    function trackEvent(eventName, detail) {
      const funnelSessionId = getFunnelSessionId();
      const payload = {
        event: eventName,
        detail: Object.assign({}, detail || {}, { funnelSessionId }),
        source: TRACKING_SOURCE,
        page: window.location.pathname,
        timestamp: Date.now(),
      };
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(payload);
      const queue = readQueue();
      queue.push(payload);
      writeQueue(queue);
    }

    function getFunnelSessionId() {
      try {
        const existing = localStorage.getItem(FUNNEL_SESSION_KEY);
        if (existing) return existing;
        const nextId = 'funnel_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
        localStorage.setItem(FUNNEL_SESSION_KEY, nextId);
        return nextId;
      } catch {
        return '';
      }
    }

    function safeRead(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        const parsed = JSON.parse(raw);
        return parsed ?? fallback;
      } catch {
        return fallback;
      }
    }

    function safeWrite(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
      }
    }

    function activeFilter(label) {
      const row = filterRows.find((node) => {
        const text = node.querySelector('.filter-label')?.textContent || '';
        return text.trim().toLowerCase() === label.toLowerCase();
      });
      return row?.querySelector('.filter-pill.active')?.textContent.trim() || '';
    }

    function currentFilters() {
      return {
        q: (playerInput?.value || '').trim(),
        team: (teamInput?.value || '').trim(),
        sport: activeFilter('Sport') || 'All Sports',
        dates: activeFilter('Dates') || 'All Dates',
        sort: activeFilter('Sort') || 'Most Recent',
        media: activeFilter('Media') || 'All Media',
      };
    }

    function setActiveFilter(label, value) {
      const row = filterRows.find((node) => {
        const text = node.querySelector('.filter-label')?.textContent || '';
        return text.trim().toLowerCase() === label.toLowerCase();
      });
      if (!row) return;
      const pills = Array.from(row.querySelectorAll('.filter-pill'));
      let matched = false;
      pills.forEach((pill) => {
        const isMatch = pill.textContent.trim() === value;
        if (isMatch) matched = true;
        pill.classList.toggle('active', isMatch);
        pill.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
      });
      if (!matched && pills[0]) {
        pills.forEach((pill, index) => {
          pill.classList.toggle('active', index === 0);
          pill.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
        });
      }
    }

    function saveRecentSearch() {
      const q = (playerInput?.value || '').trim();
      const team = (teamInput?.value || '').trim();
      if (!q && !team) return;
      let rows = safeRead(RECENT_SEARCHES_KEY, []);
      rows = rows.filter((item) => item.q !== q || item.team !== team);
      rows.unshift({ q, team, at: Date.now() });
      safeWrite(RECENT_SEARCHES_KEY, rows.slice(0, 6));
      updateRecentSearchesSelect();
    }

    function updateRecentSearchesSelect() {
      const select = document.getElementById('recentSearches');
      if (!select) return;
      const rows = safeRead(RECENT_SEARCHES_KEY, []);
      select.innerHTML = '<option value="">Recent searches</option>' + rows.map((row) => {
        const value = encodeURIComponent(row.q || '') + '||' + encodeURIComponent(row.team || '');
        const label = [row.q || '', row.team || ''].filter(Boolean).join(' • ') || 'Empty search';
        return '<option value="' + value + '">' + label + '</option>';
      }).join('');
    }

    function saveCurrentFilters() {
      const nameInput = window.prompt('Save preset name', 'Preset ' + ((readPresetCollection().length || 0) + 1));
      const presetName = String(nameInput || '').trim();
      if (!presetName) return;

      const filters = currentFilters();
      const nextPreset = {
        id: 'preset-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
        name: presetName,
        filters,
        createdAt: Date.now(),
      };

      const presets = readPresetCollection().filter((item) => item.name.toLowerCase() !== presetName.toLowerCase());
      const nextPresets = [nextPreset].concat(presets).slice(0, 12);

      safeWrite(SAVED_FILTERS_KEY, filters);
      safeWrite(FILTER_PRESETS_KEY, nextPresets);
      renderPresetControls(nextPreset.id);
      trackEvent('marketplace_filter_preset_saved', { name: presetName, totalPresets: nextPresets.length });
    }

    function renamePreset(presetId) {
      const presets = readPresetCollection();
      const preset = presets.find((item) => item.id === presetId) || presets[0];
      if (!preset) return;

      const nextNameInput = window.prompt('Rename preset', preset.name);
      const nextName = String(nextNameInput || '').trim();
      if (!nextName || nextName === preset.name) return;

      const nextPresets = presets.map((item) => {
        if (item.id !== preset.id) return item;
        return Object.assign({}, item, { name: nextName });
      });

      safeWrite(FILTER_PRESETS_KEY, nextPresets);
      renderPresetControls(preset.id);
      trackEvent('marketplace_filter_preset_renamed', { previous: preset.name, next: nextName });
    }

    function deletePreset(presetId) {
      const presets = readPresetCollection();
      const preset = presets.find((item) => item.id === presetId) || presets[0];
      if (!preset) return;

      const confirmed = window.confirm('Delete preset "' + preset.name + '"?');
      if (!confirmed) return;

      const nextPresets = presets.filter((item) => item.id !== preset.id);
      safeWrite(FILTER_PRESETS_KEY, nextPresets);
      renderPresetControls(nextPresets[0] ? nextPresets[0].id : '');
      trackEvent('marketplace_filter_preset_deleted', { name: preset.name, remaining: nextPresets.length });
    }

    function normalizePresetCollection(raw) {
      if (Array.isArray(raw)) {
        return raw
          .map((item, idx) => ({
            id: String(item && item.id ? item.id : 'preset-' + idx),
            name: String(item && item.name ? item.name : 'Preset ' + (idx + 1)),
            filters: Object.assign({
              sport: 'All Sports',
              dates: 'All Dates',
              sort: 'Most Recent',
              media: 'All Media',
              q: '',
              team: '',
            }, item && item.filters ? item.filters : {}),
            createdAt: Number(item && item.createdAt ? item.createdAt : Date.now()),
          }))
          .filter((item) => item.name.trim());
      }

      if (raw && typeof raw === 'object') {
        return [{
          id: 'preset-legacy-' + Date.now(),
          name: 'Saved Filters',
          filters: Object.assign({
            sport: 'All Sports',
            dates: 'All Dates',
            sort: 'Most Recent',
            media: 'All Media',
            q: '',
            team: '',
          }, raw),
          createdAt: Date.now(),
        }];
      }

      return [];
    }

    function readPresetCollection() {
      let presets = normalizePresetCollection(safeRead(FILTER_PRESETS_KEY, []));
      if (!presets.length) {
        const legacy = safeRead(SAVED_FILTERS_KEY, null);
        if (legacy) {
          presets = normalizePresetCollection(legacy);
          safeWrite(FILTER_PRESETS_KEY, presets);
        }
      }
      return presets;
    }

    function buildQueryFromFilters(filters) {
      const params = new URLSearchParams();
      if (filters.q) params.set('q', filters.q);
      if (filters.team) params.set('team', filters.team);
      if (filters.sport && filters.sport !== 'All Sports') params.set('sport', filters.sport);
      if (filters.dates && filters.dates !== 'All Dates') params.set('date_range', filters.dates);
      if (filters.sort && filters.sort !== 'Most Recent') params.set('sort', filters.sort);
      if (filters.media && filters.media !== 'All Media') params.set('media_type', filters.media);
      return params;
    }

    function applySavedFilters(presetId) {
      const presets = readPresetCollection();
      const selected = presets.find((item) => item.id === presetId) || presets[0] || null;
      const saved = selected ? selected.filters : safeRead(SAVED_FILTERS_KEY, null);
      if (!saved) return;

      if (playerInput) playerInput.value = saved.q || '';
      if (teamInput) teamInput.value = saved.team || '';
      setActiveFilter('Sport', saved.sport || 'All Sports');
      setActiveFilter('Dates', saved.dates || 'All Dates');
      setActiveFilter('Sort', saved.sort || 'Most Recent');
      setActiveFilter('Media', saved.media || 'All Media');
      currentPage = 1;
      queueApply();
      trackEvent('marketplace_filter_preset_applied', { name: selected ? selected.name : 'Saved Filters' });
    }

    function copyPresetQuickLink(presetId) {
      const preset = readPresetCollection().find((item) => item.id === presetId);
      if (!preset) return;
      const query = buildQueryFromFilters(preset.filters).toString();
      const url = window.location.href.split('?')[0] + (query ? '?' + query : '');

      const onSuccess = () => trackEvent('marketplace_filter_preset_link_copy', { presetName: preset.name, hasQuery: Boolean(query) });
      const onFailure = () => alert('Unable to copy preset quick link in this browser context.');

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(onSuccess).catch(onFailure);
        return;
      }

      const helper = document.createElement('textarea');
      helper.value = url;
      document.body.appendChild(helper);
      helper.select();
      try {
        const copied = document.execCommand('copy');
        if (copied) onSuccess();
        else onFailure();
      } catch {
        onFailure();
      } finally {
        helper.remove();
      }
    }

    function copyPresetPayload(presetId) {
      const preset = readPresetCollection().find((item) => item.id === presetId);
      if (!preset) return;

      const payload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        preset,
      };
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
      const sharePayload = 'gfs-preset://' + encoded;

      const onSuccess = () => trackEvent('marketplace_filter_preset_payload_copy', { presetName: preset.name });
      const onFailure = () => alert('Unable to copy preset payload in this browser context.');

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(sharePayload).then(onSuccess).catch(onFailure);
        return;
      }

      const helper = document.createElement('textarea');
      helper.value = sharePayload;
      document.body.appendChild(helper);
      helper.select();
      try {
        const copied = document.execCommand('copy');
        if (copied) onSuccess();
        else onFailure();
      } catch {
        onFailure();
      } finally {
        helper.remove();
      }
    }

    function importPresetPayload() {
      const payloadInput = window.prompt('Paste preset payload (gfs-preset://...)');
      const raw = String(payloadInput || '').trim();
      if (!raw) return;

      try {
        const encoded = raw.indexOf('gfs-preset://') === 0 ? raw.slice('gfs-preset://'.length) : raw;
        const decoded = decodeURIComponent(escape(atob(encoded)));
        const parsed = JSON.parse(decoded);
        const importedRaw = parsed && parsed.preset ? [parsed.preset] : [];
        const imported = normalizePresetCollection(importedRaw);
        if (!imported.length) {
          throw new Error('No preset payload');
        }

        const merged = imported.concat(readPresetCollection())
          .filter((item, idx, arr) => arr.findIndex((candidate) => candidate.name.toLowerCase() === item.name.toLowerCase()) === idx)
          .slice(0, 12);

        safeWrite(FILTER_PRESETS_KEY, merged);
        renderPresetControls(merged[0] ? merged[0].id : '');
        trackEvent('marketplace_filter_preset_payload_import', { imported: imported.length });
      } catch {
        alert('Unable to import preset payload.');
      }
    }

    function exportPresetCollection() {
      const presets = readPresetCollection();
      if (!presets.length) return;

      const payload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        presets,
      };

      downloadJsonFile('gfs-marketplace-presets.json', payload);
      trackEvent('marketplace_filter_preset_export', { count: presets.length });
    }

    function importPresetCollection(file) {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result || '{}'));
          const importedRaw = Array.isArray(parsed && parsed.presets) ? parsed.presets : (parsed && parsed.preset ? [parsed.preset] : []);
          const imported = normalizePresetCollection(importedRaw).slice(0, 12);
          if (!imported.length) {
            throw new Error('No presets found in file.');
          }

          const merged = imported.concat(readPresetCollection())
            .filter((item, idx, arr) => arr.findIndex((candidate) => candidate.name.toLowerCase() === item.name.toLowerCase()) === idx)
            .slice(0, 12);

          safeWrite(FILTER_PRESETS_KEY, merged);
          renderPresetControls(merged[0] ? merged[0].id : '');
          trackEvent('marketplace_filter_preset_import', { imported: imported.length, merged: merged.length });
        } catch {
          alert('Unable to import presets from this file.');
        }
      };
      reader.readAsText(file);
    }

    function renderPresetControls(selectedId) {
      const select = document.getElementById('savedPresetSelect');
      const quickLinks = document.getElementById('presetQuickLinks');
      if (!select || !quickLinks) return;

      const presets = readPresetCollection();
      const currentSelectedId = selectedId || select.value || '';

      select.innerHTML = '<option value="">Saved presets</option>' + presets.map((preset) => '<option value="' + preset.id + '">' + preset.name + '</option>').join('');
      if (currentSelectedId) select.value = currentSelectedId;

      quickLinks.innerHTML = presets.slice(0, 5).map((preset) => '<button type="button" class="search-tag-chip" data-preset-action="apply" data-preset-id="' + preset.id + '">' + preset.name + '</button>').join('');
    }

    function renderHealthStatus(report) {
      const host = document.getElementById('healthStatus');
      if (!host || !report) return;

      const statusClass = report.passed ? 'health-status pass' : 'health-status fail';
      const failures = Array.isArray(report.failures) ? report.failures : [];
      const lastRun = report.timestamp ? new Date(report.timestamp).toLocaleString() : 'Unknown';

      host.className = statusClass;
      host.innerHTML = '<strong>' + (report.passed ? 'Health Check: PASS' : 'Health Check: FAIL') + '</strong>' +
        '<div>Last run: ' + lastRun + '</div>' +
        '<div>Source: ' + String(report.source || 'manual') + '</div>' +
        '<div>' + (failures.length ? ('Issues: ' + failures.join(', ')) : 'No issues found') + '</div>';
    }

    async function flushQueue(reason) {
      if (!canFlushRemotely()) return;
      const queue = readQueue();
      if (!queue.length) return;
      const batch = queue.slice(0, 20).map((item) => ({ ...item, flush_reason: reason || 'interval' }));
      try {
        const response = await fetch('/api/analytics/events', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ events: batch }), keepalive: reason !== 'interval',
        });
        if (!response.ok) return;
        writeQueue(queue.slice(batch.length));
      } catch {
      }
    }

    function sendBeaconFlush(reason) {
      if (!canFlushRemotely() || !navigator.sendBeacon) return;
      const queue = readQueue();
      if (!queue.length) return;
      const batch = queue.slice(0, 10).map((item) => ({ ...item, flush_reason: reason || 'beacon' }));
      const body = new Blob([JSON.stringify({ events: batch })], { type: 'application/json' });
      const ok = navigator.sendBeacon('/api/analytics/events', body);
      if (ok) writeQueue(queue.slice(batch.length));
    }

    window.setTimeout(() => flushQueue('initial'), 1500);
    window.setInterval(() => flushQueue('interval'), 30000);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') sendBeaconFlush('visibility_hidden'); });
    window.addEventListener('beforeunload', () => sendBeaconFlush('before_unload'));

    if (window.location.protocol === 'file:') {
      document.querySelectorAll('a[href^="/marketplace/games/"]').forEach((link) => {
        const href = link.getAttribute('href') || '';
        const slug = href.split('/').filter(Boolean).pop() || '';
        link.setAttribute('href', 'marketplace-game-preview.html?slug=' + encodeURIComponent(slug));
      });
    }

    cards.forEach((card) => {
      const name = (card.querySelector('.game-name')?.textContent || '').trim();
      const meta = (card.querySelector('.game-meta')?.textContent || '').replace(/\s+/g, ' ').trim();
      const seller = (card.querySelector('.game-seller strong')?.textContent || '').trim();
      const tags = Array.from(card.querySelectorAll('.game-tag')).map((el) => el.textContent.trim()).join(' ');
      const clips = Number((card.querySelector('.game-clipcount strong')?.textContent || '0').replace(/[^0-9]/g, '')) || 0;
      const dateMatch = meta.match(/([A-Za-z]{3}\s+\d{1,2},\s+\d{4})/);
      const date = dateMatch ? new Date(dateMatch[1]) : new Date('1970-01-01');
      const source = (name + ' ' + meta).toLowerCase();

      let sport = 'Football';
      if (source.includes('7v7')) sport = '7v7';
      if (source.includes('combine')) sport = 'Combines';
      if (source.includes('camp')) sport = 'Camps';
      if (source.includes('basketball')) sport = 'Basketball';

      let media = 'Videos Only';
      if (source.includes('photo')) media = 'Photos Only';
      if (source.includes('nft')) media = 'NFTs Only';

      card._meta = { text: (name + ' ' + meta + ' ' + seller + ' ' + tags).toLowerCase(), team: name.toLowerCase(), sport, media, date, clips };
      card.setAttribute('aria-label', name + ' - ' + meta);
      card.setAttribute('tabindex', '0');
      card.addEventListener('click', () => {
        const filters = currentFilters();
        trackEvent('marketplace_game_open', {
          slug: card.getAttribute('href') || '',
          seller,
          q: (filters.q || '').trim() || null,
          team: (filters.team || '').trim() || null,
          sport: filters.sport || null,
          dates: filters.dates || null,
          media: filters.media || null,
          matchReasons: card._matchReasons || [],
          relevanceScore: card._relevanceScore || 0,
        });
        trackEvent('marketplace_purchase_intent', {
          intent: 'open_game_detail',
          location: 'results_grid',
          slug: card.getAttribute('href') || '',
          q: (filters.q || '').trim() || null,
          team: (filters.team || '').trim() || null,
          sport: filters.sport || null,
          dates: filters.dates || null,
          media: filters.media || null,
          matchReasons: card._matchReasons || [],
          relevanceScore: card._relevanceScore || 0,
        });
      });
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          card.click();
        }
      });
    });

    filterRows.forEach((row) => {
      row.querySelectorAll('.filter-pill').forEach((pill) => {
        pill.setAttribute('type', 'button');
        pill.setAttribute('aria-pressed', pill.classList.contains('active') ? 'true' : 'false');
      });
    });

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

    function renderActiveFilters(filters) {
      if (!activeFilters) return;
      const chips = [];
      if (filters.q) chips.push('Player: ' + filters.q);
      if (filters.team) chips.push('Team: ' + filters.team);
      if (filters.sport && filters.sport !== 'All Sports') chips.push(filters.sport);
      if (filters.dates && filters.dates !== 'All Dates') chips.push(filters.dates);
      if (filters.sort && filters.sort !== 'Most Recent') chips.push(filters.sort);
      if (filters.media && filters.media !== 'All Media') chips.push(filters.media);
      activeFilters.innerHTML = chips.length ? chips.map((chip) => '<span class="active-chip">' + chip + '</span>').join('') : '<span class="active-chip">No active filters</span>';
    }

    function renderEmptyActions() {
      if (!emptyState) return;
      emptyState.innerHTML = [
        '<span class="results-empty-title">No results for this filter set</span>',
        '<span>Try one of these quick recovery actions.</span>',
        '<div class="results-empty-actions">',
        '<button class="results-empty-btn" data-empty-action="clear-all" type="button">Clear all filters</button>',
        '<button class="results-empty-btn" data-empty-action="last-30" type="button">Use Last 30 Days</button>',
        '<button class="results-empty-btn" data-empty-action="video-only" type="button">Videos only</button>',
        '</div>',
      ].join('');
    }

    function tokenize(text) {
      return String(text || '')
        .toLowerCase()
        .split(/[^a-z0-9#]+/)
        .map((token) => token.trim())
        .filter(Boolean);
    }

    function buildRelevanceForCard(card, filters) {
      const reasons = [];
      let score = 0;
      const meta = card._meta;
      const searchBlob = String(meta?.text || '').toLowerCase();

      if (filters.q) {
        if (searchBlob.includes(filters.q)) {
          score += 80;
          reasons.push('Exact search');
        }

        const jerseyToken = filters.q.match(/^#?\d{1,3}$/);
        if (jerseyToken && searchBlob.includes(jerseyToken[0].replace(/^#/, ''))) {
          score += 120;
          reasons.push('Exact jersey');
        }

        const queryTokens = tokenize(filters.q).slice(0, 4);
        queryTokens.forEach((token) => {
          if (token.length >= 2 && searchBlob.includes(token)) {
            score += 18;
          }
        });
      }

      if (filters.team) {
        const teamText = String(meta?.team || '').toLowerCase();
        if (teamText === filters.team) {
          score += 85;
          reasons.push('Exact team');
        } else if (teamText.includes(filters.team) || searchBlob.includes(filters.team)) {
          score += 55;
          reasons.push('Team match');
        }
      }

      if (filters.sport && filters.sport !== 'All Sports' && String(meta?.sport || '') === filters.sport) {
        score += 35;
        reasons.push('Sport match');
      }

      return {
        score,
        reasons: reasons.slice(0, 3),
      };
    }

    function renderMatchReasons(card, reasons) {
      const info = card.querySelector('.game-info');
      if (!info) return;

      let wrap = info.querySelector('.game-match-reasons');
      if (!reasons.length) {
        if (wrap) wrap.remove();
        return;
      }

      if (!wrap) {
        wrap = document.createElement('div');
        wrap.className = 'game-match-reasons';
        const bottom = info.querySelector('.game-bottom');
        if (bottom) info.insertBefore(wrap, bottom);
        else info.appendChild(wrap);
      }

      wrap.setAttribute('aria-label', 'Why this result matched');
      wrap.innerHTML = reasons.map((reason) => '<span class="game-match-reason">' + reason + '</span>').join('');
    }

    function copyFilteredView() {
      const filters = currentFilters();
      const params = new URLSearchParams();
      if (filters.q) params.set('q', filters.q);
      if (filters.team) params.set('team', filters.team);
      if (filters.sport && filters.sport !== 'All Sports') params.set('sport', filters.sport);
      if (filters.dates && filters.dates !== 'All Dates') params.set('date_range', filters.dates);
      if (filters.sort && filters.sort !== 'Most Recent') params.set('sort', filters.sort);
      if (filters.media && filters.media !== 'All Media') params.set('media_type', filters.media);

      const query = params.toString();
      const url = window.location.href.split('?')[0] + (query ? '?' + query : '');

      const onSuccess = () => trackEvent('marketplace_filtered_link_copy', { hasQuery: Boolean(query) });
      const onFailure = () => alert('Unable to copy filtered link in this browser context.');

      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(url).then(onSuccess).catch(onFailure);
        return;
      }

      const helper = document.createElement('textarea');
      helper.value = url;
      document.body.appendChild(helper);
      helper.select();
      try {
        const copied = document.execCommand('copy');
        if (copied) onSuccess();
        else onFailure();
      } catch {
        onFailure();
      } finally {
        helper.remove();
      }
    }

    function downloadJsonFile(fileName, payload) {
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const href = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      window.setTimeout(() => {
        link.remove();
        URL.revokeObjectURL(href);
      }, 0);
    }

    function runStaticHealthCheck(options) {
      const opts = options || {};
      const checks = [];
      checks.push({ label: 'Results grid present', ok: Boolean(gameGrid) });
      checks.push({ label: 'Cards loaded', ok: cards.length > 0 });
      checks.push({ label: 'Search inputs available', ok: Boolean(playerInput && teamInput) });
      checks.push({ label: 'Filter rows available', ok: filterRows.length > 0 });

      if (window.location.protocol === 'file:') {
        const firstHref = cards[0]?.getAttribute('href') || '';
        checks.push({
          label: 'file:// game link fallback active',
          ok: !firstHref || firstHref.includes('marketplace-game-preview.html'),
        });
      }

      const failures = checks.filter((check) => !check.ok);
      const summary = checks.map((check) => (check.ok ? 'PASS: ' : 'FAIL: ') + check.label).join('\n');
      const report = {
        timestamp: new Date().toISOString(),
        source: opts.reason || 'manual',
        passed: failures.length === 0,
        checks,
        failures: failures.map((item) => item.label),
      };

      safeWrite(HEALTH_REPORT_KEY, report);

      if (!opts.silent) {
        alert('Static Marketplace Health Check\n\n' + summary);
      }

      if (opts.exportReport) {
        downloadJsonFile('marketplace-static-health-report.json', report);
      }

      trackEvent('marketplace_static_health_check', {
        passed: report.passed,
        source: report.source,
        failures: report.failures,
      });

      return report;
    }

    function applyFilters() {
      const q = (playerInput?.value || '').trim().toLowerCase();
      const team = (teamInput?.value || '').trim().toLowerCase();
      const sport = activeFilter('Sport');
      const dates = activeFilter('Dates');
      const sort = activeFilter('Sort');
      const media = activeFilter('Media');

      renderActiveFilters({ q, team, sport, dates, sort, media });
      let filtered = cards.filter((card) => {
        const m = card._meta;
        return (!q || m.text.includes(q)) && (!team || m.team.includes(team)) && (!sport || sport === 'All Sports' || m.sport === sport) && isDateMatch(dates, m.date) && (!media || media === 'All Media' || m.media === media);
      });

      const hasSearchSignal = Boolean(q || team || (sport && sport !== 'All Sports'));
      filtered = filtered.map((card) => {
        const relevance = buildRelevanceForCard(card, { q, team, sport });
        card._matchReasons = relevance.reasons;
        card._relevanceScore = relevance.score;
        return card;
      });

      if (hasSearchSignal) {
        filtered = filtered.slice().sort((a, b) => {
          if (b._relevanceScore !== a._relevanceScore) return b._relevanceScore - a._relevanceScore;
          if (sort === 'Most Clips' && b._meta.clips !== a._meta.clips) return b._meta.clips - a._meta.clips;
          return b._meta.date - a._meta.date;
        });
      } else if (sort === 'Most Clips') filtered = filtered.slice().sort((a, b) => b._meta.clips - a._meta.clips);
      else filtered = filtered.slice().sort((a, b) => b._meta.date - a._meta.date);

      const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
      if (currentPage > totalPages) currentPage = totalPages;

      const start = (currentPage - 1) * pageSize;
      const visible = new Set(filtered.slice(start, start + pageSize));
      cards.forEach((card) => { card.style.display = visible.has(card) ? '' : 'none'; });
      cards.forEach((card) => renderMatchReasons(card, visible.has(card) ? (card._matchReasons || []) : []));
      filtered.forEach((card) => gameGrid.appendChild(card));

      const clipTotal = filtered.reduce((sum, card) => sum + card._meta.clips, 0);
      resultsCount.innerHTML = '<strong>' + clipTotal.toLocaleString() + '</strong> clips across <strong>' + filtered.length + '</strong> games';
      if (emptyState) emptyState.style.display = filtered.length ? 'none' : 'block';

      pageButtons.forEach((btn, index) => {
        const page = index + 1;
        if (page <= totalPages) {
          btn.style.display = '';
          btn.textContent = String(page);
          btn.classList.toggle('active', page === currentPage);
          btn.setAttribute('aria-current', page === currentPage ? 'page' : 'false');
        } else {
          btn.style.display = 'none';
        }
      });
      if (prevBtn) prevBtn.disabled = currentPage <= 1;
      if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
      if (pageInfo) pageInfo.textContent = 'of ' + totalPages;
    }

    function queueApply() {
      if (loadingTimer) window.clearTimeout(loadingTimer);
      gameGrid.classList.add('is-loading');
      loadingTimer = window.setTimeout(() => {
        applyFilters();
        gameGrid.classList.remove('is-loading');
      }, 140);
    }

    function debounce(fn, delay) {
      let timer;
      return function () {
        clearTimeout(timer);
        const args = arguments;
        timer = setTimeout(() => fn.apply(null, args), delay);
      };
    }

    function addEnhancementControls() {
      if (searchBar && !document.getElementById('recentSearches')) {
        const select = document.createElement('select');
        select.id = 'recentSearches';
        select.className = 'search-recent';
        select.setAttribute('aria-label', 'Recent searches');
        searchBar.appendChild(select);
      }

      if (filterActions && !document.getElementById('saveFiltersBtn')) {
        const wrap = document.createElement('div');
        wrap.className = 'filter-extra-actions';
        wrap.innerHTML = '<button class="filter-extra-btn" id="saveFiltersBtn" type="button">Save Preset</button><select class="search-recent" id="savedPresetSelect" aria-label="Saved filter presets"><option value="">Saved presets</option></select><button class="filter-extra-btn" id="loadFiltersBtn" type="button">Use Preset</button><button class="filter-extra-btn" id="copyPresetLinkBtn" type="button">Quick Link</button><button class="filter-extra-btn" id="copyPresetPayloadBtn" type="button">Copy Payload</button><button class="filter-extra-btn" id="importPresetPayloadBtn" type="button">Import Payload</button><button class="filter-extra-btn" id="exportPresetsBtn" type="button">Export Presets</button><button class="filter-extra-btn" id="importPresetsBtn" type="button">Import Presets</button><button class="filter-extra-btn" id="renamePresetBtn" type="button">Rename</button><button class="filter-extra-btn filter-extra-btn-danger" id="deletePresetBtn" type="button">Delete</button><button class="filter-extra-btn" id="copyFilteredViewBtn" type="button">Copy Filtered View</button><button class="filter-extra-btn" id="staticHealthCheckBtn" type="button">Run Health Check Now</button><button class="filter-extra-btn" id="exportHealthReportBtn" type="button">Export Health Report</button><input id="importPresetsInput" type="file" accept="application/json" style="display:none">';
        filterActions.insertAdjacentElement('afterend', wrap);

        const quickLinks = document.createElement('div');
        quickLinks.className = 'saved-preset-links';
        quickLinks.id = 'presetQuickLinks';
        filterActions.insertAdjacentElement('afterend', quickLinks);

        const healthStatus = document.createElement('div');
        healthStatus.id = 'healthStatus';
        healthStatus.className = 'health-status';
        healthStatus.innerHTML = '<strong>Health Check: Not Run</strong><div>Run the check to validate static demo flow.</div>';
        filterActions.insertAdjacentElement('afterend', healthStatus);
      }

      if (!document.getElementById('mobileActionBar')) {
        const bar = document.createElement('div');
        bar.id = 'mobileActionBar';
        bar.className = 'mobile-action-bar';
        bar.innerHTML = '<button class="mobile-action-btn" id="mobileFilterBtn" type="button">Filter</button><button class="mobile-action-btn" id="mobileSortBtn" type="button">Sort</button><button class="mobile-action-btn" id="mobileClearBtn" type="button">Clear</button>';
        document.body.appendChild(bar);
      }
    }

    injectEnhancementStyles();
    addEnhancementControls();
    renderEmptyActions();
    updateRecentSearchesSelect();
    renderPresetControls('');
    renderHealthStatus(safeRead(HEALTH_REPORT_KEY, null));

    filterRows.forEach((row) => {
      const pills = Array.from(row.querySelectorAll('.filter-pill'));
      const filterGroup = (row.querySelector('.filter-label')?.textContent || '').trim().toLowerCase();
      pills.forEach((pill) => {
        pill.addEventListener('click', () => {
          pills.forEach((item) => item.classList.remove('active'));
          pill.classList.add('active');
          pills.forEach((item) => item.setAttribute('aria-pressed', item.classList.contains('active') ? 'true' : 'false'));
          trackEvent('marketplace_filter_change', { group: filterGroup, value: pill.textContent.trim() });
          currentPage = 1;
          queueApply();
        });
      });
    });

    const debouncedApply = debounce(() => { currentPage = 1; queueApply(); }, 120);
    [playerInput, teamInput].forEach((input) => {
      if (!input) return;
      input.addEventListener('input', debouncedApply);
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          currentPage = 1;
          queueApply();
        }
      });
    });

    if (searchBtn) {
      searchBtn.addEventListener('click', (event) => {
        event.preventDefault();
        saveRecentSearch();
        trackEvent('marketplace_search_submit', { hasPlayer: Boolean((playerInput?.value || '').trim()), hasTeam: Boolean((teamInput?.value || '').trim()) });
        currentPage = 1;
        queueApply();
      });
    }

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        if (playerInput) playerInput.value = '';
        if (teamInput) teamInput.value = '';
        trackEvent('marketplace_search_clear', {});
        currentPage = 1;
        queueApply();
      });
    }

    if (clearAllFiltersBtn) {
      clearAllFiltersBtn.addEventListener('click', () => {
        filterRows.forEach((row) => {
          const pills = Array.from(row.querySelectorAll('.filter-pill'));
          pills.forEach((pill, index) => {
            pill.classList.toggle('active', index === 0);
            pill.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
          });
        });
        if (playerInput) playerInput.value = '';
        if (teamInput) teamInput.value = '';
        trackEvent('marketplace_filters_clear_all', {});
        currentPage = 1;
        queueApply();
      });
    }

    if (prevBtn) prevBtn.addEventListener('click', () => { if (currentPage > 1) { currentPage -= 1; trackEvent('marketplace_page_change', { direction: 'prev', page: currentPage }); queueApply(); } });
    if (nextBtn) nextBtn.addEventListener('click', () => { if (!nextBtn.disabled) { currentPage += 1; trackEvent('marketplace_page_change', { direction: 'next', page: currentPage }); queueApply(); } });
    pageButtons.forEach((btn, index) => btn.addEventListener('click', () => { currentPage = index + 1; trackEvent('marketplace_page_change', { direction: 'direct', page: currentPage }); queueApply(); }));

    if (emptyState) {
      emptyState.addEventListener('click', (event) => {
        const action = event.target?.getAttribute('data-empty-action');
        if (!action) return;
        if (action === 'clear-all') return clearAllFiltersBtn?.click();
        if (action === 'last-30') {
          setActiveFilter('Dates', 'Last 30 Days');
          currentPage = 1;
          return queueApply();
        }
        if (action === 'video-only') {
          setActiveFilter('Media', 'Videos Only');
          currentPage = 1;
          return queueApply();
        }
      });
    }

    const saveFiltersBtn = document.getElementById('saveFiltersBtn');
    if (saveFiltersBtn) {
      saveFiltersBtn.addEventListener('click', () => {
        saveCurrentFilters();
        saveFiltersBtn.textContent = 'Saved';
        window.setTimeout(() => { saveFiltersBtn.textContent = 'Save Preset'; }, 1000);
      });
    }

    const savedPresetSelect = document.getElementById('savedPresetSelect');

    const loadFiltersBtn = document.getElementById('loadFiltersBtn');
    if (loadFiltersBtn) loadFiltersBtn.addEventListener('click', () => applySavedFilters(savedPresetSelect && savedPresetSelect.value ? savedPresetSelect.value : undefined));

    const copyPresetLinkBtn = document.getElementById('copyPresetLinkBtn');
    if (copyPresetLinkBtn) {
      copyPresetLinkBtn.addEventListener('click', () => {
        if (!savedPresetSelect || !savedPresetSelect.value) return;
        copyPresetQuickLink(savedPresetSelect.value);
      });
    }

    const copyPresetPayloadBtn = document.getElementById('copyPresetPayloadBtn');
    if (copyPresetPayloadBtn) {
      copyPresetPayloadBtn.addEventListener('click', () => {
        if (!savedPresetSelect || !savedPresetSelect.value) return;
        copyPresetPayload(savedPresetSelect.value);
      });
    }

    const importPresetPayloadBtn = document.getElementById('importPresetPayloadBtn');
    if (importPresetPayloadBtn) {
      importPresetPayloadBtn.addEventListener('click', () => importPresetPayload());
    }

    const exportPresetsBtn = document.getElementById('exportPresetsBtn');
    if (exportPresetsBtn) exportPresetsBtn.addEventListener('click', () => exportPresetCollection());

    const importPresetsBtn = document.getElementById('importPresetsBtn');
    const importPresetsInput = document.getElementById('importPresetsInput');
    if (importPresetsBtn && importPresetsInput) {
      importPresetsBtn.addEventListener('click', () => importPresetsInput.click());
      importPresetsInput.addEventListener('change', (event) => {
        const file = event.target && event.target.files ? event.target.files[0] : null;
        importPresetCollection(file);
        event.target.value = '';
      });
    }

    const renamePresetBtn = document.getElementById('renamePresetBtn');
    if (renamePresetBtn) {
      renamePresetBtn.addEventListener('click', () => {
        const presetId = savedPresetSelect && savedPresetSelect.value ? savedPresetSelect.value : undefined;
        renamePreset(presetId);
      });
    }

    const deletePresetBtn = document.getElementById('deletePresetBtn');
    if (deletePresetBtn) {
      deletePresetBtn.addEventListener('click', () => {
        const presetId = savedPresetSelect && savedPresetSelect.value ? savedPresetSelect.value : undefined;
        deletePreset(presetId);
      });
    }

    const copyFilteredViewBtn = document.getElementById('copyFilteredViewBtn');
    if (copyFilteredViewBtn) copyFilteredViewBtn.addEventListener('click', () => copyFilteredView());

    const staticHealthCheckBtn = document.getElementById('staticHealthCheckBtn');
    if (staticHealthCheckBtn) {
      staticHealthCheckBtn.addEventListener('click', () => {
        const report = runStaticHealthCheck({ reason: 'manual' });
        renderHealthStatus(report);
      });
    }

    const exportHealthReportBtn = document.getElementById('exportHealthReportBtn');
    if (exportHealthReportBtn) {
      exportHealthReportBtn.addEventListener('click', () => {
        const report = safeRead(HEALTH_REPORT_KEY, null) || runStaticHealthCheck({ silent: true, reason: 'export' });
        renderHealthStatus(report);
        downloadJsonFile('marketplace-static-health-report.json', report);
      });
    }

    const presetQuickLinks = document.getElementById('presetQuickLinks');
    if (presetQuickLinks) {
      presetQuickLinks.addEventListener('click', (event) => {
        const button = event.target && event.target.closest ? event.target.closest('button[data-preset-action]') : null;
        if (!button) return;
        const presetId = button.getAttribute('data-preset-id') || '';
        if (!presetId) return;
        applySavedFilters(presetId);
        if (savedPresetSelect) savedPresetSelect.value = presetId;
      });
    }

    const recentSearches = document.getElementById('recentSearches');
    if (recentSearches) {
      recentSearches.addEventListener('change', () => {
        if (!recentSearches.value) return;
        const [qEncoded, teamEncoded] = recentSearches.value.split('||');
        if (playerInput) playerInput.value = decodeURIComponent(qEncoded || '');
        if (teamInput) teamInput.value = decodeURIComponent(teamEncoded || '');
        currentPage = 1;
        queueApply();
      });
    }

    const mobileFilterBtn = document.getElementById('mobileFilterBtn');
    if (mobileFilterBtn) mobileFilterBtn.addEventListener('click', () => filterSection?.scrollIntoView({ behavior: 'smooth', block: 'start' }));

    const mobileSortBtn = document.getElementById('mobileSortBtn');
    if (mobileSortBtn) {
      mobileSortBtn.addEventListener('click', () => {
        const nextSort = activeFilter('Sort') === 'Most Clips' ? 'Most Recent' : 'Most Clips';
        setActiveFilter('Sort', nextSort);
        currentPage = 1;
        queueApply();
      });
    }

    const mobileClearBtn = document.getElementById('mobileClearBtn');
    if (mobileClearBtn) mobileClearBtn.addEventListener('click', () => clearAllFiltersBtn?.click());

    document.addEventListener('keydown', (event) => {
      const isTyping = event.target && (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT' || event.target.isContentEditable);
      if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey && !isTyping) {
        event.preventDefault();
        playerInput?.focus();
        playerInput?.select();
      }
    });

    window.setTimeout(() => {
      const report = runStaticHealthCheck({ silent: true, reason: 'auto_boot' });
      renderHealthStatus(report);
    }, 900);

    applyFilters();
  })();
