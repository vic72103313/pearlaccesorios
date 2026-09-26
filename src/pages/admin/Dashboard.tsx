import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function Dashboard() {
  const [stats, setStats] = useState({
    productos: 0,
    pedidosPendientes: 0,
    ventasHoy: 0,
    clientes: 0,
  })

  useEffect(() => {
    async function load() {
      const [{ count: productos }, { count: pedidosPendientes }, { count: clientes }, { data: ordersToday }] =
        await Promise.all([
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pendiente'),
          supabase.from('customers').select('*', { count: 'exact', head: true }),
          supabase
            .from('orders')
            .select('total, created_at')
            .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
        ])

      const ventasHoy = (ordersToday ?? []).reduce((sum, o: any) => sum + Number(o.total), 0)

      setStats({
        productos: productos ?? 0,
        pedidosPendientes: pedidosPendientes ?? 0,
        clientes: clientes ?? 0,
        ventasHoy,
      })
    }
    load()
  }, [])

  const cards = [
    { label: 'Productos activos', value: stats.productos },
    { label: 'Pedidos pendientes', value: stats.pedidosPendientes },
    { label: 'Clientes registrados', value: stats.clientes },
    { label: 'Ventas de hoy', value: `Bs ${stats.ventasHoy.toFixed(2)}` },
  ]

  return (
    <div>
      <h1 style={{ fontSize: '1.6rem', marginBottom: 24 }}>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        {cards.map((c) => (
          <div key={c.label} className="card" style={{ padding: 20 }}>
            <div style={{ color: 'var(--color-text-soft)', fontSize: '0.85rem' }}>{c.label}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: 8 }}>{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
