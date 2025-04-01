import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Media, Post, UrlMeta } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractMediaFromBody(body: string): Media[] {
  const media: Media[] = [];

  // Extract images
  const imageMatches = body.match(/!\[.*?\]\((.*?)\)/g);
  if (imageMatches) {
    imageMatches.forEach(match => {
      const url = match.match(/\((.*?)\)/)?.[1];
      if (url) media.push({ type: 'image', url });
    });
  }

  // Extract videos from iframes with IPFS links
  const iframeMatches = body.match(/<iframe.*?src="(.*?)".*?><\/iframe>/g);
  if (iframeMatches) {
    iframeMatches.forEach(match => {
      const url = match.match(/src="(.*?)"/)?.[1];
      if (url && url.includes('ipfs.skatehive.app')) {
        media.push({ type: 'video', url });
      }
    });
  }

  return media;
}

export const validateUrl = (url: string): UrlMeta => {
  const urlRegex = /^https?:\/\/([^\s<>#%"\,\{\}\\|\\\^\[\]`]+)$/;
  const trimmedUrl = url.trim();
  
  return {
    isUrl: urlRegex.test(trimmedUrl),
    sanitizedUrl: trimmedUrl
  };
};

export const isKnownDomain = (url: string): boolean => {
  const knownDomains = [
    'skatehive.app',
    'peakd.com',
    'hive.blog'
  ];
  
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return knownDomains.some(known => domain.includes(known));
  } catch {
    return false;
  }
};