import { useEffect, useState } from 'react'
import { Package2, Boxes, ArrowDownToLine, ArrowUpFromLine, TrendingUp } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { dashboardService } from '../services/api'
import { DashboardStats } from '../types'

interface StatCardProps {
  label: string
  value: number
  icon: React.ElementType
  iconBg: string
  borderHover: string
}

function StatCard({ label, value, icon: Icon, iconBg, borderHover }: StatCardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl p-6 bg-slate-900 border border-white/5 transition-all duration-300 hover:border-opacity-40 hover:shadow-lg ${borderHover}`}
    >
      {/* Subtle top line accent on hover */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${iconBg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-3">{label}</p>
          <p className="text-3xl font-bold text-white tracking-tight">
            {value.toLocaleString('id-ID')}
          </p>
        </div>
        <div
          className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0 shadow-lg transition-transform duration-300 group-hover:scale-110`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )
}

interface TooltipProps {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-white/10 rounded-xl p-3 shadow-xl">
        <p className="text-slate-300 text-sm font-medium mb-2">{label}</p>
        {payload.map((p) => (
          <div key={p.name} className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
            <span className="text-slate-400 capitalize">{p.name}:</span>
            <span className="text-white font-semibold">{p.value.toLocaleString('id-ID')}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [trend, setTrend] = useState<{ name: string; inbound: number; outbound: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState<string>('') // '' = semua waktu

  // Generate pilihan bulan: Jan - Des tahun ini + "Semua Waktu"
  const monthOptions = (() => {
    const opts = [{ label: 'Semua Waktu', value: '' }]
    const currentYear = new Date().getFullYear()
    for (let i = 0; i < 12; i++) {
      const d = new Date(currentYear, i, 1)
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleString('id-ID', { month: 'long', year: 'numeric' })
      opts.push({ label, value })
    }
    return opts
  })()

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [s, t] = await Promise.all([
        dashboardService.getStats(selectedMonth || undefined),
        dashboardService.getMonthlyTrend(),
      ])
      setStats(s)
      setTrend(t)
      setLoading(false)
    }
    load()
  }, [selectedMonth])

  const cards: StatCardProps[] = [
    {
      label: 'Total Barang',
      value: stats?.totalProducts ?? 0,
      icon: Package2,
      iconBg: 'bg-indigo-600',
      borderHover: 'hover:border-indigo-500/40',
    },
    {
      label: 'Total Stock',
      value: stats?.totalStock ?? 0,
      icon: Boxes,
      iconBg: 'bg-violet-600',
      borderHover: 'hover:border-violet-500/40',
    },
    {
      label: 'Total Inbound',
      value: stats?.totalInbound ?? 0,
      icon: ArrowDownToLine,
      iconBg: 'bg-emerald-600',
      borderHover: 'hover:border-emerald-500/40',
    },
    {
      label: 'Total Outbound',
      value: stats?.totalOutbound ?? 0,
      icon: ArrowUpFromLine,
      iconBg: 'bg-amber-600',
      borderHover: 'hover:border-amber-500/40',
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 w-32 bg-slate-800 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-48 bg-slate-800 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-800 animate-pulse" />
          ))}
        </div>
        <div className="h-80 rounded-2xl bg-slate-800 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Ringkasan aktivitas gudang</p>
        </div>
        {/* Filter Bulan */}
        <select
          id="filter-bulan"
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          className="bg-slate-800 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer pr-8"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
        >
          {monthOptions.map(opt => (
            <option key={opt.value} value={opt.value} className="bg-slate-800">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>

      {/* Chart */}
      <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-sm">Tren Tahun Ini</h2>
            <p className="text-slate-400 text-xs">Perbandingan Inbound vs Outbound</p>
          </div>
        </div>

        {trend.every((t) => t.inbound === 0 && t.outbound === 0) ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <TrendingUp className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">Belum ada data transaksi</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={trend} barGap={4} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span style={{ color: '#94a3b8', fontSize: 12 }}>{value}</span>
                )}
              />
              <Bar dataKey="inbound" name="Inbound" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={40} />
              <Bar dataKey="outbound" name="Outbound" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
