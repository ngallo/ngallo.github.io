/**
 * highlight.js for the languages Chroma does not ship.
 *
 * Everything Chroma knows (json, yaml, go, bash, …) stays server-rendered:
 * running two highlighters over the same block would double-tag it and the two
 * colour schemes would drift apart. This module only claims the fences whose
 * render hook deliberately emits plain, untokenised code.
 *
 * The vendored core is language-free (20 KB); each language below is its own
 * upstream definition, so adding one is: vendor the file, import it, list it.
 */
import hljs from './vendor/highlight-core-11.11.1.min.js';
import cedar from './vendor/hljs-cedar-1.2.1.js';

/* Fence name → language definition. Must match the render hooks in
   layouts/_default/_markup/render-codeblock-<name>.html */
const LANGUAGES = {
  cedar: cedar,
};

Object.entries(LANGUAGES).forEach(function (entry) {
  hljs.registerLanguage(entry[0], entry[1]);
});

const SELECTOR = Object.keys(LANGUAGES)
  .map(function (name) {
    return 'pre code.language-' + name;
  })
  .join(', ');

function highlight() {
  document.querySelectorAll(SELECTOR).forEach(function (block) {
    hljs.highlightElement(block);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', highlight);
} else {
  highlight();
}
