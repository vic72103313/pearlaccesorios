import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Offer, Product } from '../../types'

export default function Offers() {
  const [offers, setOffers] = useState<(Offer & { products?: Product })[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [productId, setProductId] = useState('')
  const [discount, setDiscount] = useState('')
  const [error, setError] = useState('')

  async function load() {
    const [{ data: offersData }, { data: productsData }] = await Promise.all([
      supabase.from('offers').select('*, products(*)').order('created_at', { ascending: false }),
      supabase.from('products').select('*').eq('active', true).order('name'),
    ])
    setOffers((offersData as any) ?? [])
    setProducts((productsData as Product[]) ?? [])
  }

  useEffect(() => {
    load()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!productId || !discount) {
      setError('Elige un producto y un porcentaje de descuento.')
      return
    }
    const { error } = await supabase.from('offers').insert({
      product_id: productId,
      discount_percent: Number(discount),
      active: true,
    })
    if (error) setError('No se pudo crear la oferta.')
    setProductId('')
    setDiscount('')
    load()
  }

  async function toggleActive(offer: Offer) {
    await supabase.from('offers').update({ active: !offer.active }).eq('id', offer.id)
    load()
  }

  async function remove(id: string) {
    await supabase.from('offers').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.6rem', marginBottom: 20 }}>Ofertas</h1>

      <form onSubmit={handleSubmit} className="card" style={{ padding: 16, marginBottom: 20, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label className="label">Producto</label>
          <select className="input" style={{ minWidth: 220 }} value={productId} onChange={(e) => setProductId(e.target.value)}>
            <option value="">Selecciona...</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Descuento (%)</label>
          <input className="input" type="number" style={{ width: 100 }} value={discount} onChange={(e) => setDiscount(e.target.value)} />
        </div>
        <button className="btn btn-primary">Crear oferta</button>
      </form>
      {error && <p style={{ color: '#a15f68', marginBottom: 12 }}>{error}</p>}

      <div className="card scroll-x">
        <table className="table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Descuento</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {offers.map((o) => (
              <tr key={o.id}>
                <td>{o.products?.name ?? '—'}</td>
                <td>{o.discount_percent}%</td>
                <td>
                  <span className="badge" style={{ background: o.active ? '#e3efe4' : '#f3e2e2', color: o.active ? '#3f7a4d' : '#a15f68' }}>
                    {o.active ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary" style={{ padding: '6px 14px' }} onClick={() => toggleActive(o)}>
                    {o.active ? 'Desactivar' : 'Activar'}
                  </button>
                  <button className="btn btn-secondary" style={{ padding: '6px 14px', color: '#a15f68', borderColor: '#a15f68' }} onClick={() => remove(o.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {offers.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: 'var(--color-text-soft)' }}>
                  No hay ofertas creadas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
