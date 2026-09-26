import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { Profile } from '../../types'

export default function Users() {
  const { profile } = useAuth()
  const [users, setUsers] = useState<Profile[]>([])
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'staff' | 'admin'>('staff')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    const { data } = await supabase.from('profiles').select('id, email, full_name, role').order('email')
    setUsers((data as Profile[]) ?? [])
  }

  useEffect(() => {
    load()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!fullName || !email || !password) {
      setError('Completa nombre, correo y contraseña.')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    setSaving(true)
    const { error } = await supabase.rpc('create_staff_user', {
      p_email: email,
      p_password: password,
      p_full_name: fullName,
      p_role: role,
    })
    setSaving(false)
    if (error) {
      setError('No se pudo crear el usuario: ' + error.message)
      return
    }
    setSuccess(`Usuario "${fullName}" creado correctamente.`)
    setFullName('')
    setEmail('')
    setPassword('')
    setRole('staff')
    load()
  }

  if (profile?.role !== 'admin') {
    return <p style={{ color: 'var(--color-text-soft)' }}>Solo un administrador puede ver esta sección.</p>
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.6rem', marginBottom: 20 }}>Usuarios del panel</h1>

      <form onSubmit={handleSubmit} className="card" style={{ padding: 20, marginBottom: 24, maxWidth: 460 }}>
        <h3 style={{ marginBottom: 14, fontSize: '1.05rem' }}>Crear nuevo usuario</h3>
        <div className="field">
          <label className="label">Nombre completo</label>
          <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="field">
          <label className="label">Correo</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label className="label">Contraseña temporal</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="field">
          <label className="label">Rol</label>
          <select className="input" value={role} onChange={(e) => setRole(e.target.value as 'staff' | 'admin')}>
            <option value="staff">Empleado / vendedor (staff)</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        {error && <p style={{ color: '#a15f68', marginBottom: 12 }}>{error}</p>}
        {success && <p style={{ color: '#3f7a4d', marginBottom: 12 }}>{success}</p>}
        <button className="btn btn-primary" disabled={saving}>
          {saving ? 'Creando...' : 'Crear usuario'}
        </button>
      </form>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.full_name}</td>
                <td>{u.email}</td>
                <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
