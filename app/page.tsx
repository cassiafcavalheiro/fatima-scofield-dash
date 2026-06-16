'use client';
import { useCallback, useEffect, useState } from 'react';
import Header from '@/components/Header';
import KpiCard from '@/components/KpiCard';
import Funnel from '@/components/Funnel';
import GenderDonut from '@/components/GenderDonut';
import TimeSeriesArea from '@/components/charts/TimeSeriesArea';
import SpendVsRevenue from '@/components/charts/SpendVsRevenue';
import BarRanking from '@/components/charts/BarRanking';
import ScatterRoas from '@/components/charts/ScatterRoas';
import AgeGroupBar from '@/components/charts/AgeGroupBar';
import ReachFrequency from '@/components/charts/ReachFrequency';
import MonthlyRoas from '@/components/charts/MonthlyRoas';
import ObjectiveSpend from '@/components/charts/ObjectiveSpend';
import RegionList from '@/components/charts/RegionMap';
import PerformanceByAge from '@/components/PerformanceByAge';
import CampaignsTable from '@/components/CampaignsTable';
import AdsTable from '@/components/AdsTable';
import TopCreatives from '@/components/TopCreatives';
import Diagnostico from '@/components/Diagnostico';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/format';
import type { DashboardData, DateRange, Period, Region } from '@/lib/types';

const currencyFor = (r: Region) => (r === 'BR' ? 'BRL' : 'USD');

