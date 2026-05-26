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
