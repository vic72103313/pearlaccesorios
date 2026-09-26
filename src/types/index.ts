export type Role = 'admin' | 'staff'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: Role
}

export interface Category {
  id: string
  name: string
  created_at?: string
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  sort_order: number
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  category_id: string | null
  active: boolean
  created_at?: string
  categories?: Category | null
  product_images?: ProductImage[]
}

export interface Offer {
  id: string
  product_id: string
  discount_percent: number
  active: boolean
  starts_at: string | null
  ends_at: string | null
}

export type OrderStatus =
  | 'pendiente'
  | 'confirmado'
  | 'preparando'
  | 'enviado'
  | 'entregado'
  | 'cancelado'

export interface OrderItem {
  id?: string
  order_id?: string
  product_id: string | null
  product_name: string
  quantity: number
  unit_price: number
}

export interface Order {
  id: string
  customer_id?: string | null
  customer_name: string
  customer_phone: string
  delivery_address: string | null
  delivery_reference: string | null
  status: OrderStatus
  total: number
  notes: string | null
  created_at: string
  order_items?: OrderItem[]
}

export interface Customer {
  id: string
  name: string
  phone: string
  address: string | null
  reference: string | null
  created_at?: string
}

export interface SocialLink {
  id: string
  platform: 'instagram' | 'tiktok' | 'facebook' | 'whatsapp' | string
  url: string
  active: boolean
}

export interface StoreSettings {
  id: true
  store_name: string
  whatsapp_number: string | null
  delivery_info: string | null
  qr_image_url: string | null
}

export interface CartItem {
  product: Product
  quantity: number
}
