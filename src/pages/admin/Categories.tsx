import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Category } from '../../types'

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function load() {
    const { data } = await supabase.from('categories').select('*').order('name')
    setCategories((data as Category[]) ?? [])
  }

  useEffect(() => {
    load()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setError('')

    if (editingId) {
      const { error } = await supabase.from('categories').update({ name }).eq('id', editingId)
      if (error) setError('No se pudo actualizar la categoría.')
    } else {
      const { error } = await supabase.from('categories').insert({ name })
      if (error) setError('No se pudo crear la categoría.')
    }
    setName('')
    setEditingId(null)
    load()
  }

  async function remove(id: string) {
    if (!confirm('¿Eliminar esta categoría? Los productos quedarán sin categoría.')) return
    await supabase.from('categories').delete().eq('id', id)
    load()
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <h1 style={{ fontSize: '1.6rem', marginBottom: 20 }}>Categorías</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input
          className="input"
          placeholder="Nombre de la categoría"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="btn btn-primary">{editingId ? 'Guardar' : 'Agregar'}</button>
      </form>
      {error && <p style={{ color: '#a15f68', marginBottom: 12 }}>{error}</p>}

      <div className="card">
        <table className="table">
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '6px 14px' }}
                    onClick={() => {
                      setEditingId(c.id)
                      setName(c.name)
                    }}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '6px 14px', color: '#a15f68', borderColor: '#a15f68' }}
                    onClick={() => remove(c.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td style={{ color: 'var(--color-text-soft)' }}>Aún no hay categorías.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
