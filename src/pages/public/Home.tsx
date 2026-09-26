import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { Product } from '../../types'
import ProductCard from '../../components/ProductCard'

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    supabase
      .from('products')
      .select('*, categories(*), product_images(*)')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(8)
      .then(({ data }) => setProducts((data as Product[]) ?? []))
  }, [])

  return (
    <div>
      <section
        style={{
          background: 'linear-gradient(135deg, #fbe4d8 0%, #fdf7f1 55%)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div
          className="container"
          style={{
            padding: '72px 24px 64px',
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,0.9fr)',
            gap: 40,
            alignItems: 'center',
          }}
        >
          <div>
            <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', maxWidth: 520 }}>
              Accesorios que cuentan quién eres
            </h1>
            <p style={{ maxWidth: 460, marginTop: 20, color: 'var(--color-text-soft)', fontSize: '1.05rem' }}>
              Joyas de acero, collares, manillas y ropa pensados para tu día a día. Pide por
              WhatsApp, paga por QR y recíbelo en tu puerta.
            </p>
            <div style={{ marginTop: 28, display: 'flex', gap: 14 }}>
              <Link to="/catalogo" className="btn btn-primary">
                Ver catálogo
              </Link>
              <Link to="/contacto" className="btn btn-secondary">
                Contáctanos
              </Link>
            </div>
          </div>
          <div
            className="card"
            style={{
              aspectRatio: '4 / 5',
              background: 'linear-gradient(160deg, var(--color-rose), var(--color-amber))',
            }}
          />
        </div>
      </section>

      <section className="container" style={{ padding: '56px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h2 style={{ fontSize: '1.7rem' }}>Recién llegados</h2>
          <Link to="/catalogo" style={{ color: 'var(--color-rose-dark)', fontWeight: 600 }}>
            Ver todo
          </Link>
        </div>
        <div
          style={{
            marginTop: 24,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 20,
          }}
        >
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
          {products.length === 0 && (
            <p style={{ color: 'var(--color-text-soft)' }}>Todavía no hay productos publicados.</p>
          )}
        </div>
      </section>
    </div>
  )
}
