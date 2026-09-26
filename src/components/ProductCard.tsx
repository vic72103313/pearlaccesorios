import { Link } from 'react-router-dom'
import { Product } from '../types'

export default function ProductCard({ product }: { product: Product }) {
  const image = product.product_images?.[0]?.url

  return (
    <Link to={`/producto/${product.id}`} className="card" style={{ overflow: 'hidden' }}>
      <div
        style={{
          aspectRatio: '1 / 1',
          background: '#f3e8de',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {image ? (
          <img src={image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ color: 'var(--color-text-soft)', fontSize: '0.85rem' }}>Sin foto</span>
        )}
      </div>
      <div style={{ padding: 16 }}>
        <h3 style={{ fontSize: '1.05rem' }}>{product.name}</h3>
        <p style={{ margin: '8px 0 0', fontWeight: 700, color: 'var(--color-rose-dark)' }}>
          Bs {product.price.toFixed(2)}
        </p>
        {product.stock <= 0 && (
          <span className="badge" style={{ background: '#f3e2e2', color: '#a15f68', marginTop: 8 }}>
            Agotado
          </span>
        )}
      </div>
    </Link>
  )
}
