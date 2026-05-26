import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { listOrdersForUser } from '@/lib/orderStore';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orders = await listOrdersForUser(userId);
  return NextResponse.json({ orders, count: orders.length });
}
