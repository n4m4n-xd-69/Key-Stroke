/**
 * Must be imported *before* `prismjs` itself. Prism reads `window.Prism.manual`
 * during initialisation; without this it would try to auto-highlight the whole
 * document on load, which fights with React's rendering.
 */
if (typeof window !== 'undefined') {
  window.Prism = window.Prism || {};
  window.Prism.manual = true;
}
