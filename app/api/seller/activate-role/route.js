import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const currentRole =
    (typeof user.publicMetadata?.role === 'string' && user.publicMetadata.role)
    || (typeof user.unsafeMetadata?.role === 'string' && user.unsafeMetadata.role)
    || 'fan';

  if (currentRole === 'seller') {
    return NextResponse.json({
      ok: true,
      role: 'seller',
      message: 'Seller access already enabled.',
    });
  }

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...user.publicMetadata,
      role: 'seller',
    },
    unsafeMetadata: {
      ...user.unsafeMetadata,
      role: 'seller',
    },
  });

  return NextResponse.json({
    ok: true,
    role: 'seller',
    message: 'Seller role activated.',
  });
}