export default function HomePage() {
  const [region, setRegion] = useState<Region>('BR');
  const [period, setPeriod] = useState<Period>('28d');
  const [customRange, setCustomRange] = useState<DateRange | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'geral' | 'diagnostico'>('geral');

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ region, period });
      if (customRange && period === 'custom') {
        params.set('since', customRange.since);
        params.set('until', customRange.until);
      }
      const r = await fetch(`/api/dashboard?${params.toString()}`);
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j?.error || `HTTP ${r.status}`);
      }
      setData(await r.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [region, period, customRange]);

  useEffect(() => { load(); }, [load]);

  const handleCustomRange = (range: DateRange) => {
    setCustomRange(range);
    setPeriod('custom');
  };

  const handleExportPdf = () => {
    window.print();
  };

  const currency = currencyFor(region);

  return (
    <div className="min-h-screen">
      <Header
        region={region}
        period={period}
        lastUpdated={data?.lastUpdated}
        dateRange={data?.dateRange}
        onRegionChange={setRegion}
        onPeriodChange={setPeriod}
        onCustomRange={handleCustomRange}
        onRefresh={load}
        onExportPdf={handleExportPdf}
      />

      <main className="max-w-[1480px] mx-auto px-4 sm:px-6 py-5 space-y-5">
        {error && (
          <div className="card border-rose-300 bg-rose-50 text-rose-700 text-sm">
            <strong>Erro:</strong> {error}
            <div className="text-xs mt-1 text-rose-600">
              Check that META_ACCESS_TOKEN is valid and that the 3 accounts (Fátima Scofield, Fátima Scofield - B2C, Fátima Scofield - B2B) are accessible by the token.
            </div>
          </div>
        )}

        {!data && loading && (
          <div className="card text-center py-12 text-ink-500">Carregando dados do Meta Ads…</div>
        )}

        {data && (
          <>
            {/* Section title: Fátima Scofield · BRL */}
            <div className="flex items-center gap-2 mt-2">
              <h2 className="text-sm font-semibold tracking-widest uppercase text-ink-700">
                Fátima Scofield · Geral + B2C + B2B
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-brand-100 text-brand-700">
                {currency}
              </span>
            </div>

            {/* Abas */}
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => setView('geral')}
                style={{ padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}
                className={view === 'geral' ? 'bg-ink-900 text-white' : 'bg-ink-50 text-ink-600 hover:bg-ink-100'}
              >
                Visão geral
              </button>
              <button
                onClick={() => setView('diagnostico')}
                style={{ padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}
                className={view === 'diagnostico' ? 'bg-ink-900 text-white' : 'bg-ink-50 text-ink-600 hover:bg-ink-100'}
              >
                Diagnóstico
              </button>
            </div>

            {view === 'geral' && (
            <>
            {/* Row 1: KPIs (left, 9 col) | Gender donut (right, 3 col) — auto height */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              <div className="lg:col-span-9 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] font-semibold tracking-widest text-ink-400 uppercase">
                  <div>Custo e Receita</div>
                  <div>Eficiência de Receita</div>
                  <div>Métricas de Clique</div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  <KpiCard kpi={data.kpis.spend} currency={currency} />
                  <KpiCard kpi={data.kpis.revenue} currency={currency} />
                  <KpiCard kpi={data.kpis.roas} hint="Receita / Gasto" />
                  <KpiCard kpi={data.kpis.convRate} hint="Compras / Cliques" />
                  <KpiCard kpi={data.kpis.clicks} />
                  <KpiCard kpi={data.kpis.cpc} currency={currency} hint="Gasto / Cliques" />
                </div>
              </div>

              <div className="lg:col-span-3">
                <GenderDonut data={data.purchasesByGender} />
              </div>
            </section>

            {/* Row 2: Top Campaigns (left, 9 col) | Funnel (right, 3 col) — auto height */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              <div className="lg:col-span-9">
                <CampaignsTable data={data.campaigns} currency={currency} />
              </div>
              <div className="lg:col-span-3">
                <Funnel {...data.funnel} />
              </div>
            </section>

            {/* Top 7d rankings */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <BarRanking
                title="Principais campanhas"
                data={data.topCampaigns7d.map((c) => ({ name: c.name, value: c.spend }))}
                formatValue={(v) => formatCurrency(v, currency, true)}
              />
              <BarRanking
                title="Campanhas com CPC alto"
                data={data.highCpcCampaigns7d.map((c) => ({ name: c.name, value: c.cpc }))}
                formatValue={(v) => formatCurrency(v, currency, true)}
                color="#7E22CE"
              />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <AgeGroupBar data={data.ageGroupSpend} currency={currency} />
              <RegionList data={data.regionsBySpend} currency={currency} />
            </section>

            <PerformanceByAge data={data.agePerformance} currency={currency} />

            <ScatterRoas data={data.scatter} currency={currency} />
            <SpendVsRevenue data={data.series.spendVsRevenue} currency={currency} />

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1"><ObjectiveSpend data={data.topCampaignsByObjective} currency={currency} /></div>
              <div className="lg:col-span-2"><TimeSeriesArea
                title="Valor gasto"
                data={data.series.spendByDay}
                yFormat={(v) => formatCurrency(v, currency, true)}
              /></div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TimeSeriesArea
                title="Impressões"
                data={data.series.impressions}
                yFormat={(v) => formatNumber(v, true)}
              />
              <ReachFrequency data={data.series.reachFrequency} />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TimeSeriesArea
                title="Cliques (todos)"
                data={data.series.clicks}
                yFormat={(v) => formatNumber(v, true)}
              />
              <TimeSeriesArea
                title="CTR (todos)"
                data={data.series.ctr}
                yFormat={(v) => formatPercent(v, 2)}
              />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TimeSeriesArea
                title="CPC (todos)"
                data={data.series.cpc}
                yFormat={(v) => formatCurrency(v, currency, true)}
              />
              <TimeSeriesArea
                title="ROAS · Diário"
                data={data.series.roas}
                yFormat={(v) => v.toFixed(2)}
                type="line"
              />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <BarRanking
                title="Principais anúncios (por compras)"
                data={data.topAds7d.map((a) => ({ name: a.name, value: a.purchases }))}
                formatValue={(v) => formatNumber(v)}
              />
              <MonthlyRoas data={data.series.roasMonthly} />
            </section>

            <AdsTable data={data.ads} currency={currency} />

            <TopCreatives data={data.topCreatives} currency={currency} />
            </>
            )}

            {view === 'diagnostico' && <Diagnostico data={data} />}

            <footer className="text-xs text-ink-500 text-center py-6 border-t border-ink-200 mt-8">
              <div>Fátima Scofield Analytics · Meta Ads (Geral + B2C + B2B)</div>
              <div className="mt-1">Período: {data.dateRange.since} → {data.dateRange.until} · vs. {data.comparisonRange.since} → {data.comparisonRange.until}</div>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}
