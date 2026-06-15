// Instagram: curtidas, views reels — precisa do link do post/reel
export function cleanInstagramPost(raw: string): string | null {
  const m = raw.match(/instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)/);
  return m ? `https://www.instagram.com/${m[1]}/${m[2]}/` : null;
}

// Instagram views stories
export function cleanInstagramStory(raw: string): string | null {
  const m = raw.match(/instagram\.com\/stories\/([A-Za-z0-9_.]+)\/(\d+)/);
  return m ? `https://www.instagram.com/stories/${m[1]}/${m[2]}/` : null;
}

// TikTok: curtidas e views — precisa do link do vídeo
export function cleanTikTokVideo(raw: string): string | null {
  // aceita formato completo e vm.tiktok.com encurtado
  const full = raw.match(/tiktok\.com\/@[A-Za-z0-9_.]+\/video\/(\d+)/);
  if (full) return raw.split('?')[0]; // remove parâmetros, mantém link do vídeo
  const short = raw.match(/vm\.tiktok\.com\/[A-Za-z0-9]+/);
  if (short) return short[0].startsWith('http') ? short[0] : `https://${short[0]}`;
  return null;
}

// Perfil (seguidores) — só o @
export function cleanProfile(username: string, platform: 'instagram' | 'tiktok'): string {
  const u = username.replace('@', '').trim();
  return platform === 'tiktok'
    ? `https://www.tiktok.com/@${u}`
    : `https://www.instagram.com/${u}`;
}
