import { supabase } from '../lib/supabase'
import { Product } from '../types'

export const productService = {
  async getAll() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase.from('products').insert(product).select().single()
    return { data, error }
  },

  async update(id: string, product: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('products')
      .update({ ...product, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  async delete(id: string) {
    const { error } = await supabase.from('products').delete().eq('id', id)
    return { error }
  },
}

export const inboundService = {
  async getAll() {
    const { data, error } = await supabase
      .from('inbounds')
      .select('*, products(name, sku), profiles(name)')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async create(inbound: { product_id: string; quantity: number; date: string; user_id: string }) {
    const { data, error } = await supabase.from('inbounds').insert(inbound).select().single()
    return { data, error }
  },
}

export const outboundService = {
  async getAll() {
    const { data, error } = await supabase
      .from('outbounds')
      .select('*, products(name, sku), profiles(name)')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async create(outbound: { product_id: string; quantity: number; date: string; user_id: string }) {
    const { data, error } = await supabase.from('outbounds').insert(outbound).select().single()
    return { data, error }
  },
}

export const dashboardService = {
  async getStats(monthKey?: string) {
    // monthKey format: 'YYYY-MM' atau undefined = semua waktu
    const from = monthKey ? `${monthKey}-01` : undefined
    const to = monthKey
      ? new Date(
          Number(monthKey.split('-')[0]),
          Number(monthKey.split('-')[1]), // bulan berikutnya
          0 // hari terakhir bulan ini
        )
          .toISOString()
          .split('T')[0]
      : undefined

    const productsQuery = supabase.from('products').select('stock')
    let inboundsQuery = supabase.from('inbounds').select('quantity')
    let outboundsQuery = supabase.from('outbounds').select('quantity')

    if (from && to) {
      inboundsQuery = inboundsQuery.gte('date', from).lte('date', to)
      outboundsQuery = outboundsQuery.gte('date', from).lte('date', to)
    }

    const [products, inbounds, outbounds] = await Promise.all([
      productsQuery,
      inboundsQuery,
      outboundsQuery,
    ])

    const totalProducts = products.data?.length ?? 0
    const totalStock = products.data?.reduce((sum, p) => sum + (p.stock ?? 0), 0) ?? 0
    const totalInbound = inbounds.data?.reduce((sum, i) => sum + (i.quantity ?? 0), 0) ?? 0
    const totalOutbound = outbounds.data?.reduce((sum, o) => sum + (o.quantity ?? 0), 0) ?? 0

    return { totalProducts, totalStock, totalInbound, totalOutbound }
  },


  async getMonthlyTrend() {
    const currentYear = new Date().getFullYear()
    const from = `${currentYear}-01-01`
    const to = `${currentYear}-12-31`

    const [inbounds, outbounds] = await Promise.all([
      supabase.from('inbounds').select('quantity, date').gte('date', from).lte('date', to),
      supabase.from('outbounds').select('quantity, date').gte('date', from).lte('date', to),
    ])

    const months: Record<string, { name: string; inbound: number; outbound: number }> = {}
    for (let i = 0; i < 12; i++) {
      const d = new Date(currentYear, i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const name = d.toLocaleString('id-ID', { month: 'short' }).replace('.', '')
      months[key] = { name, inbound: 0, outbound: 0 }
    }

    inbounds.data?.forEach(r => {
      const key = r.date.slice(0, 7)
      if (months[key]) months[key].inbound += r.quantity
    })
    outbounds.data?.forEach(r => {
      const key = r.date.slice(0, 7)
      if (months[key]) months[key].outbound += r.quantity
    })

    return Object.values(months)
  },
}
