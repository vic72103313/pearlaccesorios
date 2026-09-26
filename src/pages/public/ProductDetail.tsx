import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { Product } from '../../types'
import { useCart } from '../../context/CartContext'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    if (!id) return
    supabase
      .from('products')
      .select('*, categories(*), product_images(*)')
      .eq('id', id)
      .single()
      .then(({ data }) => setProduct(data as Product))
  }, [id])

  if (!product) return <div className="container" style={{ padding: 40 }}>Cargando...</div>

  const images = product.product_images ?? []

  return (
    <div className="container" style={{ padding: '40px 24px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 48 }}>
      <div>
        <div className="card" style={{ aspectRatio: '1/1', overflow: 'hidden', background: '#f3e8de' }}>
          {images[activeImage] && (
            <img
              src={images[activeImage].url}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </div>
        {images.length > 1 && (
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setActiveImage(idx)}
                style={{
                  width: 60,
                  height: 60,
                  border: idx === activeImage ? '2px solid var(--color-rose)' : '1px solid var(--color-border)',
                  borderRadius: 8,
                  overflow: 'hidden',
                  padding: 0,
                }}
              >
                <img src={img.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        {product.categories && (
          <span style={{ color: 'var(--color-text-soft)', fontSize: '0.85rem' }}>
            {product.categories.name}
          </span>
        )}
        <h1 style={{ fontSize: '2rem', marginTop: 6 }}>{product.name}</h1>
        <p style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-rose-dark)', marginTop: 12 }}>
          Bs {product.price.toFixed(2)}
        </p>
        <p style={{ marginTop: 18, color: 'var(--color-text-soft)', lineHeight: 1.6 }}>
          {product.description || 'Sin descripción disponible.'}
        </p>

        {product.stock > 0 ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24 }}>
              <label className="label" style={{ margin: 0 }}>Cantidad</label>
              <input
                type="number"
                min={1}
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, Number(e.target.value))))}
                className="input"
                style={{ width: 80 }}
              />
              <span style={{ color: 'var(--color-text-soft)', fontSize: '0.85rem' }}>
                {product.stock} disponibles
              </span>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button className="btn btn-secondary" onClick={() => addItem(product, quantity)}>
                Agregar al carrito
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  addItem(product, quantity)
                  navigate('/carrito')
                }}
              >
                Comprar ahora
              </button>
            </div>
          </>
        ) : (
          <span className="badge" style={{ background: '#f3e2e2', color: '#a15f68', marginTop: 20 }}>
            Producto agotado
          </span>
        )}
      </div>
    </div>
  )
}
