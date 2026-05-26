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
