import { mount, installRefreshPolicy, ScrollTrigger } from './engine/scroll.js';
import { installAnchors, landOnHash } from './engine/anchors.js';
import { renderDecks, handles } from './deck/render.js';
import { initHeader, initProgress, initCurrentNav } from './ui/header.js';
import { initRefer, initReferCopy } from './ui/refer.js';
import { initInstall } from './ui/install.js';
import './chapters/hero.js'; import './chapters/how.js'; import './chapters/controls.js';
import './chapters/beyond.js'; import './chapters/scenes.js'; import './chapters/testers.js'; import './chapters/pricing.js';

initHeader(); initProgress(); initCurrentNav(); initRefer(); initReferCopy(); initInstall();
renderDecks();                    // 1. synchronous DOM: every deck layer has its tiles before anything is measured
window.__deckhand = { handles };  // verification hook only
mount();                          // 2. contexts + triggers (each trigger refreshes itself on creation)
installAnchors();                 // 3. click / hashchange handling (B §2)
landOnHash({ instant: true });    // 4. first landing on the already-correct layout (before fonts)
installRefreshPolicy();           // 5. observers

const fontsReady = Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]);
const loaded = new Promise((r) => (document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true })));
Promise.all([fontsReady, loaded]).then(() => {
  ScrollTrigger.refresh();        // 6. synchronous full refresh: fonts swapped, images decoded, decks rendered
  landOnHash({ instant: true });  // 7. re-land (a hash present on load from the Android app)
});
