import { NextResponse } from 'next/server';
import { listAdAccounts, resolveAccountsForRegion } from '@/lib/meta-ads';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const all = await listAdAccounts(true);
    const us = await resolveAccountsForRegion('US');
    const br = await resolveAccountsForRegion('BR');
    return NextResponse.json({ all, resolved: { US: us, BR: br } });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
