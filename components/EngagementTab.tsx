'use client';
import { useState } from 'react';
import type { EngagementPost } from '@/lib/types';
import { formatCurrency, formatNumber } from '@/lib/format';

export default function EngagementTab({ data, currency = 'BRL' }: { data: EngagementPost[]; currency?: string }) {
  const [selected, setSelected] = useState<EngagementPost | null>(null);

  const t = data.reduce(
    (a, r) => ({
      spend: a.spend + r.spend,
      engagement: a.engagement + r.engagement,
      likes: a.likes + r.likes,
      reactions: a.reactions + r.reactions,
      comments: a.comments + r.comments,
      saves: a.saves + r.saves,
      videoViews: a.videoViews + r.videoViews,
      linkClicks: a.linkClicks + r.linkClicks,
    }),
    { spend: 0, engagement: 0, likes: 0, reactions: 0, comments: 0, saves: 0, videoViews: 0, linkClicks: 0 }
  );
  const totalCpe = t.engagement > 0 ? t.spend / t.engagement : 0;

  return (
    <div className="card">
      <div className="card-title">Engajamento · Mídia paga</div>
      <p className="text-[13px] text-ink-600 -mt-1 mb-3">
        Posts impulsionados na campanha <strong className="text-ink-800">Engajamento_Instagram</strong> no período selecionado.
        Todos os resultados são <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-100 text-brand-700 align-middle">PAGO</span>.
        {data.length > 0 && <span> {data.length} criativos no período. Toque numa linha para ver o criativo ampliado.</span>}
      </p>

      {data.length === 0 ? (
        <div className="text-center py-10 text-ink-500 text-sm">Nenhum post impulsionado nessa campanha no período selecionado.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-ink-600 bg-brand-50">
              <tr>
                <th className="text-left px-2 py-1.5 min-w-[200px]">Criativo</th>
                <th className="text-right px-2 py-1.5">Gasto</th>
                <th className="text-right px-2 py-1.5">Engajamento</th>
                <th className="text-right px-2 py-1.5">Curtidas</th>
                <th className="text-right px-2 py-1.5">Reações</th>
                <th className="text-right px-2 py-1.5">Comentários</th>
                <th className="text-right px-2 py-1.5">Salvamentos</th>
                <th className="text-right px-2 py-1.5">Views vídeo</th>
                <th className="text-right px-2 py-1.5">Cliques</th>
                <th className="text-right px-2 py-1.5">Custo/engaj.</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setSelected(r)}
                  className="border-t border-ink-100 hover:bg-brand-50/60 cursor-pointer"
                >
                  <td className="px-2 py-1.5 min-w-[200px]">
                    <div className="flex items-center gap-2">
                      {r.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.image} alt={r.name} loading="lazy" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-stone-100 flex-shrink-0" />
                      )}
                      <span className="text-ink-800 font-medium leading-snug whitespace-normal break-words">{r.name}</span>
                    </div>
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums whitespace-nowrap">{formatCurrency(r.spend, currency, true)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums font-semibold text-brand-700">{formatNumber(r.engagement)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{formatNumber(r.likes)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{formatNumber(r.reactions)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{formatNumber(r.comments)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{formatNumber(r.saves)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{formatNumber(r.videoViews)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{formatNumber(r.linkClicks)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums whitespace-nowrap">{formatCurrency(r.costPerEngagement, currency, true)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-brand-300 bg-brand-50 font-semibold text-ink-800">
                <td className="px-2 py-1.5 min-w-[200px]">Total geral</td>
                <td className="px-2 py-1.5 text-right tabular-nums whitespace-nowrap">{formatCurrency(t.spend, currency, true)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{formatNumber(t.engagement)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{formatNumber(t.likes)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{formatNumber(t.reactions)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{formatNumber(t.comments)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{formatNumber(t.saves)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{formatNumber(t.videoViews)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{formatNumber(t.linkClicks)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums whitespace-nowrap">{formatCurrency(totalCpe, currency, true)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Modal criativo ampliado */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl overflow-hidden max-w-md w-full max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-stone-200">
              <span className="text-sm font-semibold text-ink-800 truncate pr-2">{selected.name}</span>
              <button onClick={() => setSelected(null)} className="text-ink-400 hover:text-ink-700 text-xl leading-none flex-shrink-0">×</button>
            </div>
            <div className="overflow-y-auto">
              {selected.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selected.image} alt={selected.name} className="w-full object-contain bg-stone-50 max-h-[55vh]" />
              ) : (
                <div className="w-full h-48 bg-stone-100 flex items-center justify-center text-ink-400 text-sm">sem imagem</div>
              )}
              <div className="p-4">
                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-100 text-brand-700 mb-3">PAGO</span>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[13px]">
                  <span className="text-ink-500">Gasto</span><span className="text-right tabular-nums">{formatCurrency(selected.spend, currency, true)}</span>
                  <span className="text-ink-500">Engajamento</span><span className="text-right tabular-nums font-semibold text-brand-700">{formatNumber(selected.engagement)}</span>
                  <span className="text-ink-500">Curtidas</span><span className="text-right tabular-nums">{formatNumber(selected.likes)}</span>
                  <span className="text-ink-500">Reações</span><span className="text-right tabular-nums">{formatNumber(selected.reactions)}</span>
                  <span className="text-ink-500">Comentários</span><span className="text-right tabular-nums">{formatNumber(selected.comments)}</span>
                  <span className="text-ink-500">Salvamentos</span><span className="text-right tabular-nums">{formatNumber(selected.saves)}</span>
                  <span className="text-ink-500">Views de vídeo</span><span className="text-right tabular-nums">{formatNumber(selected.videoViews)}</span>
                  <span className="text-ink-500">Cliques</span><span className="text-right tabular-nums">{formatNumber(selected.linkClicks)}</span>
                  <span className="text-ink-500">Custo/engaj.</span><span className="text-right tabular-nums">{formatCurrency(selected.costPerEngagement, currency, true)}</span>
                </div>
                {selected.permalink && (
                  <a href={selected.permalink} target="_blank" rel="noreferrer" className="inline-block mt-4 text-[13px] font-medium text-brand-700 hover:underline">
                    Abrir post no Instagram →
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
