import { NextRequest, NextResponse } from 'next/server';
import { buildDashboard } from '@/lib/aggregator';
import type { Period, Region } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Cron refresh endpoint.
 *
 * Schedule: Vercel cron runs 12:00 / 16:00 / 20:00 UTC daily
 *           (= 9h / 13h / 16h BRT). See vercel.json.
 *
 * Security: Vercel-managed crons include the header
 *   Authorization: Bearer ${process.env.CRON_SECRET}
 * Set CRON_SECRET in Vercel env to avoid public abuse.
 *
 * Behaviour:
 * - Warms server caches for both regions × main periods
 * - Returns a summary JSON with status per (region, period)
 */
export async function GET(req: NextRequest) {
  // Verify the request is from Vercel Cron (or has the right secret)
  const auth = req.headers.get('authorization');
  const expected = process.env.CRON_SECRET;
  if (expected && auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const regions: Region[] = ['US', 'BR'];
  const periods: Period[] = ['7d', '14d', '28d', '3M', '6M', '12M'];

  const results: { region: Region; period: Period; ok: boolean; ms: number; error?: string }[] = [];

  for (const region of regions) {
    for (const period of periods) {
      const t0 = Date.now();
      try {
        await buildDashboard(region, period);
        results.push({ region, period, ok: true, ms: Date.now() - t0 });
      } catch (e: any) {
        results.push({
          region, period, ok: false, ms: Date.now() - t0,
          error: e?.message?.slice(0, 200) || 'unknown',
        });
      }
    }
  }

  const summary = {
    runAt: new Date().toISOString(),
    totalCombos: results.length,
    succeeded: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    durationMs: results.reduce((a, b) => a + b.ms, 0),
    results,
  };

  return NextResponse.json(summary);
}

// Also accept POST so manual triggers (e.g. via curl) work without Authorization
export const POST = GET;
