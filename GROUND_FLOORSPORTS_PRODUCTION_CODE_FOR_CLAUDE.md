# GroundfloorSports Production Code For Claude

This handoff mirrors your current production structure so Claude can redesign without changing your app architecture.

## 1) Marketplace Component

File source: `components/gfs/MarketplacePage.jsx`

```jsx
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import SiteHeader from '@/components/gfs/SiteHeader';
import SiteFooter from '@/components/gfs/SiteFooter';
import VideoShowcase from '@/components/gfs/VideoShowcase';

const SPORT_OPTIONS = ['All Sports', 'Football', '7v7', 'Combines', 'Camps'];
const DATE_OPTIONS = ['All Dates', 'Last 30 Days', 'This Season'];
const SORT_OPTIONS = ['Most Recent', 'Most Clips'];
const MEDIA_OPTIONS = ['All Media', 'Videos Only', 'Photos Only'];
const DEFAULT_RESULTS = {
  items: [],
  totalClips: 0,
  totalGames: 0,
  totalPages: 1,
  page: 1,
};

const SELLER_LABELS = {
  'Subject Report': 'SR',
  'Subject Media': 'SM',
  'Blu Chips': 'BC',
  'Pylon 7v7': 'PY',
};

function tagClass(tag) {
  if (tag === 'Live') return 'game-tag live';
  if (tag === 'Hot') return 'game-tag hot';
  if (tag === 'Subject Report') return 'game-tag sr';
  if (tag === 'Subject Media') return 'game-tag sm';
  if (tag.includes('Blu') || tag.includes('Pylon')) return 'game-tag bc';
  return 'game-tag';
}

export default function MarketplacePage() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [playerSearch, setPlayerSearch] = useState(searchParams.get('q') || '');
  const [teamSearch, setTeamSearch] = useState(searchParams.get('team') || '');
  const [results, setResults] = useState(DEFAULT_RESULTS);
  const [isLoading, setIsLoading] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const sport = searchParams.get('sport') || 'All Sports';
  const dates = searchParams.get('date_range') || 'All Dates';
  const sort = searchParams.get('sort') || 'Most Recent';
  const media = searchParams.get('media_type') || 'All Media';
  const page = Number(searchParams.get('page') || '1');
  const featuredGames = results.items.slice(0, 3);

  function patchQuery(nextValues) {
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
  }

  function onSearchSubmit(event) {
    event.preventDefault();
    patchQuery({ q: playerSearch, team: teamSearch, page: 1 });
  }

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
                  <Link key={game.slug} href={`/marketplace/games/${game.slug}`} className="spot-card">
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
              <span className="seller-chip"><strong>PY</strong> Pylon</span>
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
              value={playerSearch}
              onChange={(event) => setPlayerSearch(event.target.value)}
            />
            <input
              className="search-input"
              placeholder="Team or school"
              value={teamSearch}
              onChange={(event) => setTeamSearch(event.target.value)}
            />
            <button className="search-btn" type="submit">Find My Clips <span className="arrow">-&gt;</span></button>
          </form>
        </div>
      </section>

      <section className={mobileFiltersOpen ? 'filter-section open' : 'filter-section'}>
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
                onClick={() => patchQuery({ sport: option, page: 1 })}
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
                  onClick={() => patchQuery({ date_range: option, page: 1 })}
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
                  onClick={() => patchQuery({ sort: option, page: 1 })}
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
                  onClick={() => patchQuery({ media_type: option, page: 1 })}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="results-section" id="results">
        <div className="results-inner">
          <div className="results-header">
            <div className="results-count">
              <strong>{results.totalClips.toLocaleString()}</strong> clips across <strong>{results.totalGames}</strong> games
            </div>
          </div>

          {isLoading ? <div className="results-status">Loading results...</div> : null}

          <div className="game-grid">
            {results.items.map((game, idx) => (
              <Link key={game.slug} href={`/marketplace/games/${game.slug}`} className="game-card">
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
              onClick={() => patchQuery({ page: page - 1 })}
            >
              Prev
            </button>
            <span className="pg-info">Page {results.page} of {results.totalPages}</span>
            <button
              className="pg-btn"
              disabled={page >= results.totalPages}
              onClick={() => patchQuery({ page: page + 1 })}
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
```

## 2) Admin Page Component

File source: `app/admin/page.jsx`

