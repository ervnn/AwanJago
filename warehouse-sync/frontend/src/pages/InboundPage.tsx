import { useState, useCallback } from 'react'
import { Plus, ArrowDownToLine, Loader2, X, Search } from 'lucide-react'
import { inboundService, productService, supplierService } from '../services/api'
import { Inbound, Product, Supplier } from '../types'
import { useAuth } from '../contexts/AuthContext'
import { useAsync } from '../hooks/useAsync'

export default function InboundPage() {
  const { profile } = useAuth()

  const fetchInbounds = useCallback(() =>
    inboundService.getAll().then(r => (r.data ?? []) as unknown as Inbound[]), [])
  const { data: inbounds, loading, refetch } = useAsync<Inbound[]>(fetchInbounds)

  const fetchProducts = useCallback(() =>
    productService.getAll().then(r => r.data ?? []), [])
  const { data: products } = useAsync<Product[]>(fetchProducts)

  const fetchSuppliers = useCallback(() =>
    supplierService.getAll().then(r => r.data ?? []), [])
  const { data: suppliers } = useAsync<Supplier[]>(fetchSuppliers)

  const [modal, setModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ product_id: '', supplier_id: '', quantity: 1, date: new Date().toISOString().split('T')[0] })
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    const { error } = await inboundService.create({ ...form, supplier_id: form.supplier_id || undefined, quantity: Number(form.quantity), user_id: profile.id })
    setSaving(false)
    if (error) { showToast('error', error.message); return }
    setModal(false)
    setForm({ product_id: '', supplier_id: '', quantity: 1, date: new Date().toISOString().split('T')[0] })
    refetch()
    showToast('success', 'Inbound berhasil dicatat!')
  }

  const filtered = (inbounds ?? []).filter(i =>
    (i.products?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (i.products?.sku ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (i.suppliers?.supplier_name ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Inbound</h1>
          <p className="text-slate-400 text-sm mt-1">Pencatatan barang masuk gudang</p>
        </div>
        <button
          id="btn-add-inbound"
          onClick={() => setModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          Tambah Inbound
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Cari nama atau SKU barang..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
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
            <ArrowDownToLine className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm">Belum ada transaksi inbound</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Tanggal</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">SKU</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Nama Barang</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Supplier</th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Qty</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Dicatat Oleh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filtered.map(i => (
                  <tr key={i.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-slate-300 text-sm">{new Date(i.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg">{i.products?.sku ?? '—'}</span>
                    </td>
                    <td className="px-6 py-4 text-white text-sm font-medium">{i.products?.name ?? '—'}</td>
                    <td className="px-6 py-4 text-slate-300 text-sm">{i.suppliers?.supplier_name ?? '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-emerald-400 font-bold text-sm">+{i.quantity.toLocaleString('id-ID')}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">{(i as { profiles?: { name?: string } }).profiles?.name ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-semibold text-lg">Tambah Inbound</h2>
              <button onClick={() => setModal(false)} className="text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Barang</label>
                <select
                  id="select-product-inbound"
                  value={form.product_id}
                  onChange={e => setForm(p => ({ ...p, product_id: e.target.value }))}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm appearance-none"
                >
                  <option value="" className="bg-slate-800">Pilih barang...</option>
                  {(products ?? []).map(p => (
                    <option key={p.id} value={p.id} className="bg-slate-800">{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Supplier</label>
                <select
                  id="select-supplier-inbound"
                  value={form.supplier_id}
                  onChange={e => setForm(p => ({ ...p, supplier_id: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm appearance-none"
                >
                  <option value="" className="bg-slate-800">Tanpa Supplier</option>
                  {(suppliers ?? []).map(s => (
                    <option key={s.id} value={s.id} className="bg-slate-800">{s.supplier_name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Quantity</label>
                  <input
                    id="input-qty-inbound"
                    type="number"
                    min={1}
                    value={form.quantity}
                    onChange={e => setForm(p => ({ ...p, quantity: Number(e.target.value) }))}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Tanggal</label>
                  <input
                    id="input-date-inbound"
                    type="date"
                    value={form.date}
                    onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm [color-scheme:dark]"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  id="btn-save-inbound"
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all disabled:opacity-60"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Simpan
                </button>
                <button type="button" onClick={() => setModal(false)} className="text-slate-400 hover:text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-white/5 transition-all">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border backdrop-blur-md text-sm font-medium ${
          toast.type === 'success' ? 'bg-emerald-900/80 border-emerald-500/30 text-emerald-300' : 'bg-red-900/80 border-red-500/30 text-red-300'
        }`}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
