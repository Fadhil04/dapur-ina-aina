// frontend/src/pages/admin/StockPage.jsx
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { stockService } from '../../services/stockService'
import { menuService } from '../../services/menuService'
import { formatRupiah } from '../../utils/format'

import { Plus, Edit2, ArrowUpDown, History, Trash2, Package, ToggleLeft } from 'lucide-react'

function MenuModal({ menu, categories, onClose, onSave }) {
  const [form, setForm] = useState({
    name_menu:   menu?.name_menu   ?? '',
    price:       menu?.price       ?? '',
    id_category: menu?.id_category ?? '',
    stock:       menu?.stock       ?? 0,
    image_url:   menu?.image_url   ?? '',
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
      const errorMsg = err.response?.data?.message || 'Gagal menyimpan menu.'
      setError(errorMsg)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="font-label-lg text-label-lg text-on-surface mb-4">{menu ? 'Edit Menu' : 'Tambah Menu Baru'}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="font-label-md text-label-md text-on-surface-variant">Nama Menu</label>
            <input value={form.name_menu} onChange={e => setForm(f=>({...f,name_menu:e.target.value}))}
              className="w-full mt-1 border border-outline-variant rounded-xl px-3 py-2 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40" required />
          </div>
          <div>
            <label className="font-label-md text-label-md text-on-surface-variant">Kategori</label>
            <select value={form.id_category} onChange={e => setForm(f=>({...f,id_category:e.target.value}))}
              className="w-full mt-1 border border-outline-variant rounded-xl px-3 py-2 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40" required>
              <option value="">Pilih kategori</option>
              {categories.map(c => <option key={c.id_category} value={c.id_category}>{c.name_category}</option>)}
            </select>
          </div>
          <div>
            <label className="font-label-md text-label-md text-on-surface-variant">Harga (Rp)</label>
            <input type="number" value={form.price} onChange={e => setForm(f=>({...f,price:e.target.value}))}
              className="w-full mt-1 border border-outline-variant rounded-xl px-3 py-2 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40" required min="0" />
          </div>
          {!menu && (
            <div>
              <label className="font-label-md text-label-md text-on-surface-variant">Stok Awal</label>
              <input type="number" value={form.stock} onChange={e => setForm(f=>({...f,stock:e.target.value}))}
                className="w-full mt-1 border border-outline-variant rounded-xl px-3 py-2 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40" min="0" />
            </div>
          )}
          <div>
            <label className="font-label-md text-label-md text-on-surface-variant">URL Gambar (Opsional)</label>
            <input type="url" value={form.image_url} onChange={e => setForm(f=>({...f,image_url:e.target.value}))}
              className="w-full mt-1 border border-outline-variant rounded-xl px-3 py-2 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="https://contoh.com/gambar.jpg" />
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">Masukkan URL gambar menu (format: .jpg, .png, .webp)</p>
          </div>
          {error && <p className="text-error font-label-md text-label-md bg-error-container/20 p-2 rounded-lg animate-fade-in">{error}</p>}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-outline-variant py-2 rounded-xl font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container-low">Batal</button>
            <button type="submit" disabled={loading} className="flex-1 bg-primary hover:bg-primary-container text-on-primary py-2 rounded-xl font-label-lg text-label-lg disabled:opacity-60">
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
      const errorMsg = err.response?.data?.message || 'Gagal mutasi stok.'
      setError(errorMsg)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h2 className="font-label-lg text-label-lg text-on-surface mb-1">Mutasi Stok</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mb-4">{menu.name_menu} · Stok saat ini: <b>{menu.stock}</b></p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="font-label-md text-label-md text-on-surface-variant">Tipe</label>
            <div className="flex gap-2 mt-1">
              {['TAMBAH','RUSAK'].map(t => (
                <button key={t} type="button" onClick={() => setForm(f=>({...f,type:t}))}
                  className={`flex-1 py-2 rounded-xl font-label-lg text-label-lg border transition-colors ${form.type===t?'bg-primary text-on-primary border-primary':'border-outline-variant text-on-surface-variant'}`}
                >{t}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="font-label-md text-label-md text-on-surface-variant">Jumlah</label>
            <input type="number" value={form.quantity} onChange={e => setForm(f=>({...f,quantity:e.target.value}))}
              className="w-full mt-1 border border-outline-variant rounded-xl px-3 py-2 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40" required min="1" />
          </div>
          <div>
            <label className="font-label-md text-label-md text-on-surface-variant">Catatan</label>
            <input value={form.note} onChange={e => setForm(f=>({...f,note:e.target.value}))}
              className="w-full mt-1 border border-outline-variant rounded-xl px-3 py-2 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40" required />
          </div>
          {error && <p className="text-error font-label-md text-label-md bg-error-container/20 p-2 rounded-lg animate-fade-in">{error}</p>}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-outline-variant py-2 rounded-xl font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container-low">Batal</button>
            <button type="submit" disabled={loading} className="flex-1 bg-primary hover:bg-primary-container text-on-primary py-2 rounded-xl font-label-lg text-label-lg disabled:opacity-60">
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

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Nonaktifkan menu "${item.name_menu}"?\n\nMenu yang dinonaktifkan tidak akan tampil di katalog pelanggan.`
    )
    if (!confirmed) return
    try {
      await menuService.deactivate(item.id_menu_item)
      qc.invalidateQueries({ queryKey: ['stock'] })
      qc.invalidateQueries({ queryKey: ['menu'] })
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menonaktifkan menu.')
    }
  }

  const handleActivate = async (item) => {
    const confirmed = window.confirm(
      `Aktifkan kembali menu "${item.name_menu}"?\n\nMenu akan kembali tampil di katalog pelanggan.`
    )
    if (!confirmed) return
    try {
      await menuService.activate(item.id_menu_item)
      qc.invalidateQueries({ queryKey: ['stock'] })
      qc.invalidateQueries({ queryKey: ['menu'] })
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengaktifkan menu.')
    }
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
          <table className="w-full font-body-md text-body-md">
            <thead>
              <tr className="bg-surface-container-high/60 text-on-surface-variant font-label-md text-label-md uppercase tracking-wider border-b border-outline-variant">
                <th className="text-left px-4 py-3">Gambar</th>
                <th className="text-left px-4 py-3">Menu</th>
                <th className="text-left px-4 py-3">Kategori</th>
                <th className="text-right px-4 py-3">Harga</th>
                <th className="text-center px-4 py-3">Stok</th>
                <th className="text-center px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {items.map(item => (
                <tr key={item.id_menu_item} className={`hover:bg-surface-container-low/60 transition-colors ${
                  !item.is_active
                    ? 'opacity-50 bg-surface-container-high/40'
                    : item.stock <= 5
                    ? 'bg-error-container/20'
                    : ''
                }`}>
                  <td className="px-4 py-3">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name_menu} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center">
                        <Package size={20} className="text-on-surface-variant opacity-50" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-label-lg text-on-surface ${!item.is_active ? 'line-through text-on-surface-variant' : ''}`}>
                        {item.name_menu}
                      </span>
                      {!item.is_active && (
                        <span className="inline-flex items-center gap-1 bg-error-container text-error text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                          Nonaktif
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">{item.name_category}</td>
                  <td className="px-4 py-3 text-right text-on-surface">{formatRupiah(item.price)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-bold ${item.stock <= 5 && item.is_active ? 'text-error' : 'text-on-surface'}`}>{item.stock}</span>
                    {item.stock <= 5 && item.is_active && <span className="ml-1 font-label-md text-label-md text-error">⚠</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {/* Tombol edit & mutasi di-disable untuk item nonaktif */}
                      <button
                        onClick={() => item.is_active && setMenuModal(item)}
                        disabled={!item.is_active}
                        className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-container rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title={item.is_active ? 'Edit' : 'Menu sudah dinonaktifkan'}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => item.is_active && setAdjustModal(item)}
                        disabled={!item.is_active}
                        className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-container rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title={item.is_active ? 'Mutasi Stok' : 'Menu sudah dinonaktifkan'}
                      >
                        <ArrowUpDown size={14} />
                      </button>
                      <button
                        onClick={() => navigate(`/stock/${item.id_menu_item}/history`)}
                        className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-container rounded-lg transition-colors"
                        title="Histori"
                      >
                        <History size={14} />
                      </button>
                      {/* Tombol nonaktifkan (aktif) / aktifkan kembali (nonaktif) */}
                      {item.is_active ? (
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container rounded-lg transition-colors"
                          title="Nonaktifkan Menu"
                        >
                          <Trash2 size={14} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(item)}
                          className="p-1.5 text-on-surface-variant hover:text-tertiary hover:bg-tertiary-container rounded-lg transition-colors"
                          title="Aktifkan Kembali"
                        >
                          <ToggleLeft size={14} />
                        </button>
                      )}                    </div>
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
