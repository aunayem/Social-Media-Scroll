export interface LinkMetadata {
  url: string;
  domain: string;
  title: string;
  description?: string;
  faviconUrl: string;
}

export const URL_REGEX = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/gi;

export function extractUrls(text: string): string[] {
  if (!text) return [];
  const matches = text.match(URL_REGEX);
  if (!matches) return [];
  // Return unique URLs
  return Array.from(new Set(matches));
}

// Generate rich, clean metadata for detected links
export function getLinkMetadata(urlStr: string): LinkMetadata {
  try {
    const parsed = new URL(urlStr);
    const domain = parsed.hostname.replace(/^www\./, '');
    let title = domain;
    let description = parsed.pathname !== '/' ? parsed.pathname.replace(/\/$/, '') : '';

    // Smart title formatting based on well-known domains
    if (domain.includes('github.com')) {
      const parts = parsed.pathname.split('/').filter(Boolean);
      title = parts.length >= 2 ? `${parts[0]}/${parts[1]}` : 'GitHub: Where the world builds software';
      description = 'github.com';
    } else if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
      title = 'YouTube: Watch & Listen';
      description = parsed.searchParams.get('v') ? `Video ID: ${parsed.searchParams.get('v')}` : 'youtube.com';
    } else if (domain.includes('google.com')) {
      if (parsed.pathname.includes('/document/d/')) {
        title = 'Google Docs';
        description = 'Document';
      } else if (parsed.pathname.includes('/spreadsheets/d/')) {
        title = 'Google Sheets';
        description = 'Spreadsheet';
      } else {
        title = 'Google';
        description = 'google.com';
      }
    } else if (domain.includes('wikipedia.org')) {
      const topic = parsed.pathname.split('/wiki/')[1];
      title = topic ? decodeURIComponent(topic).replace(/_/g, ' ') : 'Wikipedia, the free encyclopedia';
      description = 'wikipedia.org';
    } else if (domain.includes('twitter.com') || domain.includes('x.com')) {
      title = 'X (formerly Twitter)';
      description = parsed.pathname;
    } else {
      // General domain capitalization
      const name = domain.split('.')[0];
      const cleanTitle = name.charAt(0).toUpperCase() + name.slice(1);
      const subpath = parsed.pathname !== '/' ? parsed.pathname.slice(1).replace(/[-_/]/g, ' ') : '';
      title = subpath ? `${cleanTitle} — ${subpath.slice(0, 35)}` : cleanTitle;
      description = domain;
    }

    // Google's high-res favicon service
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`;

    return {
      url: urlStr,
      domain,
      title,
      description,
      faviconUrl,
    };
  } catch {
    return {
      url: urlStr,
      domain: urlStr,
      title: urlStr,
      faviconUrl: '',
    };
  }
}
