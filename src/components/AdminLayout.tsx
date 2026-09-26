import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/productos', label: 'Productos' },
  { to: '/admin/categorias', label: 'Categorías' },
  { to: '/admin/pedidos', label: 'Pedidos' },
  { to: '/admin/clientes', label: 'Clientes' },
  { to: '/admin/ofertas', label: 'Ofertas' },
  { to: '/admin/ventas', label: 'Ventas' },
  { to: '/admin/usuarios', label: 'Usuarios' },
  { to: '/admin/configuracion', label: 'Configuración' },
]

export default function AdminLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/admin/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside
        style={{
          width: 230,
          flexShrink: 0,
          borderRight: '1px solid var(--color-border)',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h2 style={{ fontSize: '1.2rem', marginBottom: 24 }}>Pearl · Admin</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              style={({ isActive }) => ({
                padding: '10px 12px',
                borderRadius: 8,
                fontSize: '0.92rem',
                background: isActive ? 'var(--color-rose)' : 'transparent',
                color: isActive ? '#fff' : 'var(--color-text)',
              })}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16, fontSize: '0.85rem' }}>
          <div style={{ marginBottom: 8, color: 'var(--color-text-soft)' }}>
            {profile?.full_name || profile?.email}
            <br />
            Rol: {profile?.role}
          </div>
          <button className="btn btn-secondary" style={{ width: '100%' }} onClick={handleSignOut}>
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, padding: 32, background: 'var(--color-bg)' }}>
        <Outlet />
      </main>
    </div>
  )
}
