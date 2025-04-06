import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Media, Post } from './types';

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
      if (url) {
        const isGif = url.toLowerCase().endsWith('.gif');
        media.push({ type: isGif ? 'gif' : 'image', url });
      }
    });
  }

  // Extract videos from iframes with IPFS links
  const iframeMatches = body.match(/<iframe.*?src="(.*?)".*?><\/iframe>/g);
  if (iframeMatches) {
    iframeMatches.forEach(match => {
      const url = match.match(/src="(.*?)"/)?.[1];
      if (url) {
        media.push({ type: 'video', url });
      }
    });
  }

  return media;
}