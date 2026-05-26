/**
 * Formata valor em reais
 */
export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Formata número com separadores pt-BR (ex: 1.000, 10.000, 1.000.000)
 */
export function formatNumber(n: number): string {
  return n.toLocaleString('pt-BR')
}

/**
 * Formata quantidade com abreviações (K, M)
 */
export function formatQuantity(qty: number): string {
  if (qty >= 1_000_000) return `${(qty / 1_000_000).toFixed(qty % 1_000_000 === 0 ? 0 : 1)}M`
  if (qty >= 1_000) return `${(qty / 1_000).toFixed(qty % 1_000 === 0 ? 0 : 1)}K`
  return qty.toString()
}

/**
 * Valida input do Instagram (@ de usuário ou URL de perfil/post)
 * Retorna: { valid, link, user }
 */
export function validateInstagramInput(input: string): {
  valid: boolean
  link: string
  user: string
} {
  const trimmed = input.trim()

  // URL do Instagram (post, reel, perfil)
  const urlPattern = /^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv|stories)?\/?([\w.]+)\/?/i
  const urlMatch = trimmed.match(urlPattern)
  if (urlMatch) {
    return { valid: true, link: trimmed, user: urlMatch[3] || trimmed }
  }

  // @ de usuário (com ou sem o @)
  const atPattern = /^@?([\w.]{1,30})$/
  const atMatch = trimmed.match(atPattern)
  if (atMatch) {
    const username = atMatch[1]
    return {
      valid: true,
      link: `https://www.instagram.com/${username}/`,
      user: `@${username}`,
    }
  }

  return { valid: false, link: '', user: '' }
}

/**
 * Valida input social — Instagram ou TikTok
 * Retorna: { valid, link, user }
 */
export function validateSocialInput(
  input: string,
  platform: 'instagram' | 'tiktok' = 'instagram'
): { valid: boolean; link: string; user: string } {
  if (platform === 'tiktok') {
    const trimmed = input.trim()

    // TikTok URL (perfil ou vídeo)
    const ttUrlPattern = /^https?:\/\/(www\.)?tiktok\.com\/@([\w.]+)(\/video\/\d+)?/i
    const ttUrlMatch = trimmed.match(ttUrlPattern)
    if (ttUrlMatch) {
      return { valid: true, link: trimmed, user: `@${ttUrlMatch[2]}` }
    }

    // @ de usuário (com ou sem o @)
    const atPattern = /^@?([\w.]{1,24})$/
    const atMatch = trimmed.match(atPattern)
    if (atMatch) {
      const username = atMatch[1]
      return {
        valid: true,
        link: `https://www.tiktok.com/@${username}`,
        user: `@${username}`,
      }
    }

    return { valid: false, link: '', user: '' }
  }

  return validateInstagramInput(input)
}
