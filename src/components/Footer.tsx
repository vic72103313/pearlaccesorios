import { useStoreConfig } from '../context/StoreConfigContext'

const LABELS: Record<string, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  whatsapp: 'WhatsApp',
}

export default function Footer() {
  const { settings, socialLinks } = useStoreConfig()

  return (
    <footer
      style={{
        borderTop: '1px solid var(--color-border)',
        marginTop: 64,
        padding: '32px 0',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <strong style={{ fontFamily: 'var(--font-display)' }}>
            {settings?.store_name ?? 'Pearl Accesorios'}
          </strong>
          <p style={{ color: 'var(--color-text-soft)', fontSize: '0.9rem', margin: '6px 0 0' }}>
            Joyería, accesorios y ropa con entrega a domicilio.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {socialLinks.map((link) => (
            <a key={link.id} href={link.url} target="_blank" rel="noreferrer">
              {LABELS[link.platform] ?? link.platform}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
