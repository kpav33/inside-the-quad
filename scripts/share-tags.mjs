// Link previews (Open Graph and Twitter tags), added to index.html at build time.
//
// The site's address isn't fixed in the code: it comes from the build setting VITE_SITE_URL
// (docs/deploy.md). Without it the build still works, with previews that have no image, since a
// preview image must be an absolute address.

const TITLE = 'Inside the Quad';
const DESCRIPTION = 'Learn how an FPV drone works, part by part, with an interactive 3D model.';
const IMAGE = { path: '/og-image.png', width: 1200, height: 630 };
const IMAGE_ALT = 'Inside the Quad: a 5-inch FPV drone drawn as an engineering sheet.';

/** The site's origin from VITE_SITE_URL, without a trailing slash; null when unset. */
export function readSiteUrl(value) {
  const text = value?.trim() ?? '';
  if (text === '') return null;
  let url;
  try {
    url = new URL(text);
  } catch {
    url = null;
  }
  if (!url || !/^https?:$/.test(url.protocol) || url.pathname !== '/' || url.search || url.hash) {
    throw new Error(
      `VITE_SITE_URL must be the site's address, like https://insidethequad.com (got "${text}")`,
    );
  }
  return url.origin;
}

const meta = (key, value, content) => ({
  tag: 'meta',
  attrs: { [key]: value, content },
  injectTo: 'head',
});

/** The preview tags, as Vite head tags. `site` is the origin, or null when not known. */
export function shareTags(site) {
  const tags = [
    meta('property', 'og:type', 'website'),
    meta('property', 'og:site_name', TITLE),
    meta('property', 'og:title', TITLE),
    meta('property', 'og:description', DESCRIPTION),
    meta('name', 'twitter:card', site ? 'summary_large_image' : 'summary'),
  ];
  if (site) {
    tags.push(
      // One page serves every address, so the preview names the site itself.
      meta('property', 'og:url', `${site}/`),
      meta('property', 'og:image', `${site}${IMAGE.path}`),
      meta('property', 'og:image:width', String(IMAGE.width)),
      meta('property', 'og:image:height', String(IMAGE.height)),
      meta('property', 'og:image:alt', IMAGE_ALT),
    );
  }
  return tags;
}

/** The Vite plugin: adds the preview tags to index.html, reading VITE_SITE_URL from `env`. */
export function linkPreviews(env) {
  const site = readSiteUrl(env.VITE_SITE_URL);
  return {
    name: 'link-previews',
    transformIndexHtml() {
      return shareTags(site);
    },
  };
}