```jsx
import Link from 'next/link';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import SiteHeader from '@/components/gfs/SiteHeader';
import SiteFooter from '@/components/gfs/SiteFooter';
import { getRoleFromClaims, hasRequiredRole } from '@/lib/roleAccess';

const ADMIN_ROLE_FILTERS = ['all', 'seller', 'athlete', 'fan'];

function getEmailAddress(user) {
  const primaryEmailId = user.primaryEmailAddressId;
  const primary = user.emailAddresses?.find((item) => item.id === primaryEmailId);
  return primary?.emailAddress || user.emailAddresses?.[0]?.emailAddress || 'No email';
}

function getUserRole(user) {
  return user.publicMetadata?.role || user.unsafeMetadata?.role || 'fan';
}

function formatDate(value) {
  if (!value) {
    return 'Never';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function GroundfloorAdminPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const roleFilter = String(resolvedSearchParams?.role || 'all').toLowerCase();
  const query = String(resolvedSearchParams?.q || '').trim().toLowerCase();
  const safeRoleFilter = ADMIN_ROLE_FILTERS.includes(roleFilter) ? roleFilter : 'all';

  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect('/sign-in?next=%2Fadmin');
  }

  const role = getRoleFromClaims(sessionClaims);
  const hasAdminAccess = hasRequiredRole(role, ['admin', 'seller']);

  if (!hasAdminAccess) {
    return (
      <main className="gfs-page">
        <SiteHeader />
        <section className="hero-shell">
          <p className="hero-eyebrow">Groundfloor Admin</p>
          <h1 className="hero-title">Admin access required</h1>
          <p className="hero-sub">
            Your current role is <span className="magenta">{role}</span>. This page requires
            <span className="magenta"> admin </span> or <span className="magenta">seller</span> access.
          </p>
          <div className="hero-actions">
            <Link className="hero-btn" href="/">Back To Home</Link>
            <Link className="hero-btn primary" href="/sign-in?next=%2Fadmin">Switch Account</Link>
          </div>
        </section>
        <SiteFooter />
      </main>
    );
  }

  const client = await clerkClient();
  const response = await client.users.getUserList({
    limit: 100,
    orderBy: '-created_at',
  });

  const users = Array.isArray(response?.data) ? response.data : [];
  const filteredUsers = users.filter((user) => {
    const userRole = String(getUserRole(user)).toLowerCase();
    const email = getEmailAddress(user).toLowerCase();
    const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim().toLowerCase();
    const username = String(user.username || '').toLowerCase();

    const roleMatches = safeRoleFilter === 'all' ? true : userRole === safeRoleFilter;
    const queryMatches = !query || `${displayName} ${username} ${email} ${userRole}`.includes(query);

    return roleMatches && queryMatches;
  });

  const exportParams = new URLSearchParams();
  if (safeRoleFilter !== 'all') {
    exportParams.set('role', safeRoleFilter);
  }
  if (query) {
    exportParams.set('q', query);
  }
  const exportUrl = `/api/admin/users/export${exportParams.toString() ? `?${exportParams.toString()}` : ''}`;

  return (
    <main className="gfs-page">
      <SiteHeader />
      <section className="hero-shell">
        <p className="hero-eyebrow">Groundfloor Admin</p>
        <h1 className="hero-title">Account Monitoring</h1>
        <p className="hero-sub">
          Logged-in account records across creators, athletes, and fans. Use this view to monitor
          role assignment and sign-in activity.
        </p>

        <div className="admin-user-kpis">
          <div><strong>{users.length}</strong><span>Total Accounts</span></div>
          <div><strong>{users.filter((item) => getUserRole(item) === 'seller').length}</strong><span>Creators</span></div>
          <div><strong>{users.filter((item) => getUserRole(item) === 'athlete').length}</strong><span>Athletes</span></div>
          <div><strong>{users.filter((item) => getUserRole(item) === 'fan').length}</strong><span>Fans</span></div>
        </div>

        <div className="admin-toolbar">
          <div className="admin-role-filters" role="group" aria-label="Role filters">
            {ADMIN_ROLE_FILTERS.map((filterRole) => {
              const params = new URLSearchParams();
              if (filterRole !== 'all') {
                params.set('role', filterRole);
              }
              if (query) {
                params.set('q', query);
              }
              const href = `/admin${params.toString() ? `?${params.toString()}` : ''}`;

              return (
                <Link
                  key={filterRole}
                  href={href}
                  className={safeRoleFilter === filterRole ? 'admin-filter-chip active' : 'admin-filter-chip'}
                >
                  {filterRole === 'all' ? 'All Roles' : filterRole}
                </Link>
              );
            })}
          </div>

          <form className="admin-search-form" method="get" action="/admin">
            {safeRoleFilter !== 'all' ? <input type="hidden" name="role" value={safeRoleFilter} /> : null}
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search name, email, or role"
              className="admin-search-input"
            />
            <button type="submit" className="hero-btn">Search</button>
            <Link href="/admin" className="hero-btn">Clear</Link>
            <a href={exportUrl} className="hero-btn primary">Export CSV</a>
          </form>
        </div>

        <p className="admin-results-summary">
          Showing {filteredUsers.length} account{filteredUsers.length === 1 ? '' : 's'}
          {filteredUsers.length !== users.length ? ` of ${users.length}` : ''}.
        </p>

        <div className="admin-user-table-wrap">
          <table className="admin-user-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th>Last Sign In</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || user.id;
                return (
                  <tr key={user.id}>
                    <td>{displayName}</td>
                    <td>{getEmailAddress(user)}</td>
                    <td><span className="admin-role-pill">{getUserRole(user)}</span></td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>{formatDate(user.lastSignInAt)}</td>
                  </tr>
                );
              })}

              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5}>No accounts match this filter.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
```

