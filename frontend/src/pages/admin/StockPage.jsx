// frontend/src/pages/admin/StockPage.jsx
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { stockService } from '../../services/stockService'
import { menuService } from '../../services/menuService'

import { Plus, Edit2, ArrowUpDown, History } from 'lucide-react'

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

function MenuModal({ menu, categories, onClose, onSave }) {
  const [form, setForm] = useState({
    name_menu:   menu?.name_menu   ?? '',
    price:       menu?.price       ?? '',
    id_category: menu?.id_category ?? '',
    stock:       menu?.stock       ?? 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (menu) await menuService.update(menu.id_menu_item, form)
      else      await menuService.create(form)
      onSave()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan menu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="font-bold text-gray-800 mb-4">{menu ? 'Edit Menu' : 'Tambah Menu Baru'}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-gray-500">Nama Menu</label>
            <input value={form.name_menu} onChange={e => setForm(f=>({...f,name_menu:e.target.value}))}
              className="w-full mt-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" required />
          </div>
          <div>
            <label className="text-xs text-gray-500">Kategori</label>
            <select value={form.id_category} onChange={e => setForm(f=>({...f,id_category:e.target.value}))}
              className="w-full mt-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" required>
              <option value="">Pilih kategori</option>
              {categories.map(c => <option key={c.id_category} value={c.id_category}>{c.name_category}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500">Harga (Rp)</label>
            <input type="number" value={form.price} onChange={e => setForm(f=>({...f,price:e.target.value}))}
              className="w-full mt-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" required min="0" />
          </div>
          {!menu && (
            <div>
              <label className="text-xs text-gray-500">Stok Awal</label>
              <input type="number" value={form.stock} onChange={e => setForm(f=>({...f,stock:e.target.value}))}
                className="w-full mt-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" min="0" />
            </div>
          )}
          {error && <p className="text-red-500 text-xs bg-red-50 p-2 rounded-lg">{error}</p>}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Batal</button>
            <button type="submit" disabled={loading} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-xl text-sm font-medium disabled:opacity-60">
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AdjustModal({ menu, onClose, onSave }) {
  const [form, setForm] = useState({ type: 'TAMBAH', quantity: '', note: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await stockService.adjustStock({ id_menu_item: menu.id_menu_item, ...form, quantity: Number(form.quantity) })
      onSave()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mutasi stok.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h2 className="font-bold text-gray-800 mb-1">Mutasi Stok</h2>
        <p className="text-sm text-gray-500 mb-4">{menu.name_menu} · Stok saat ini: <b>{menu.stock}</b></p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-gray-500">Tipe</label>
            <div className="flex gap-2 mt-1">
              {['TAMBAH','RUSAK'].map(t => (
                <button key={t} type="button" onClick={() => setForm(f=>({...f,type:t}))}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${form.type===t?'bg-orange-500 text-white border-orange-500':'border-gray-200 text-gray-600'}`}
                >{t}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500">Jumlah</label>
            <input type="number" value={form.quantity} onChange={e => setForm(f=>({...f,quantity:e.target.value}))}
              className="w-full mt-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" required min="1" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Catatan</label>
            <input value={form.note} onChange={e => setForm(f=>({...f,note:e.target.value}))}
              className="w-full mt-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" required />
          </div>
          {error && <p className="text-red-500 text-xs bg-red-50 p-2 rounded-lg">{error}</p>}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Batal</button>
            <button type="submit" disabled={loading} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-xl text-sm font-medium disabled:opacity-60">
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function StockPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [menuModal, setMenuModal] = useState(null)   // null | 'add' | menu-object
  const [adjustModal, setAdjustModal] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['stock'],
    queryFn:  stockService.getStock,
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn:  menuService.getCategories,
  })

  const items = data?.items ?? []

  const handleSaved = () => {
    qc.invalidateQueries({ queryKey: ['stock'] })
    qc.invalidateQueries({ queryKey: ['menu'] })
    setMenuModal(null)
    setAdjustModal(null)
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-space-md lg:py-space-xl flex flex-col gap-space-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline-lg text-headline-lg md:font-headline-lg-mobile md:text-headline-lg-mobile text-on-surface">Stok & Menu</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-space-sm">Kelola katalog menu dan penyesuaian stok</p>
        </div>
        <button onClick={() => setMenuModal('add')}
          className="flex items-center gap-2 bg-primary hover:bg-primary-container text-on-primary text-label-lg font-label-lg px-space-lg py-space-md rounded-xl transition-colors shadow-sm">
          <Plus size={18} /> Tambah Menu
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-space-2xl text-center text-on-surface-variant font-body-md text-body-md">Memuat stok...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                <th className="text-left px-4 py-3">Menu</th>
                <th className="text-left px-4 py-3">Kategori</th>
                <th className="text-right px-4 py-3">Harga</th>
                <th className="text-center px-4 py-3">Stok</th>
                <th className="text-center px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(item => (
                <tr key={item.id_menu_item} className={`bg-white hover:bg-gray-50 transition-colors ${item.stock <= 5 ? 'bg-red-50 hover:bg-red-50' : ''}`}>
                  <td className="px-4 py-3 font-medium text-gray-800">{item.name_menu}</td>
                  <td className="px-4 py-3 text-gray-500">{item.name_category}</td>
                  <td className="px-4 py-3 text-right">{formatRupiah(item.price)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-bold ${item.stock <= 5 ? 'text-red-500' : 'text-gray-800'}`}>{item.stock}</span>
                    {item.stock <= 5 && <span className="ml-1 text-xs text-red-400">⚠</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => setMenuModal(item)} className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors" title="Edit">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => setAdjustModal(item)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Mutasi Stok">
                        <ArrowUpDown size={14} />
                      </button>
                      <button onClick={() => navigate(`/stock/${item.id_menu_item}/history`)} className="p-1.5 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-colors" title="Histori">
                        <History size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {menuModal && (
        <MenuModal
          menu={menuModal === 'add' ? null : menuModal}
          categories={categories}
          onClose={() => setMenuModal(null)}
          onSave={handleSaved}
        />
      )}
      {adjustModal && (
        <AdjustModal
          menu={adjustModal}
          onClose={() => setAdjustModal(null)}
          onSave={handleSaved}
        />
      )}
    </div>
  )
}
