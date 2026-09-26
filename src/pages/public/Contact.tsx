import { useStoreConfig } from '../../context/StoreConfigContext'

const LABELS: Record<string, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  whatsapp: 'WhatsApp',
}

export default function Contact() {
  const { settings, socialLinks } = useStoreConfig()

  return (
    <div className="container" style={{ padding: '48px 24px', maxWidth: 560 }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: 16 }}>Contáctanos</h1>
      {settings?.whatsapp_number && (
        <p style={{ marginBottom: 20 }}>
          Escríbenos directo por WhatsApp al{' '}
          <a
            href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--color-rose-dark)', fontWeight: 600 }}
          >
            {settings.whatsapp_number}
          </a>
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {socialLinks.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="card"
            style={{ padding: '14px 18px', fontWeight: 600 }}
          >
            {LABELS[link.platform] ?? link.platform}
          </a>
        ))}
        {socialLinks.length === 0 && (
          <p style={{ color: 'var(--color-text-soft)' }}>Aún no se configuraron redes sociales.</p>
        )}
      </div>
    </div>
  )
}
