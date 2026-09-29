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
  supplier_id?: string
  created_at: string
  products?: Pick<Product, 'name' | 'sku'>
  profiles?: Pick<Profile, 'name'>
  suppliers?: Pick<Supplier, 'supplier_name'>
}

export interface Outbound {
  id: string
  product_id: string
  quantity: number
  date: string
  user_id: string
  supplier_id?: string
  client_id?: string
  created_at: string
  products?: Pick<Product, 'name' | 'sku'>
  profiles?: Pick<Profile, 'name'>
  suppliers?: Pick<Supplier, 'supplier_name'>
  clients?: Pick<Client, 'client_name'>
}

export interface DashboardStats {
  totalProducts: number
  totalStock: number
  totalInbound: number
  totalOutbound: number
}

export interface Supplier {
  id: string
  supplier_name: string
  pic_name: string
  contact: string
  product_name: string
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  client_name: string
  pic_name: string
  contact: string
  created_at: string
  updated_at: string
}
