import { AlertTriangle } from 'lucide-react';
import { Card, Badge } from '../ui';

export default function LowStockAlert({ items = [] }) {
  if (!items.length) {
    return (
      <Card className="p-space-lg">
        <h3 className="font-title-lg text-title-lg text-on-surface mb-space-lg flex items-center gap-space-md">
          <AlertTriangle size={20} className="text-tertiary" /> Perhatian Stok
        </h3>
        <p className="font-body-md text-body-md text-on-surface-variant">Semua stok dalam kondisi aman ✅</p>
      </Card>
    );
  }

  return (
    <Card className="p-space-lg flex flex-col gap-space-lg">
      <div className="flex items-center justify-between">
        <h3 className="font-title-lg text-title-lg text-on-surface flex items-center gap-space-md">
          <AlertTriangle size={20} className="text-tertiary" /> Stok Menipis
        </h3>
        <Badge status="menipis">{items.length} item</Badge>
      </div>
      <ul className="space-y-space-md">
        {items.map((item) => (
          <li key={item.id_menu_item} className="flex items-center justify-between">
            <span className="font-body-md text-body-md text-on-surface truncate">{item.name_menu}</span>
            <span className={`font-label-lg text-label-lg ml-space-md shrink-0 ${
              item.stock === 0 ? 'text-error' : 'text-tertiary'
            }`}>
              {item.stock === 0 ? 'Habis' : `Sisa ${item.stock}`}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
