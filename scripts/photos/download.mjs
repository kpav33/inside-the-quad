/**
 * Whether a cached file can be used: only the full-size original, so a crop (given in the
 * original's pixels) always comes out at the same size, whatever ran before.
 */
export function cachedOriginalIsUsable(cachedWidth, originalWidth) {
  return cachedWidth !== undefined && cachedWidth === originalWidth;
}

/** The title an author supplied on Commons, as people read it: no "File:" and no extension. */
export function displayTitle(title) {
  return title.replace(/^File:/, '').replace(/\.[a-z0-9]+$/i, '');
}
