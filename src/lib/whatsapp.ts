import { CartItem } from '../types'

export function buildOrderWhatsAppMessage(params: {
  customerName: string
  customerPhone: string
  address: string
  reference: string
  items: CartItem[]
  total: number
}) {
  const { customerName, customerPhone, address, reference, items, total } = params

  const lines = [
    `*Nuevo pedido - Pearl Accesorios*`,
    ``,
    `Cliente: ${customerName}`,
    `Teléfono: ${customerPhone}`,
    `Dirección: ${address}`,
    reference ? `Referencia: ${reference}` : null,
    ``,
    `*Productos:*`,
    ...items.map(
      (i) =>
        `- ${i.quantity} x ${i.product.name} (Bs ${i.product.price.toFixed(2)}) = Bs ${(
          i.product.price * i.quantity
        ).toFixed(2)}`
    ),
    ``,
    `*Total: Bs ${total.toFixed(2)}*`,
    ``,
    `Pago realizado por QR. Adjunto comprobante.`,
  ].filter(Boolean)

  return lines.join('\n')
}

export function whatsappLink(phone: string, message: string) {
  const digits = phone.replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
