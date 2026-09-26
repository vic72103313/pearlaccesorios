import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

export default function Cart() {
  const { items, updateQuantity, removeItem, total } = useCart()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.6rem' }}>Tu carrito está vacío</h1>
        <Link to="/catalogo" className="btn btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>
          Ver catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: 720 }}>
      <h1 style={{ fontSize: '1.7rem', marginBottom: 24 }}>Tu carrito</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {items.map((item) => (
          <div
            key={item.product.id}
            className="card"
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14 }}
          >
            <div style={{ width: 64, height: 64, borderRadius: 8, overflow: 'hidden', background: '#f3e8de', flexShrink: 0 }}>
              {item.product.product_images?.[0] && (
                <img
                  src={item.product.product_images[0].url}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{item.product.name}</div>
              <div style={{ color: 'var(--color-text-soft)', fontSize: '0.9rem' }}>
                Bs {item.product.price.toFixed(2)}
              </div>
            </div>
            <input
              type="number"
              min={1}
              max={item.product.stock}
              value={item.quantity}
              onChange={(e) => updateQuantity(item.product.id, Number(e.target.value))}
              className="input"
              style={{ width: 70 }}
            />
            <button onClick={() => removeItem(item.product.id)} className="btn btn-secondary" style={{ padding: '8px 14px' }}>
              Quitar
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, fontSize: '1.2rem', fontWeight: 700 }}>
        <span>Total</span>
        <span>Bs {total.toFixed(2)}</span>
      </div>

      <button className="btn btn-primary" style={{ width: '100%', marginTop: 20 }} onClick={() => navigate('/finalizar-pedido')}>
        Finalizar pedido
      </button>
    </div>
  )
}
