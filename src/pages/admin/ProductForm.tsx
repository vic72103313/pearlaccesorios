import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { uploadFile } from '../../lib/storage'
import { Category, ProductImage } from '../../types'

export default function ProductForm() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()

  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [active, setActive] = useState(true)
  const [images, setImages] = useState<ProductImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => setCategories((data as Category[]) ?? []))
  }, [])

  useEffect(() => {
    if (!isEditing) return
    supabase
      .from('products')
      .select('*, product_images(*)')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (!data) return
        setName(data.name)
        setDescription(data.description ?? '')
        setPrice(String(data.price))
        setStock(String(data.stock))
        setCategoryId(data.category_id ?? '')
        setActive(data.active)
        setImages(data.product_images ?? [])
      })
  }, [id])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !isEditing) return
    setUploading(true)
    try {
      const url = await uploadFile('product-images', file)
      const { data } = await supabase
        .from('product_images')
        .insert({ product_id: id, url, sort_order: images.length })
        .select()
        .single()
      setImages((prev) => [...prev, data as ProductImage])
    } catch (err) {
      setError('No se pudo subir la imagen. Revisa que el bucket "product-images" exista y sea público.')
    } finally {
      setUploading(false)
    }
  }

  async function removeImage(imageId: string) {
    await supabase.from('product_images').delete().eq('id', imageId)
    setImages((prev) => prev.filter((i) => i.id !== imageId))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name || !price) {
      setError('El nombre y el precio son obligatorios.')
      return
    }
    setSaving(true)

    const payload = {
      name,
      description,
      price: Number(price),
      stock: Number(stock || 0),
      category_id: categoryId || null,
      active,
    }

    if (isEditing) {
      const { error } = await supabase.from('products').update(payload).eq('id', id)
      if (error) setError('No se pudo guardar el producto.')
      else navigate('/admin/productos')
    } else {
      const { data, error } = await supabase.from('products').insert(payload).select().single()
      if (error) setError('No se pudo crear el producto.')
      else navigate(`/admin/productos/${data.id}`)
    }
    setSaving(false)
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <h1 style={{ fontSize: '1.6rem', marginBottom: 20 }}>
        {isEditing ? 'Editar producto' : 'Nuevo producto'}
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label className="label">Nombre</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label className="label">Descripción</label>
          <textarea className="input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="field">
            <label className="label">Precio (Bs)</label>
            <input className="input" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div className="field">
            <label className="label">Stock</label>
            <input className="input" type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label className="label">Categoría</label>
          <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} id="active" />
          <label htmlFor="active">Visible en la tienda</label>
        </div>

        {isEditing ? (
          <div className="field">
            <label className="label">Fotografías</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              {images.map((img) => (
                <div key={img.id} style={{ position: 'relative' }}>
                  <img src={img.url} style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 8 }} />
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    style={{
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      background: '#a15f68',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: 20,
                      height: 20,
                      fontSize: 12,
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
          </div>
        ) : (
          <p style={{ color: 'var(--color-text-soft)', fontSize: '0.85rem', marginBottom: 16 }}>
            Guarda el producto primero para poder subir fotografías.
          </p>
        )}

        {error && <p style={{ color: '#a15f68', marginBottom: 12 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-primary" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar producto'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/productos')}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
