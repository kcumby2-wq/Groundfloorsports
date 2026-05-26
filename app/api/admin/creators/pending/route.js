import { NextResponse } from 'next/server';
import { getPendingCreators, approveCreator } from '@/lib/creatorApproval';
import { requireAdmin } from '@/lib/auth';
import { auditLog } from '@/lib/auditLog';

export async function GET() {
  await requireAdmin();
  await auditLog('admin_creator_approval_access', { admin: true });
  const creators = await getPendingCreators();
  return NextResponse.json(creators);
}

export async function POST(req) {
  await requireAdmin();
  await auditLog('admin_creator_approval_action', { admin: true });
  const { userId } = await req.json();
  await approveCreator(userId);
  return NextResponse.json({ success: true });
}
