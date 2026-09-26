import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { Category, Product } from '../../types'
import ProductCard from '../../components/ProductCard'

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [params, setParams] = useSearchParams()

  const categoryId = params.get('categoria') ?? ''
  const search = params.get('buscar') ?? ''

  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .order('name')
      .then(({ data }) => setCategories((data as Category[]) ?? []))
  }, [])

  useEffect(() => {
    setLoading(true)
    let query = supabase
      .from('products')
      .select('*, categories(*), product_images(*)')
      .eq('active', true)
      .order('created_at', { ascending: false })

    if (categoryId) query = query.eq('category_id', categoryId)
    if (search) query = query.ilike('name', `%${search}%`)

    query.then(({ data }) => {
      setProducts((data as Product[]) ?? [])
      setLoading(false)
    })
  }, [categoryId, search])

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <h1 style={{ fontSize: '1.9rem', marginBottom: 24 }}>Catálogo</h1>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
        <button
          className="btn"
          style={{
            background: !categoryId ? 'var(--color-text)' : 'transparent',
            color: !categoryId ? '#fff' : 'var(--color-text)',
            border: '1px solid var(--color-text)',
            padding: '8px 18px',
          }}
          onClick={() => setParams((p) => { p.delete('categoria'); return p })}
        >
          Todas
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className="btn"
            style={{
              background: categoryId === c.id ? 'var(--color-text)' : 'transparent',
              color: categoryId === c.id ? '#fff' : 'var(--color-text)',
              border: '1px solid var(--color-text)',
              padding: '8px 18px',
            }}
            onClick={() => setParams((p) => { p.set('categoria', c.id); return p })}
          >
            {c.name}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Cargando productos...</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 20,
          }}
        >
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
          {products.length === 0 && <p style={{ color: 'var(--color-text-soft)' }}>No se encontraron productos.</p>}
        </div>
      )}
    </div>
  )
}
