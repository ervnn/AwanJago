import { useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, Search, Package, X, Loader2, AlertTriangle } from 'lucide-react'
import { productService } from '../services/api'
import { Product } from '../types'
import { useAuth } from '../contexts/AuthContext'
import { useAsync } from '../hooks/useAsync'

interface ProductFormProps {
  initial?: Partial<Product>
  onSave: (data: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  onCancel: () => void
  loading: boolean
}

function ProductForm({ initial, onSave, onCancel, loading }: ProductFormProps) {
  const [form, setForm] = useState({
    sku: initial?.sku ?? '',
    name: initial?.name ?? '',
    category: initial?.category ?? '',
    stock: initial?.stock ?? 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave({ ...form, stock: Number(form.stock) })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">SKU</label>
          <input
            id="input-sku"
            value={form.sku}
            onChange={e => setForm(p => ({ ...p, sku: e.target.value }))}
            required
            placeholder="BRG001"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Nama Barang</label>
          <input
            id="input-name"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            required
            placeholder="Mouse Wireless"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Kategori</label>
          <input
            id="input-category"
            value={form.category}
            onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
            required
            placeholder="Elektronik"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Stock Awal</label>
          <input
            id="input-stock"
            type="number"
            min={0}
            value={form.stock}
            onChange={e => setForm(p => ({ ...p, stock: Number(e.target.value) }))}
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          id="btn-save-product"
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Simpan
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-slate-400 hover:text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-white/5 transition-all"
        >
          Batal
        </button>
      </div>
    </form>
  )
}

export default function BarangPage() {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'

  const fetchProducts = useCallback(() => productService.getAll().then(r => r.data ?? []), [])
  const { data: products, loading, refetch } = useAsync<Product[]>(fetchProducts)

  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null)
  const [selected, setSelected] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const filtered = (products ?? []).filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleAdd(data: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    setSaving(true)
    const { error } = await productService.create(data)
    setSaving(false)
    if (error) { showToast('error', error.message); return }
    setModal(null)
    refetch()
    showToast('success', 'Barang berhasil ditambahkan!')
  }

  async function handleEdit(data: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    if (!selected) return
    setSaving(true)
    const { error } = await productService.update(selected.id, data)
    setSaving(false)
    if (error) { showToast('error', error.message); return }
    setModal(null)
    refetch()
    showToast('success', 'Barang berhasil diperbarui!')
  }

  async function handleDelete() {
    if (!selected) return
    setSaving(true)
    const { error } = await productService.delete(selected.id)
    setSaving(false)
    if (error) { showToast('error', error.message); return }
    setModal(null)
    refetch()
    showToast('success', 'Barang berhasil dihapus!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Barang</h1>
          <p className="text-slate-400 text-sm mt-1">Manajemen data barang gudang</p>
        </div>
        {isAdmin && (
          <button
            id="btn-add-barang"
            onClick={() => { setSelected(null); setModal('add') }}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            Tambah Barang
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          id="search-barang"
          type="text"
          placeholder="Cari nama, SKU, atau kategori..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-slate-800 rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <Package className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm">Tidak ada barang ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">SKU</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Nama Barang</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Kategori</th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Stock</th>
                  {isAdmin && <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg">{p.sku}</span>
                    </td>
                    <td className="px-6 py-4 text-white text-sm font-medium">{p.name}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-300 bg-white/5 px-2.5 py-1 rounded-lg">{p.category}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-sm font-bold ${p.stock === 0 ? 'text-red-400' : p.stock < 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {p.stock.toLocaleString('id-ID')}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            id={`btn-edit-${p.id}`}
                            onClick={() => { setSelected(p); setModal('edit') }}
                            className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            id={`btn-delete-${p.id}`}
                            onClick={() => { setSelected(p); setModal('delete') }}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add/Edit */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-semibold text-lg">{modal === 'add' ? 'Tambah Barang' : 'Edit Barang'}</h2>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <ProductForm
              initial={modal === 'edit' ? selected ?? undefined : undefined}
              onSave={modal === 'add' ? handleAdd : handleEdit}
              onCancel={() => setModal(null)}
              loading={saving}
            />
          </div>
        </div>
      )}

      {/* Modal Delete */}
      {modal === 'delete' && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">Hapus Barang?</h2>
                <p className="text-slate-400 text-sm mt-1">
                  <strong className="text-white">{selected.name}</strong> akan dihapus permanen beserta riwayat transaksinya.
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setModal(null)}
                  className="flex-1 text-slate-400 hover:text-white text-sm font-medium py-2.5 rounded-xl hover:bg-white/5 transition-all border border-white/10"
                >
                  Batal
                </button>
                <button
                  id="btn-confirm-delete"
                  onClick={handleDelete}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold py-2.5 rounded-xl transition-all disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border transition-all ${
          toast.type === 'success'
            ? 'bg-emerald-900/80 border-emerald-500/30 text-emerald-300'
            : 'bg-red-900/80 border-red-500/30 text-red-300'
        } backdrop-blur-md text-sm font-medium`}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
