import type { HtmlTagDescriptor, Plugin } from 'vite';

export function readSiteUrl(value: string | undefined): string | null;
export function shareTags(site: string | null): HtmlTagDescriptor[];
export function linkPreviews(env: Record<string, string | undefined>): Plugin;
