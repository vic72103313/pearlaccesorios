import { Link } from 'react-router-dom'

export default function OrderSuccess() {
  return (
    <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '1.9rem' }}>¡Pedido enviado!</h1>
      <p style={{ marginTop: 14, color: 'var(--color-text-soft)', maxWidth: 460, marginInline: 'auto' }}>
        Tu pedido quedó registrado. Te confirmaremos por WhatsApp en cuanto verifiquemos tu pago.
      </p>
      <Link to="/catalogo" className="btn btn-primary" style={{ marginTop: 24, display: 'inline-flex' }}>
        Seguir comprando
      </Link>
    </div>
  )
}
