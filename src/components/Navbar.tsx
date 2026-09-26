import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useStoreConfig } from '../context/StoreConfigContext'

export default function Navbar() {
  const { count } = useCart()
  const { settings } = useStoreConfig()
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function onSearch(e: React.FormEvent) {
    e.preventDefault()
    navigate(`/catalogo?buscar=${encodeURIComponent(query)}`)
  }

  return (
    <header
      style={{
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-bg)',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          padding: '18px 24px',
          flexWrap: 'wrap',
        }}
      >
        <Link to="/" style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>
          {settings?.store_name ?? 'Pearl Accesorios'}
        </Link>

        <form
          onSubmit={onSearch}
          style={{ flex: '1 1 260px', maxWidth: 380, display: 'flex', gap: 8 }}
        >
          <input
            className="input"
            placeholder="Buscar productos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link to="/catalogo">Catálogo</Link>
          <Link to="/contacto">Contacto</Link>
          <Link
            to="/carrito"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
          >
            Carrito
            {count > 0 && (
              <span
                style={{
                  background: 'var(--color-orange)',
                  color: '#fff',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                }}
              >
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  )
}
