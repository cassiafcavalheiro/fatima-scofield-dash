import { NextRequest, NextResponse } from 'next/server';
import { fetchInsights, resolveAccountsForRegion } from '@/lib/meta-ads';
import { periodToRange } from '@/lib/dates';
import type { Region } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Debug endpoint: monthly spend per account for a region.
 * Use to validate aggregator totals against external sources.
 *
 * GET /api/debug/spend?region=US
 *
 * Returns:
 *  {
 *    region: 'US',
 *    accounts: [
 *      { id: 'act_xxx', name: 'Larroudé US', monthly: [{ month: '2026-04', spend: 123 }, ...] },
 *      ...
 *    ],
 *    totals: { '2026-04': 773000, '2026-03': 614920, ... }
 *  }
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const region = (searchParams.get('region') || 'US') as Region;
  const range = { since: periodToRange('12M').since, until: periodToRange('12M').until };

  const resolved = await resolveAccountsForRegion(region);

  const perAccount = await Promise.all(
    resolved.all.map(async (a) => {
      const rows = await fetchInsights(a.id, {
        level: 'account',
        timeRange: range,
        fields: ['spend', 'impressions', 'clicks'],
        timeIncrement: 'monthly',
      });
      const monthly = rows
        .map((r: any) => ({
          month: (r.date_start || '').slice(0, 7),
          spend: Number(r.spend) || 0,
        }))
        .sort((x, y) => (x.month < y.month ? -1 : 1));
      return { id: a.id, account_id: a.account_id, name: a.name, currency: a.currency, monthly };
    })
  );

  // Sum totals per month
  const totals: Record<string, number> = {};
  for (const acc of perAccount) {
    for (const m of acc.monthly) {
      totals[m.month] = (totals[m.month] || 0) + m.spend;
    }
  }

  return NextResponse.json({
    region,
    range,
    accounts: perAccount,
    totals,
  }, { headers: { 'Cache-Control': 'no-store' } });
}
