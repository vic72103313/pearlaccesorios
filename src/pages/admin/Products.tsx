import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { Product } from '../../types'

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select('*, categories(*), product_images(*)')
      .order('created_at', { ascending: false })
    setProducts((data as Product[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function toggleActive(p: Product) {
    await supabase.from('products').update({ active: !p.active }).eq('id', p.id)
    load()
  }

  async function remove(p: Product) {
    if (!confirm(`¿Eliminar "${p.name}"? Esta acción no se puede deshacer.`)) return
    await supabase.from('products').delete().eq('id', p.id)
    load()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: '1.6rem' }}>Productos</h1>
        <Link to="/admin/productos/nuevo" className="btn btn-primary">
          + Nuevo producto
        </Link>
      </div>

      <div className="card scroll-x">
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.categories?.name ?? '—'}</td>
                <td>Bs {p.price.toFixed(2)}</td>
                <td>{p.stock}</td>
                <td>
                  <span
                    className="badge"
                    style={{
                      background: p.active ? '#e3efe4' : '#f3e2e2',
                      color: p.active ? '#3f7a4d' : '#a15f68',
                    }}
                  >
                    {p.active ? 'Activo' : 'Oculto'}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <Link to={`/admin/productos/${p.id}`} className="btn btn-secondary" style={{ padding: '6px 14px' }}>
                    Editar
                  </Link>
                  <button className="btn btn-secondary" style={{ padding: '6px 14px' }} onClick={() => toggleActive(p)}>
                    {p.active ? 'Ocultar' : 'Mostrar'}
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '6px 14px', color: '#a15f68', borderColor: '#a15f68' }}
                    onClick={() => remove(p)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {!loading && products.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-text-soft)' }}>
                  Aún no hay productos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
