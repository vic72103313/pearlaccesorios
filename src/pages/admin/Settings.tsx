import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { uploadFile } from '../../lib/storage'
import { SocialLink } from '../../types'

const PLATFORMS = ['instagram', 'tiktok', 'facebook', 'whatsapp']

export default function Settings() {
  const [storeName, setStoreName] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [deliveryInfo, setDeliveryInfo] = useState('')
  const [qrImageUrl, setQrImageUrl] = useState('')
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function load() {
    const [{ data: settings }, { data: links }] = await Promise.all([
      supabase.from('store_settings').select('*').single(),
      supabase.from('social_links').select('*'),
    ])
    if (settings) {
      setStoreName(settings.store_name ?? '')
      setWhatsappNumber(settings.whatsapp_number ?? '')
      setDeliveryInfo(settings.delivery_info ?? '')
      setQrImageUrl(settings.qr_image_url ?? '')
    }
    setSocialLinks((links as SocialLink[]) ?? [])
  }

  useEffect(() => {
    load()
  }, [])

  async function handleQrUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadFile('store-assets', file)
      setQrImageUrl(url)
    } catch {
      setMessage('No se pudo subir la imagen. Revisa que el bucket "store-assets" exista y sea público.')
    } finally {
      setUploading(false)
    }
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    const { error } = await supabase
      .from('store_settings')
      .update({
        store_name: storeName,
        whatsapp_number: whatsappNumber,
        delivery_info: deliveryInfo,
        qr_image_url: qrImageUrl,
      })
      .eq('id', true)
    setSaving(false)
    setMessage(error ? 'No se pudo guardar.' : 'Configuración guardada.')
  }

  function updateLinkField(platform: string, field: 'url' | 'active', value: string | boolean) {
    setSocialLinks((prev) => {
      const existing = prev.find((l) => l.platform === platform)
      if (existing) {
        return prev.map((l) => (l.platform === platform ? { ...l, [field]: value } : l))
      }
      return [...prev, { id: '', platform, url: field === 'url' ? (value as string) : '', active: field === 'active' ? (value as boolean) : true }]
    })
  }

  async function saveSocialLinks() {
    setSaving(true)
    for (const link of socialLinks) {
      if (link.id) {
        await supabase.from('social_links').update({ url: link.url, active: link.active }).eq('id', link.id)
      } else if (link.url) {
        await supabase.from('social_links').insert({ platform: link.platform, url: link.url, active: link.active })
      }
    }
    await load()
    setSaving(false)
    setMessage('Redes sociales guardadas.')
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <h1 style={{ fontSize: '1.6rem', marginBottom: 20 }}>Configuración de la tienda</h1>

      <form onSubmit={saveSettings} className="card" style={{ padding: 20, marginBottom: 24 }}>
        <div className="field">
          <label className="label">Nombre de la tienda</label>
          <input className="input" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
        </div>
        <div className="field">
          <label className="label">WhatsApp (con código de país, ej. 59171234567)</label>
          <input className="input" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} />
        </div>
        <div className="field">
          <label className="label">Información de delivery</label>
          <textarea className="input" rows={3} value={deliveryInfo} onChange={(e) => setDeliveryInfo(e.target.value)} />
        </div>
        <div className="field">
          <label className="label">Imagen del QR de pago</label>
          {qrImageUrl && <img src={qrImageUrl} style={{ width: 120, marginBottom: 10, borderRadius: 8 }} />}
          <input type="file" accept="image/*" onChange={handleQrUpload} disabled={uploading} />
        </div>
        <button className="btn btn-primary" disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>

      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ marginBottom: 14, fontSize: '1.05rem' }}>Redes sociales</h3>
        {PLATFORMS.map((platform) => {
          const link = socialLinks.find((l) => l.platform === platform)
          return (
            <div key={platform} className="field" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <label className="label" style={{ width: 90, textTransform: 'capitalize', margin: 0 }}>
                {platform}
              </label>
              <input
                className="input"
                placeholder={`Enlace de ${platform}`}
                value={link?.url ?? ''}
                onChange={(e) => updateLinkField(platform, 'url', e.target.value)}
              />
              <input
                type="checkbox"
                checked={link?.active ?? true}
                onChange={(e) => updateLinkField(platform, 'active', e.target.checked)}
                title="Visible en la tienda"
              />
            </div>
          )
        })}
        <button className="btn btn-primary" onClick={saveSocialLinks} disabled={saving} type="button">
          Guardar redes sociales
        </button>
      </div>

      {message && <p style={{ marginTop: 14, color: 'var(--color-rose-dark)' }}>{message}</p>}
    </div>
  )
}
