import { useNavigate } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import { Badge, Button, EmptyState } from '../ui';

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

export default function OrderTable({ orders }) {
  const navigate = useNavigate();
  
  if (!orders?.length) {
    return <EmptyState title="Tidak Ada Pesanan" description="Belum ada pesanan masuk dari pelanggan." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-surface-container-high/60 text-on-surface-variant font-label-md text-label-md uppercase tracking-wider border-b border-outline-variant">
            <th className="text-left px-space-lg py-space-md">Invoice</th>
            <th className="text-left px-space-lg py-space-md">Pelanggan</th>
            <th className="text-left px-space-lg py-space-md">Meja</th>
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
              <td className="px-space-lg py-space-md font-body-md text-body-md text-on-surface-variant">Meja {order.table_number}</td>
              <td className="px-space-lg py-space-md">
                {order.status === 'LUNAS' ? (
                  <Badge status="lunas">Lunas</Badge>
                ) : (
                  <Badge status="pending" pulse>Pending</Badge>
                )}
              </td>
              <td className="px-space-lg py-space-md font-currency-md text-currency-md text-right text-on-surface">{formatRupiah(order.total_amount)}</td>
              <td className="px-space-lg py-space-md text-center">
                {order.status === 'PENDING' ? (
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
