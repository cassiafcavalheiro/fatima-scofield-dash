'use client';
import type { DashboardData } from '@/lib/types';

const pctTxt = (v?: number) => {
  if (v == null || isNaN(v)) return '—';
  const s = v >= 0 ? '+' : '';
  return `${s}${v.toFixed(1)}%`;
};

/** Diagnóstico de causa e efeito: relaciona variações de receita/ROAS aos seus drivers
 *  e aponta o principal gargalo do funil. Tudo derivado dos KPIs (período vs anterior). */
export default function Diagnostico({ data }: { data: DashboardData }) {
  const k = data.kpis;
  const f = data.funnel;

  // Drivers (delta % período vs período anterior). higherIsBetter define a leitura de cor.
  const drivers = [
    { key: 'spend',    label: 'Investimento (gasto)', delta: k.spend.delta,    higherIsBetter: null,  causa: 'Mais verba investida tende a ampliar alcance e volume de compras.' },
    { key: 'roas',     label: 'Eficiência (ROAS)',    delta: k.roas.delta,     higherIsBetter: true,  causa: 'ROAS é o retorno por real investido — sobe quando criativos/segmentação melhoram.' },
    { key: 'convRate', label: 'Taxa de conversão',    delta: k.convRate.delta, higherIsBetter: true,  causa: 'Quantos cliques viram compra — afeta diretamente a receita.' },
    { key: 'cpc',      label: 'Custo por clique',     delta: k.cpc.delta,      higherIsBetter: false, causa: 'CPC menor reduz o custo de aquisição; CPC maior pressiona o ROAS.' },
    { key: 'clicks',   label: 'Volume de cliques',    delta: k.clicks.delta,   higherIsBetter: true,  causa: 'Volume de tráfego trazido pelas campanhas.' },
  ];

  const colorFor = (d?: number, higherIsBetter?: boolean | null) => {
    if (d == null || higherIsBetter == null) return 'text-ink-600';
    const good = higherIsBetter ? d >= 0 : d <= 0;
    return good ? 'text-emerald-600' : 'text-rose-600';
  };

  // Funil — taxas de conversão entre etapas
  const safe = (a: number, b: number) => (b > 0 ? (a / b) * 100 : 0);
  const steps = [
    { label: 'Cliques → Página', rate: safe(f.landingPageViews, k.clicks.value) },
    { label: 'Página → Carrinho', rate: safe(f.addsToCart, f.landingPageViews) },
    { label: 'Carrinho → Checkout', rate: safe(f.checkoutsInitiated, f.addsToCart) },
    { label: 'Checkout → Compra', rate: safe(f.purchases, f.checkoutsInitiated) },
  ].filter((s) => s.rate > 0);
  const bottleneck = steps.length ? steps.reduce((m, s) => (s.rate < m.rate ? s : m), steps[0]) : null;

  // Leitura automática (causa principal da variação de receita)
  const revD = k.revenue.delta ?? 0;
  const spendD = k.spend.delta ?? 0;
  const roasD = k.roas.delta ?? 0;
  let leitura: string;
  if (Math.abs(revD) < 1) {
    leitura = 'A receita ficou praticamente estável no período.';
  } else {
    const sobe = revD >= 0;
    const driverPrincipal = Math.abs(spendD) >= Math.abs(roasD) ? 'pela variação no investimento' : 'pela variação na eficiência (ROAS)';
    leitura = `A receita ${sobe ? 'subiu' : 'caiu'} ${pctTxt(revD)} no período, explicada principalmente ${driverPrincipal}. O ROAS ${roasD >= 0 ? 'melhorou' : 'piorou'} (${pctTxt(roasD)}) e o gasto variou ${pctTxt(spendD)}.`;
  }
  if (bottleneck) {
    leitura += ` O maior gargalo do funil é a etapa "${bottleneck.label}", com ${bottleneck.rate.toFixed(1)}% de conversão — foco de otimização.`;
  }

  return (
    <div className="card">
      <div className="card-title">Diagnóstico · Causa e Efeito</div>

      <div className="rounded-lg bg-brand-50 border border-brand-100 px-3 py-2.5 text-[13px] text-ink-700 leading-relaxed">
        {leitura}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-3">
        {drivers.map((d) => (
          <div key={d.key} className="rounded-lg border border-stone-200 p-2.5">
            <div className="text-[11px] text-ink-500 leading-tight">{d.label}</div>
            <div className={`text-[18px] font-bold tabular-nums mt-0.5 ${colorFor(d.delta, d.higherIsBetter)}`}>
              {d.delta != null ? (d.delta >= 0 ? '▲' : '▼') : ''} {pctTxt(d.delta)}
            </div>
            <div className="text-[10.5px] text-ink-400 leading-snug mt-1">{d.causa}</div>
          </div>
        ))}
      </div>

      {steps.length > 0 && (
        <div className="mt-4">
          <div className="text-[11px] font-semibold tracking-widest text-ink-400 uppercase mb-2">Conversão por etapa do funil</div>
          <div className="space-y-1.5">
            {steps.map((s) => {
              const isBottleneck = bottleneck && s.label === bottleneck.label;
              return (
                <div key={s.label} className="flex items-center gap-3 text-xs">
                  <div className="w-40 truncate text-ink-600">{s.label}</div>
                  <div className="flex-1 h-2.5 bg-ink-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isBottleneck ? 'bg-rose-500' : 'bg-brand-500'}`}
                      style={{ width: `${Math.min(s.rate, 100)}%` }}
                    />
                  </div>
                  <div className={`w-16 text-right font-medium tabular-nums ${isBottleneck ? 'text-rose-600' : 'text-ink-700'}`}>
                    {s.rate.toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-[11px] text-ink-400 mt-2">Em vermelho: etapa com menor conversão (principal ponto de perda).</div>
        </div>
      )}
    </div>
  );
}
