import { useNavigate } from 'react-router-dom';
import { CreditCard, FileText } from 'lucide-react';
import { Badge, Button, EmptyState } from '../ui';
import { useAuth } from '../../context/AuthContext';

import { formatRupiah } from '../../utils/format';

export default function OrderTable({ orders }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isCashier = user?.role === 'cashier';
  
  if (!orders?.length) {
    return (
      <EmptyState
        title={isCashier ? 'Tidak Ada Pesanan' : 'Tidak Ada Riwayat Transaksi'}
        description={
          isCashier
            ? 'Belum ada pesanan masuk dari pelanggan.'
            : 'Belum ada transaksi selesai yang tercatat.'
        }
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-surface-container-high/60 text-on-surface-variant font-label-md text-label-md uppercase tracking-wider border-b border-outline-variant">
            <th className="text-left px-space-lg py-space-md">Invoice</th>
            <th className="text-left px-space-lg py-space-md">Pelanggan</th>
            <th className="text-left px-space-lg py-space-md">Meja / Tipe</th>
            <th className="text-left px-space-lg py-space-md">Status</th>
            <th className="text-right px-space-lg py-space-md">Total</th>
            <th className="text-center px-space-lg py-space-md">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          {orders.map((order) => (
            <tr key={order.id_order} className="hover:bg-surface-container-low/60 transition-colors">
              <td className="px-space-lg py-space-md font-body-md text-body-md font-mono text-on-surface-variant">{order.invoice_number}</td>
              <td className="px-space-lg py-space-md font-body-md text-body-md text-on-surface font-medium">{order.customer_name}</td>
              <td className="px-space-lg py-space-md font-body-md text-body-md text-on-surface-variant">
                {order.table_number === 'TAKEAWAY'
                  ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-label-md font-label-md">📦 Take Away</span>
                  : `Meja ${order.table_number}`
                }
              </td>
              <td className="px-space-lg py-space-md">
                {order.status === 'LUNAS' ? (
                  <Badge status="lunas">Lunas</Badge>
                ) : (
                  <Badge status="pending" pulse>Pending</Badge>
                )}
              </td>
              <td className="px-space-lg py-space-md font-currency-md text-currency-md text-right text-on-surface">{formatRupiah(order.total_amount)}</td>
              <td className="px-space-lg py-space-md text-center">
                {isCashier && order.status === 'PENDING' ? (
                  <Button
                    variant="primary"
                    icon={CreditCard}
                    onClick={() => navigate(`/orders/${order.id_order}/billing`)}
                    className="px-space-md py-space-sm text-label-lg"
                  >
                    Bayar
                  </Button>
                ) : (
                  <Button
                    variant="neutral"
                    onClick={() => navigate(`/orders/${order.id_order}/billing`)}
                    className="px-space-md py-space-sm text-label-lg"
                  >
                    Detail
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
