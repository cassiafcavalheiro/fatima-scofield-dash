'use client';
import type { CreativeCard } from '@/lib/types';
import { formatCurrency, formatDecimal, formatNumber, formatPercent } from '@/lib/format';

export default function TopCreatives({ data, currency = 'BRL' }: { data: CreativeCard[]; currency?: string }) {
  if (!data || data.length === 0) return null;
  return (
    <div className="card">
      <div className="card-title">Top 5 criativos</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {data.map((c, i) => (
          <div key={c.id} className="rounded-xl border border-stone-200 overflow-hidden bg-white flex flex-col">
            <div className="relative bg-stone-100 aspect-square">
              {c.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-ink-400 text-xs">
                  sem imagem
                </div>
              )}
              <span className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-brand-500 text-white text-[11px] font-bold flex items-center justify-center">
                {i + 1}
              </span>
            </div>
            <div className="p-2.5 flex flex-col gap-1">
              <div className="text-[12px] font-medium text-ink-800 leading-snug line-clamp-2" title={c.name}>
                {c.name}
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] text-ink-600 mt-1">
                <span className="text-ink-400">Gasto</span>
                <span className="text-right tabular-nums">{formatCurrency(c.spend, currency, true)}</span>
                <span className="text-ink-400">Compras</span>
                <span className="text-right tabular-nums">{formatNumber(c.purchases)}</span>
                <span className="text-ink-400">Receita</span>
                <span className="text-right tabular-nums">{formatCurrency(c.revenue, currency, true)}</span>
                <span className="text-ink-400">ROAS</span>
                <span className="text-right tabular-nums font-semibold text-brand-700">{formatDecimal(c.roas)}</span>
                <span className="text-ink-400">CTR</span>
                <span className="text-right tabular-nums">{formatPercent((c.ctr ?? 0), 2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
