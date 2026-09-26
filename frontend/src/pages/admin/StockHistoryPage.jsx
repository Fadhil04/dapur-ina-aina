import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { stockService } from '../../services/stockService';
import { ArrowLeft } from 'lucide-react';
import { Card, Badge, EmptyState } from '../../components/ui';
import { formatDate } from '../../utils/format';

const TYPE_BADGE = {
  TAMBAH: 'bg-secondary-container text-on-secondary-container',
  RUSAK: 'bg-error-container text-on-error-container',
  PENJUALAN: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
};

export default function StockHistoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['stock-history', id],
    queryFn: () => stockService.getHistory(id),
  });

  const menu = data?.menu;
  const movements = data?.movements ?? [];

  return (
    <div className="w-full max-w-[1440px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-space-md lg:py-space-xl flex flex-col gap-space-lg">
      <button
        onClick={() => navigate('/stock')}
        className="flex items-center gap-space-md text-on-surface-variant hover:text-on-surface font-label-lg text-label-lg transition-colors w-fit"
      >
        <ArrowLeft size={18} /> Kembali ke Stok
      </button>

      <div>
        <h1 className="font-headline-lg text-headline-lg md:font-headline-lg-mobile md:text-headline-lg-mobile text-on-surface">Histori Mutasi Stok</h1>
        {menu && (
          <p className="font-body-md text-body-md text-on-surface-variant mt-space-sm">
            {menu.name_menu} · Stok saat ini: <span className="font-label-lg text-on-surface font-bold">{menu.stock}</span>
          </p>
        )}
      </div>

      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <div className="py-space-2xl text-center text-on-surface-variant font-body-md text-body-md">Memuat histori...</div>
        ) : isError ? (
          <div className="py-space-2xl text-center text-error font-body-md text-body-md">Gagal memuat data.</div>
        ) : movements.length === 0 ? (
          <EmptyState title="Belum Ada Catatan" description="Tidak ada mutasi stok untuk menu ini." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-container-high/60 text-on-surface-variant font-label-md text-label-md uppercase tracking-wider border-b border-outline-variant">
                  <th className="text-left px-space-lg py-space-md">Tanggal</th>
                  <th className="text-center px-space-lg py-space-md">Tipe</th>
                  <th className="text-center px-space-lg py-space-md">Sebelum</th>
                  <th className="text-center px-space-lg py-space-md">Perubahan</th>
                  <th className="text-center px-space-lg py-space-md">Sesudah</th>
                  <th className="text-left px-space-lg py-space-md">Catatan</th>
                  <th className="text-left px-space-lg py-space-md">Operator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {movements.map((m) => (
                  <tr key={m.id_movement} className="hover:bg-surface-container-low/60 transition-colors">
                    <td className="px-space-lg py-space-md font-body-md text-body-md text-on-surface-variant whitespace-nowrap">{formatDate(m.created_at)}</td>
                    <td className="px-space-lg py-space-md text-center">
                      <span className={`inline-block font-label-md text-label-md px-space-md py-space-xs rounded-full ${TYPE_BADGE[m.type] ?? 'bg-surface-container-high text-on-surface-variant'}`}>
                        {m.type}
                      </span>
                    </td>
                    <td className="px-space-lg py-space-md text-center font-body-md text-body-md text-on-surface-variant">{m.quantity_before}</td>
                    <td className="px-space-lg py-space-md text-center font-title-md text-title-md">
                      <span className={m.quantity_change >= 0 ? 'text-secondary' : 'text-error'}>
                        {m.quantity_change >= 0 ? `+${m.quantity_change}` : m.quantity_change}
                      </span>
                    </td>
                    <td className="px-space-lg py-space-md text-center font-title-md text-title-md text-on-surface">{m.quantity_after}</td>
                    <td className="px-space-lg py-space-md font-body-md text-body-md text-on-surface-variant max-w-xs truncate">{m.note || '—'}</td>
                    <td className="px-space-lg py-space-md font-body-md text-body-md text-on-surface-variant">{m.name_user || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
