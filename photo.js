// Real camera photograph, reused under CC BY 3.0. See PHOTO-CREDITS.md.
export const cityPhoto = Object.freeze({
  src: "assets/shinjuku-night-1280.jpg",
  srcset:
    "assets/shinjuku-night-1280.jpg 1280w, assets/shinjuku-night.jpg 3888w",
  title: "Shinjuku by Night",
  author: "Fboas",
  source: "https://commons.wikimedia.org/wiki/File:Shinjuku_by_Night.jpg",
  license: "https://creativecommons.org/licenses/by/3.0/",
});
export function photoCredit(className = "photo-credit") {
  return `<span class="${className}">REAL PHOTOGRAPH / <a href="${cityPhoto.source}" target="_blank" rel="noopener noreferrer">${cityPhoto.title} — ${cityPhoto.author}</a> / <a href="${cityPhoto.license}" target="_blank" rel="noopener noreferrer">CC BY 3.0</a><small>Display crop, dark overlay &amp; animated slices.</small></span>`;
}
