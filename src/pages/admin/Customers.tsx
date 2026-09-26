import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Customer } from '../../types'

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])

  useEffect(() => {
    supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setCustomers((data as Customer[]) ?? []))
  }, [])

  return (
    <div>
      <h1 style={{ fontSize: '1.6rem', marginBottom: 20 }}>Clientes</h1>
      <div className="card scroll-x">
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Dirección</th>
              <th>Referencia</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.phone}</td>
                <td>{c.address}</td>
                <td>{c.reference}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: 'var(--color-text-soft)' }}>
                  Aún no hay clientes registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
