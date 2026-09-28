export type Role = 'admin' | 'staff'

export interface Profile {
  id: string
  name: string
  email: string
  role: Role
  created_at: string
}

export interface Product {
  id: string
  sku: string
  name: string
  category: string
  stock: number
  created_at: string
  updated_at: string
}

export interface Inbound {
  id: string
  product_id: string
  quantity: number
  date: string
  user_id: string
  created_at: string
  products?: Pick<Product, 'name' | 'sku'>
  profiles?: Pick<Profile, 'name'>
}

export interface Outbound {
  id: string
  product_id: string
  quantity: number
  date: string
  user_id: string
  created_at: string
  products?: Pick<Product, 'name' | 'sku'>
  profiles?: Pick<Profile, 'name'>
}

export interface DashboardStats {
  totalProducts: number
  totalStock: number
  totalInbound: number
  totalOutbound: number
}
