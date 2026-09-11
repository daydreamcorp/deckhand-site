import { initHeader } from './ui/header.js';
import { initRefer, initReferCopy } from './ui/refer.js';
import { initInstall } from './ui/install.js';
initHeader(); initRefer(); initReferCopy(); initInstall();
import { renderDecks, handles } from './deck/render.js';
renderDecks();
window.__deckhand = { handles };
