import { useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, Search, Building2, X, Loader2, AlertTriangle } from 'lucide-react'
import { clientService } from '../services/api'
import { Client } from '../types'
import { useAuth } from '../contexts/AuthContext'
import { useAsync } from '../hooks/useAsync'

interface ClientFormProps {
  initial?: Partial<Client>
  onSave: (data: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  onCancel: () => void
  loading: boolean
}

function ClientForm({ initial, onSave, onCancel, loading }: ClientFormProps) {
  const [form, setForm] = useState({
    client_name: initial?.client_name ?? '',
    pic_name: initial?.pic_name ?? '',
    contact: initial?.contact ?? '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Nama Klien / Perusahaan</label>
        <input
          id="input-client-name"
          value={form.client_name}
          onChange={e => setForm(p => ({ ...p, client_name: e.target.value }))}
          required
          placeholder="PT. Teknologi Nusantara"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Nama PIC</label>
          <input
            id="input-client-pic"
            value={form.pic_name}
            onChange={e => setForm(p => ({ ...p, pic_name: e.target.value }))}
            required
            placeholder="Hendra Wijaya"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Kontak</label>
          <input
            id="input-client-contact"
            value={form.contact}
            onChange={e => setForm(p => ({ ...p, contact: e.target.value }))}
            required
            placeholder="081234567890"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
          />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          id="btn-save-client"
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all disabled:opacity-60"
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

export default function ClientPage() {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'

  const fetchClients = useCallback(() => clientService.getAll().then(r => r.data ?? []), [])
  const { data: clients, loading, refetch } = useAsync<Client[]>(fetchClients)

  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null)
  const [selected, setSelected] = useState<Client | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const filtered = (clients ?? []).filter(c =>
    c.client_name.toLowerCase().includes(search.toLowerCase()) ||
    c.pic_name.toLowerCase().includes(search.toLowerCase())
  )

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleAdd(data: Omit<Client, 'id' | 'created_at' | 'updated_at'>) {
    setSaving(true)
    const { error } = await clientService.create(data)
    setSaving(false)
    if (error) { showToast('error', error.message); return }
    setModal(null)
    refetch()
    showToast('success', 'Klien berhasil ditambahkan!')
  }

  async function handleEdit(data: Omit<Client, 'id' | 'created_at' | 'updated_at'>) {
    if (!selected) return
    setSaving(true)
    const { error } = await clientService.update(selected.id, data)
    setSaving(false)
    if (error) { showToast('error', error.message); return }
    setModal(null)
    refetch()
    showToast('success', 'Klien berhasil diperbarui!')
  }

  async function handleDelete() {
    if (!selected) return
    setSaving(true)
    const { error } = await clientService.delete(selected.id)
    setSaving(false)
    if (error) { showToast('error', error.message); return }
    setModal(null)
    refetch()
    showToast('success', 'Klien berhasil dihapus!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Klien</h1>
          <p className="text-slate-400 text-sm mt-1">Manajemen data klien / penerima barang</p>
        </div>
        {isAdmin && (
          <button
            id="btn-add-client"
            onClick={() => { setSelected(null); setModal('add') }}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            Tambah Klien
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          id="search-client"
          type="text"
          placeholder="Cari nama klien atau PIC..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
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
            <Building2 className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm">Tidak ada data klien ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Nama Klien</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Nama PIC</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Kontak</th>
                  {isAdmin && <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-white text-sm font-medium">{c.client_name}</td>
                    <td className="px-6 py-4 text-slate-300 text-sm">{c.pic_name}</td>
                    <td className="px-6 py-4 text-slate-300 text-sm">{c.contact}</td>
                    {isAdmin && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            id={`btn-edit-client-${c.id}`}
                            onClick={() => { setSelected(c); setModal('edit') }}
                            className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            id={`btn-delete-client-${c.id}`}
                            onClick={() => { setSelected(c); setModal('delete') }}
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
              <h2 className="text-white font-semibold text-lg">{modal === 'add' ? 'Tambah Klien' : 'Edit Klien'}</h2>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <ClientForm
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
                <h2 className="text-white font-semibold text-lg">Hapus Klien?</h2>
                <p className="text-slate-400 text-sm mt-1">
                  <strong className="text-white">{selected.client_name}</strong> akan dihapus permanen.
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
                  id="btn-confirm-delete-client"
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
