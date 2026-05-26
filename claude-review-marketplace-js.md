# Marketplace Page - Claude JS Review Packet

## File
- marketplace.html

## Purpose
Client-side filtering, sorting, and pagination for game cards in static preview mode.

## Notes
- The current file appears to contain the same filtering script twice.
- Review for duplication risk, UX consistency, and maintainability.

## JavaScript (core script)
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

    cards.forEach((card) => {
      card.style.display = visible.has(card) ? '' : 'none';
    });

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

## Prompt For Claude
```text
Review this marketplace filtering/pagination script for a static demo page.
Please identify what would make it stronger in:
1) reliability and edge cases
2) UX responsiveness and discoverability
3) accessibility + keyboard behavior
4) maintainability and code duplication risk
5) performance under larger card counts

Return:
1. Top 8 improvements ranked by impact
2. Quick wins under 30 minutes
3. Medium refactors (1-3 hours)
4. Any bug risks or regressions likely in this implementation
5. Suggested code-level changes for top 3 items
```
