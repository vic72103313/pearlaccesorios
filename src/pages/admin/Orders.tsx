import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Order, OrderStatus } from '../../types'

const STATUSES: OrderStatus[] = ['pendiente', 'confirmado', 'preparando', 'enviado', 'entregado', 'cancelado']

const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string }> = {
  pendiente: { bg: '#fdf0d8', text: '#a1721c' },
  confirmado: { bg: '#e2ecf7', text: '#2f5f9e' },
  preparando: { bg: '#f3e8fb', text: '#7b4f9e' },
  enviado: { bg: '#e2f0f6', text: '#2b7a94' },
  entregado: { bg: '#e3efe4', text: '#3f7a4d' },
  cancelado: { bg: '#f3e2e2', text: '#a15f68' },
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('')

  async function load() {
    let query = supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
    if (filter) query = query.eq('status', filter)
    const { data } = await query
    setOrders((data as Order[]) ?? [])
  }

  useEffect(() => {
    load()
  }, [filter])

  async function updateStatus(orderId: string, status: OrderStatus) {
    await supabase.from('orders').update({ status }).eq('id', orderId)
    load()
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.6rem', marginBottom: 20 }}>Pedidos</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button className="btn btn-secondary" style={{ padding: '6px 14px' }} onClick={() => setFilter('')}>
          Todos
        </button>
        {STATUSES.map((s) => (
          <button key={s} className="btn btn-secondary" style={{ padding: '6px 14px', textTransform: 'capitalize' }} onClick={() => setFilter(s)}>
            {s}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {orders.map((o) => (
          <div key={o.id} className="card" style={{ padding: 16 }}>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', flexWrap: 'wrap', gap: 8 }}
              onClick={() => setExpanded(expanded === o.id ? null : o.id)}
            >
              <div>
                <strong>{o.customer_name}</strong>
                <span style={{ color: 'var(--color-text-soft)', marginLeft: 10, fontSize: '0.85rem' }}>
                  {new Date(o.created_at).toLocaleString('es-BO')}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontWeight: 700 }}>Bs {Number(o.total).toFixed(2)}</span>
                <span
                  className="badge"
                  style={{ background: STATUS_COLORS[o.status].bg, color: STATUS_COLORS[o.status].text, textTransform: 'capitalize' }}
                >
                  {o.status}
                </span>
              </div>
            </div>

            {expanded === o.id && (
              <div style={{ marginTop: 14, borderTop: '1px solid var(--color-border)', paddingTop: 14 }}>
                <p style={{ fontSize: '0.9rem' }}>
                  <strong>Teléfono:</strong> {o.customer_phone}
                </p>
                <p style={{ fontSize: '0.9rem' }}>
                  <strong>Dirección:</strong> {o.delivery_address} {o.delivery_reference ? `(${o.delivery_reference})` : ''}
                </p>
                <ul style={{ marginTop: 10, paddingLeft: 18 }}>
                  {o.order_items?.map((item) => (
                    <li key={item.id} style={{ fontSize: '0.9rem' }}>
                      {item.quantity} x {item.product_name} — Bs {(item.unit_price * item.quantity).toFixed(2)}
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: 14 }}>
                  <label className="label">Cambiar estado</label>
                  <select
                    className="input"
                    style={{ width: 220 }}
                    value={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value as OrderStatus)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        ))}
        {orders.length === 0 && <p style={{ color: 'var(--color-text-soft)' }}>No hay pedidos todavía.</p>}
      </div>
    </div>
  )
}
