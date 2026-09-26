import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useCart } from '../../context/CartContext'
import { useStoreConfig } from '../../context/StoreConfigContext'
import { buildOrderWhatsAppMessage, whatsappLink } from '../../lib/whatsapp'

export default function Checkout() {
  const { items, total, clear } = useCart()
  const { settings } = useStoreConfig()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [reference, setReference] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (items.length === 0) {
    navigate('/catalogo')
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name || !phone || !address) {
      setError('Completa nombre, teléfono y dirección para continuar.')
      return
    }

    setSubmitting(true)
    try {
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert({ name, phone, address, reference })
        .select()
        .single()
      if (customerError) throw customerError

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: customer.id,
          customer_name: name,
          customer_phone: phone,
          delivery_address: address,
          delivery_reference: reference,
          status: 'pendiente',
          total,
        })
        .select()
        .single()
      if (orderError) throw orderError

      const orderItems = items.map((i) => ({
        order_id: order.id,
        product_id: i.product.id,
        product_name: i.product.name,
        quantity: i.quantity,
        unit_price: i.product.price,
      }))
      const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
      if (itemsError) throw itemsError

      const message = buildOrderWhatsAppMessage({
        customerName: name,
        customerPhone: phone,
        address,
        reference,
        items,
        total,
      })
      const link = whatsappLink(settings?.whatsapp_number || '', message)

      clear()
      window.open(link, '_blank')
      navigate('/pedido-enviado')
    } catch (err: any) {
      setError('Ocurrió un problema al registrar tu pedido. Intenta de nuevo.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: 640 }}>
      <h1 style={{ fontSize: '1.7rem', marginBottom: 24 }}>Finalizar pedido</h1>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label className="label">Nombre completo</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label className="label">WhatsApp / teléfono</label>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="field">
          <label className="label">Dirección de entrega</label>
          <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div className="field">
          <label className="label">Referencia (opcional)</label>
          <input className="input" value={reference} onChange={(e) => setReference(e.target.value)} />
        </div>

        {settings?.qr_image_url && (
          <div className="card" style={{ padding: 20, textAlign: 'center', marginBottom: 20 }}>
            <p style={{ marginBottom: 12, fontWeight: 600 }}>Escanea el QR para pagar Bs {total.toFixed(2)}</p>
            <img src={settings.qr_image_url} alt="QR de pago" style={{ maxWidth: 220, margin: '0 auto' }} />
          </div>
        )}

        {settings?.delivery_info && (
          <p style={{ color: 'var(--color-text-soft)', fontSize: '0.9rem', marginBottom: 20 }}>
            {settings.delivery_info}
          </p>
        )}

        {error && <p style={{ color: '#a15f68', marginBottom: 16 }}>{error}</p>}

        <button className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
          {submitting ? 'Enviando...' : 'Enviar pedido por WhatsApp'}
        </button>
      </form>
    </div>
  )
}
