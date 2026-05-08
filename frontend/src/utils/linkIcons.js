// Platform icon definitions for artist custom links.
// `icon` field stores the `key` of one of these, or '' for favicon fallback.

export const PLATFORM_ICONS = [
  // Music & streaming
  { key: 'spotify',    fa: ['fab', 'spotify'],     label: 'Spotify',     color: '#1DB954' },
  { key: 'soundcloud', fa: ['fab', 'soundcloud'],   label: 'SoundCloud',  color: '#FF3300' },
  { key: 'apple',      fa: ['fab', 'apple'],        label: 'Apple Music', color: '#fc3c44' },
  { key: 'youtube',    fa: ['fab', 'youtube'],      label: 'YouTube',     color: '#FF0000' },
  // Social
  { key: 'instagram',  fa: ['fab', 'instagram'],    label: 'Instagram',   color: '#E4405F' },
  { key: 'tiktok',     fa: ['fab', 'tiktok'],       label: 'TikTok',      color: '#ffffff' },
  { key: 'twitter',    fa: ['fab', 'x-twitter'],    label: 'X / Twitter', color: '#ffffff' },
  { key: 'facebook',   fa: ['fab', 'facebook'],     label: 'Facebook',    color: '#1877F2' },
  { key: 'whatsapp',   fa: ['fab', 'whatsapp'],     label: 'WhatsApp',    color: '#25D366' },
  { key: 'telegram',   fa: ['fab', 'telegram'],     label: 'Telegram',    color: '#2CA5E0' },
  { key: 'twitch',     fa: ['fab', 'twitch'],       label: 'Twitch',      color: '#9146FF' },
  { key: 'discord',    fa: ['fab', 'discord'],      label: 'Discord',     color: '#5865F2' },
  { key: 'linkedin',   fa: ['fab', 'linkedin'],     label: 'LinkedIn',    color: '#0A66C2' },
  // Generic
  { key: 'globe',      fa: ['fas', 'globe'],        label: 'Web',         color: '#888' },
  { key: 'shop',       fa: ['fas', 'shop'],         label: 'Tienda',      color: '#888' },
  { key: 'music',      fa: ['fas', 'music'],        label: 'Música',      color: '#888' },
  { key: 'microphone', fa: ['fas', 'microphone'],   label: 'Booking',     color: '#888' },
  { key: 'envelope',   fa: ['fas', 'envelope'],     label: 'Email',       color: '#888' },
  { key: 'ticket',     fa: ['fas', 'ticket-alt'],   label: 'Tickets',     color: '#888' },
]

export function getPlatformIcon (key) {
  return PLATFORM_ICONS.find(p => p.key === key) || null
}

export function getFaviconUrl (url) {
  try {
    const { hostname } = new URL(url)
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`
  } catch {
    return null
  }
}
