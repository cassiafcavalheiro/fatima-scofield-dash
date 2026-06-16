'use client';
import type { EngagementPost } from '@/lib/types';
import { formatCurrency, formatNumber } from '@/lib/format';

export default function EngagementTab({ data, currency = 'BRL' }: { data: EngagementPost[]; currency?: string }) {
  const t = data.reduce(
    (a, r) => ({
      spend: a.spend + r.spend,
      engagement: a.engagement + r.engagement,
      reactions: a.reactions + r.reactions,
      comments: a.comments + r.comments,
      saves: a.saves + r.saves,
      videoViews: a.videoViews + r.videoViews,
      linkClicks: a.linkClicks + r.linkClicks,
    }),
    { spend: 0, engagement: 0, reactions: 0, comments: 0, saves: 0, videoViews: 0, linkClicks: 0 }
  );
  const totalCpe = t.engagement > 0 ? t.spend / t.engagement : 0;

  return (
    <div className="card">
      <div className="card-title">Engajamento · Mídia paga</div>
      <p className="text-[13px] text-ink-600 -mt-1 mb-3">
        Posts impulsionados na campanha <strong className="text-ink-800">Engajamento_Instagram</strong> no período selecionado.
        Todos os resultados abaixo são <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-100 text-brand-700 align-middle">PAGO</span>.
        {data.length > 0 && <span> {data.length} criativos no período.</span>}
      </p>

      {data.length === 0 ? (
        <div className="text-center py-10 text-ink-500 text-sm">Nenhum post impulsionado nessa campanha no período selecionado.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-ink-600 bg-brand-50">
              <tr>
                <th className="text-left px-2 py-1.5">Criativo</th>
                <th className="text-right px-2 py-1.5">Gasto</th>
                <th className="text-right px-2 py-1.5">Engajamento</th>
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
                <tr key={r.id} className="border-t border-ink-100 hover:bg-brand-50/40">
                  <td className="px-2 py-1.5">
                    <div className="flex items-center gap-2 max-w-[320px]">
                      {r.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.image} alt={r.name} loading="lazy" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-stone-100 flex-shrink-0" />
                      )}
                      <span className="truncate text-ink-800 font-medium">
                        {r.permalink ? (
                          <a href={r.permalink} target="_blank" rel="noreferrer" className="hover:underline text-brand-700">{r.name}</a>
                        ) : r.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{formatCurrency(r.spend, currency, true)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums font-semibold text-brand-700">{formatNumber(r.engagement)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{formatNumber(r.reactions)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{formatNumber(r.comments)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{formatNumber(r.saves)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{formatNumber(r.videoViews)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{formatNumber(r.linkClicks)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{formatCurrency(r.costPerEngagement, currency, true)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-brand-300 bg-brand-50 font-semibold text-ink-800">
                <td className="px-2 py-1.5">Total geral</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{formatCurrency(t.spend, currency, true)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{formatNumber(t.engagement)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{formatNumber(t.reactions)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{formatNumber(t.comments)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{formatNumber(t.saves)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{formatNumber(t.videoViews)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{formatNumber(t.linkClicks)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{formatCurrency(totalCpe, currency, true)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
