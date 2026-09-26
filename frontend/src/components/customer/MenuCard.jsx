import { Plus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Card, Badge, Button, Toast } from '../ui';
import { formatRupiah } from '../../utils/format';
import { useState } from 'react';

export default function MenuCard({ menu }) {
  const { addItem, cart } = useCart();
  const [showToast, setShowToast] = useState(false);
  const inCart = cart.find((i) => i.id_menu_item === menu.id_menu_item);
  const outOfStock = menu.stock <= 0;
  const lowStock = menu.stock <= 5 && menu.stock > 0;

  const handleAdd = () => {
    addItem({
      id_menu_item: menu.id_menu_item,
      name_menu: menu.name_menu,
      price: menu.price,
    });
    setShowToast(true);
  };

  const stockStatus = outOfStock ? 'habis' : lowStock ? 'menipis' : 'aman';

  return (
    <Card className={`flex flex-col overflow-hidden transition-transform hover:-translate-y-1 ${outOfStock ? 'opacity-60' : ''}`}>
      <div className="flex-1 p-space-lg">
        <div className="flex justify-between items-start gap-space-md mb-space-md">
          <h3 className="font-title-md text-title-md text-on-surface line-clamp-2">{menu.name_menu}</h3>
          {lowStock && <Badge status="menipis">Sisa {menu.stock}</Badge>}
          {outOfStock && <Badge status="habis">Habis</Badge>}
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">{menu.name_category}</p>
        <p className="font-currency-md text-currency-md text-primary">{formatRupiah(menu.price)}</p>
      </div>
      <div className="px-space-lg pb-space-lg">
        {outOfStock ? (
          <div className="flex items-center justify-center py-space-md text-on-surface-variant font-body-sm text-body-sm">
            Stok Habis
          </div>
        ) : (
          <Button
            variant="primary"
            icon={Plus}
            onClick={handleAdd}
            className="w-full"
            disabled={outOfStock}
          >
            {inCart ? `Tambah (${inCart.quantity})` : 'Tambah ke Keranjang'}
          </Button>
        )}
      </div>
      
      {showToast && (
        <Toast
          title="Berhasil!"
          message={`${menu.name_menu} ditambahkan ke keranjang`}
          type="success"
          onClose={() => setShowToast(false)}
          duration={2000}
        />
      )}
    </Card>
  );
}
