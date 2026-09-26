import { Navigate } from 'react-router-dom'
import { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { profile, loading } = useAuth()

  if (loading) return <div style={{ padding: 40 }}>Cargando...</div>
  if (!profile) return <Navigate to="/admin/login" replace />

  return <>{children}</>
}
