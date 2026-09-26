import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Order } from '../../types'

export default function Sales() {
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    supabase
      .from('orders')
      .select('*')
      .neq('status', 'cancelado')
      .order('created_at', { ascending: false })
      .then(({ data }) => setOrders((data as Order[]) ?? []))
  }, [])

  const totalGeneral = orders.reduce((sum, o) => sum + Number(o.total), 0)
  const totalEntregado = orders.filter((o) => o.status === 'entregado').reduce((sum, o) => sum + Number(o.total), 0)

  return (
    <div>
      <h1 style={{ fontSize: '1.6rem', marginBottom: 20 }}>Ventas</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ color: 'var(--color-text-soft)', fontSize: '0.85rem' }}>Total en pedidos (no cancelados)</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: 6 }}>Bs {totalGeneral.toFixed(2)}</div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ color: 'var(--color-text-soft)', fontSize: '0.85rem' }}>Total entregado</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: 6 }}>Bs {totalEntregado.toFixed(2)}</div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ color: 'var(--color-text-soft)', fontSize: '0.85rem' }}>Cantidad de pedidos</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: 6 }}>{orders.length}</div>
        </div>
      </div>

      <div className="card scroll-x">
        <table className="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Estado</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{new Date(o.created_at).toLocaleDateString('es-BO')}</td>
                <td>{o.customer_name}</td>
                <td style={{ textTransform: 'capitalize' }}>{o.status}</td>
                <td>Bs {Number(o.total).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
