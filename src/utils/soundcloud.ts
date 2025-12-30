export function getSoundCloudEmbedUrl(url: string): string {
  const baseEmbedUrl = 'https://w.soundcloud.com/player/';

  const params = new URLSearchParams({
    url: url,
    color: '#666666',
    auto_play: 'false',
    hide_related: 'true',
    show_comments: 'false',
    show_user: 'false',
    show_reposts: 'false',
    show_teaser: 'false',
    visual: 'false',
    show_playcount: 'false',
    sharing: 'true',
    download: 'false',
    buying: 'false',
    show_artwork: 'false',
  });

  return `${baseEmbedUrl}?${params.toString()}`;
}

export function extractSoundCloudUrl(input: string): string {
  const trimmedInput = input.trim();

  if (trimmedInput.startsWith('<iframe')) {
    const srcMatch = trimmedInput.match(/src=["']([^"']+)["']/);
    if (srcMatch && srcMatch[1]) {
      const embedUrl = srcMatch[1];
      const urlMatch = embedUrl.match(/[?&]url=([^&]+)/);
      if (urlMatch && urlMatch[1]) {
        return decodeURIComponent(urlMatch[1]);
      }
    }
  }

  return trimmedInput;
}