## 3) Admin CSV Export Endpoint

File source: `app/api/admin/users/export/route.js`

```js
import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { getRoleFromClaims, hasRequiredRole } from '@/lib/roleAccess';

const ADMIN_ROLE_FILTERS = ['all', 'seller', 'athlete', 'fan'];

function getEmailAddress(user) {
  const primaryEmailId = user.primaryEmailAddressId;
  const primary = user.emailAddresses?.find((item) => item.id === primaryEmailId);
  return primary?.emailAddress || user.emailAddresses?.[0]?.emailAddress || 'No email';
}

function getUserRole(user) {
  return user.publicMetadata?.role || user.unsafeMetadata?.role || 'fan';
}

function escapeCsvValue(value) {
  const raw = String(value ?? '');
  if (raw.includes(',') || raw.includes('"') || raw.includes('\n')) {
    return `"${raw.replace(/"/g, '""')}"`;
  }

  return raw;
}

export async function GET(request) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = getRoleFromClaims(sessionClaims);
  if (!hasRequiredRole(role, ['admin', 'seller'])) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const params = request.nextUrl.searchParams;
  const roleFilter = String(params.get('role') || 'all').toLowerCase();
  const query = String(params.get('q') || '').trim().toLowerCase();
  const safeRoleFilter = ADMIN_ROLE_FILTERS.includes(roleFilter) ? roleFilter : 'all';

  const client = await clerkClient();
  const response = await client.users.getUserList({
    limit: 100,
    orderBy: '-created_at',
  });

  const users = Array.isArray(response?.data) ? response.data : [];
  const filteredUsers = users.filter((user) => {
    const userRole = String(getUserRole(user)).toLowerCase();
    const email = getEmailAddress(user).toLowerCase();
    const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim().toLowerCase();
    const username = String(user.username || '').toLowerCase();

    const roleMatches = safeRoleFilter === 'all' ? true : userRole === safeRoleFilter;
    const queryMatches = !query || `${displayName} ${username} ${email} ${userRole}`.includes(query);

    return roleMatches && queryMatches;
  });

  const headers = ['name', 'email', 'role', 'created_at', 'last_sign_in_at'];
  const lines = [headers.join(',')];

  filteredUsers.forEach((user) => {
    const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || user.id;
    const row = [
      escapeCsvValue(displayName),
      escapeCsvValue(getEmailAddress(user)),
      escapeCsvValue(getUserRole(user)),
      escapeCsvValue(user.createdAt || ''),
      escapeCsvValue(user.lastSignInAt || ''),
    ];
    lines.push(row.join(','));
  });

  const csv = `${lines.join('\n')}\n`;
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="groundfloorsports-users.csv"',
    },
  });
}
```

## 4) Styling Dependency Notes

These components depend on class names defined in `app/globals.css`, especially:
- marketplace classes: `page-*`, `market-*`, `overview-*`, `spot-*`, `insight-*`, `search-*`, `filter-*`, `results-*`, `game-*`, `pagination`
- admin classes: `admin-user-*`, `admin-role-pill`, `admin-toolbar`, `admin-role-filters`, `admin-filter-chip`, `admin-search-*`, `admin-results-summary`

If Claude rewrites layouts, keep the same route/component boundaries to avoid breaking existing data flow.
