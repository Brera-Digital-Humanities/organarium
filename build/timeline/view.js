import * as __WEBPACK_EXTERNAL_MODULE__wordpress_interactivity_8e89b257__ from "@wordpress/interactivity";
/******/ var __webpack_modules__ = ({

/***/ "@wordpress/interactivity"
/*!*******************************************!*\
  !*** external "@wordpress/interactivity" ***!
  \*******************************************/
(module) {

module.exports = __WEBPACK_EXTERNAL_MODULE__wordpress_interactivity_8e89b257__;

/***/ }

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __webpack_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	if (!(moduleId in __webpack_modules__)) {
/******/ 		delete __webpack_module_cache__[moduleId];
/******/ 		var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 		e.code = 'MODULE_NOT_FOUND';
/******/ 		throw e;
/******/ 	}
/******/ 	__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/make namespace object */
/******/ (() => {
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ })();
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!******************************!*\
  !*** ./src/timeline/view.js ***!
  \******************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/interactivity */ "@wordpress/interactivity");

function _scrubberJump(event, ctx, visiblePosts) {
  const trackEl = event.currentTarget.querySelector('.scrubber-track');
  if (!trackEl) return;
  const rect = trackEl.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  const keys = visiblePosts.map(p => p.sort_key ?? 0);
  if (keys.length === 0) return;
  const min = Math.min(...keys);
  const max = Math.max(...keys);
  let idx = 0;
  if (min !== max) {
    const target = min + pct * (max - min);
    idx = keys.reduce((best, key, i) => Math.abs(key - target) < Math.abs(keys[best] - target) ? i : best, 0);
  }
  ctx.activeIndex = idx;
}
(0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.store)('timeline-3d', {
  state: {
    // ── Posts filtrati + ordinati per sort_key numerico ───────────────────
    get visiblePosts() {
      const {
        posts,
        filters,
        sortAsc,
        activeCenturyMin,
        activeCenturyMax
      } = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      return posts.filter(post => {
        const sk = post.sort_key ?? 0;
        const inCentury = sk >= activeCenturyMin && sk < activeCenturyMax;
        const matchCat = filters.categoria === 'all' || post.categoria === filters.categoria;
        const matchMat = filters.materiali === '' || post.materiale.includes(filters.materiali);
        const matchTec = filters.tecniche === '' || post.tecnica.includes(filters.tecniche);
        return inCentury && matchCat && matchMat && matchTec;
      }).sort((a, b) => sortAsc ? (a.sort_key ?? 0) - (b.sort_key ?? 0) : (b.sort_key ?? 0) - (a.sort_key ?? 0));
    },
    get visibleCount() {
      return (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.store)('timeline-3d').state.visiblePosts.length;
    },
    get showScrubber() {
      return (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.store)('timeline-3d').state.visiblePosts.length >= 3;
    },
    get counterCurrent() {
      return (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)().activeIndex + 1;
    },
    // ── Filtri ────────────────────────────────────────────────────────────
    get hasActiveFilters() {
      const {
        filters
      } = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      return filters.categoria !== 'all' || filters.materiali !== '' || filters.tecniche !== '';
    },
    get filtersOpen() {
      return (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)().filtersOpen;
    },
    get filterToggleLabel() {
      return (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)().filtersOpen ? 'Filtra ↑' : 'Filtra ↓';
    },
    // ── Stato di una singola pill (contesto locale: filterGroup + filterVal) ──
    get isPillActive() {
      const ctx = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      const {
        filterGroup,
        filterVal,
        filters
      } = ctx;
      if (!filterGroup) return false;
      if (filterGroup === 'categoria') return filters.categoria === filterVal;
      if (filterGroup === 'materiali') return filters.materiali === filterVal;
      if (filterGroup === 'tecniche') return filters.tecniche === filterVal;
      return false;
    },
    // ── Disponibilità condizionale di una pill ────────────────────────────
    // Calcola se filterVal esiste in almeno un post filtrato dagli ALTRI gruppi
    get isValueAvailable() {
      const ctx = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      const {
        filterGroup,
        filterVal,
        posts,
        filters,
        activeCenturyMin,
        activeCenturyMax
      } = ctx;
      if (!filterGroup) return true;
      const filtered = posts.filter(post => {
        const sk = post.sort_key ?? 0;
        if (sk < activeCenturyMin || sk >= activeCenturyMax) return false;
        const matchCat = filterGroup === 'categoria' ? true : filters.categoria === 'all' || post.categoria === filters.categoria;
        const matchMat = filterGroup === 'materiali' ? true : filters.materiali === '' || post.materiale.includes(filters.materiali);
        const matchTec = filterGroup === 'tecniche' ? true : filters.tecniche === '' || post.tecnica.includes(filters.tecniche);
        return matchCat && matchMat && matchTec;
      });
      if (filterGroup === 'categoria') return filtered.some(p => p.categoria === filterVal);
      if (filterGroup === 'materiali') return filtered.some(p => p.materiale.includes(filterVal));
      if (filterGroup === 'tecniche') return filtered.some(p => p.tecnica.includes(filterVal));
      return true;
    },
    get isPillDisabled() {
      const {
        state
      } = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.store)('timeline-3d');
      // "Disabled" = esiste nel secolo ma escluso dagli altri filtri attivi.
      // Se non esiste affatto nel secolo va invece in stato "invisible".
      return !state.isValueAvailable && !state.isPillInvisible;
    },
    // ── Pill invisibile: il valore non compare in alcun post del secolo attivo ─
    get isPillInvisible() {
      const ctx = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      const {
        filterGroup,
        filterVal,
        posts,
        activeCenturyMin,
        activeCenturyMax
      } = ctx;
      if (!filterGroup) return false;
      const inCentury = posts.filter(post => {
        const sk = post.sort_key ?? 0;
        return sk >= activeCenturyMin && sk < activeCenturyMax;
      });
      if (filterGroup === 'categoria') return !inCentury.some(p => p.categoria === filterVal);
      if (filterGroup === 'materiali') return !inCentury.some(p => p.materiale.includes(filterVal));
      if (filterGroup === 'tecniche') return !inCentury.some(p => p.tecnica.includes(filterVal));
      return false;
    },
    // Per il binding HTML `disabled`: bottone non cliccabile in entrambi gli stati
    get isPillUnavailable() {
      return !(0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.store)('timeline-3d').state.isValueAvailable;
    },
    // ── Century bar ───────────────────────────────────────────────────────
    // Contesto locale del segmento: segMin / segMax
    get isCenturyActive() {
      const ctx = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      return ctx.activeCenturyMin === ctx.segMin;
    },
    // Contesto locale del dot: postIndex
    get isDotActive() {
      const ctx = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      const {
        state
      } = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.store)('timeline-3d');
      const activePost = state.visiblePosts[ctx.activeIndex];
      const dotPost = ctx.posts?.[ctx.postIndex];
      return !!(dotPost && activePost && dotPost.id === activePost.id);
    },
    // ── Filtri attivi (per le etichette sotto il divider) ─────────────────
    get hasCategoriaFilter() {
      return (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)().filters.categoria !== 'all';
    },
    get hasMaterialiFilter() {
      return (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)().filters.materiali !== '';
    },
    get hasTecnicheFilter() {
      return (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)().filters.tecniche !== '';
    },
    get activeCategoriaLabel() {
      const {
        filters,
        catOptions
      } = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      return catOptions?.find(o => o.value === filters.categoria)?.label ?? filters.categoria;
    },
    get activeMaterialiLabel() {
      const {
        filters,
        matOptions
      } = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      return matOptions?.find(o => o.value === filters.materiali)?.label ?? filters.materiali;
    },
    get activeTecnicheLabel() {
      const {
        filters,
        tecOptions
      } = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      return tecOptions?.find(o => o.value === filters.tecniche)?.label ?? filters.tecniche;
    },
    get activeCenturyLabel() {
      const {
        activeCenturyMin,
        activeCenturyMax
      } = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      const from = activeCenturyMin < 0 ? `${-activeCenturyMin} a.C.` : `${activeCenturyMin}`;
      return `${from}–${activeCenturyMax}`;
    },
    // ── Vista ─────────────────────────────────────────────────────────────
    get isViewTimeline() {
      return (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)().viewMode === 'timeline';
    },
    get isViewGrid() {
      return (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)().viewMode === 'grid';
    },
    // ── Ordinamento ───────────────────────────────────────────────────────
    get sortLabel() {
      return (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)().sortAsc ? 'Ordina ↑↓' : 'Ordina ↓↑';
    },
    // Posizione CSS order nella griglia (contesto locale: postIndex)
    get gridOrder() {
      const ctx = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      const visible = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.store)('timeline-3d').state.visiblePosts;
      const post = ctx.posts?.[ctx.postIndex];
      if (!post) return 9999;
      const idx = visible.indexOf(post);
      return idx === -1 ? 9999 : idx + 1;
    },
    // ── Navigazione carousel ──────────────────────────────────────────────
    get isFirst() {
      return (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)().activeIndex === 0;
    },
    get isLast() {
      const {
        state
      } = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.store)('timeline-3d');
      return (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)().activeIndex >= state.visibleCount - 1;
    },
    // ── Posizione della card nel carousel (contesto locale: postIndex) ────
    get cardOffset() {
      const ctx = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      const {
        state
      } = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.store)('timeline-3d');
      const visible = state.visiblePosts;
      const cardPost = ctx.posts?.[ctx.postIndex];
      if (!cardPost) return null;
      const visibleIdx = visible.indexOf(cardPost);
      if (visibleIdx === -1) return null;
      const activePost = visible[ctx.activeIndex];
      if (!activePost) return null;
      return visibleIdx - visible.indexOf(activePost);
    },
    get isVisible() {
      return (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.store)('timeline-3d').state.cardOffset !== null;
    },
    get isActive() {
      return (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.store)('timeline-3d').state.cardOffset === 0;
    },
    get isPrev() {
      return (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.store)('timeline-3d').state.cardOffset === -1;
    },
    get isNext() {
      return (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.store)('timeline-3d').state.cardOffset === 1;
    },
    get isPrev2() {
      return (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.store)('timeline-3d').state.cardOffset === -2;
    },
    get isNext2() {
      return (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.store)('timeline-3d').state.cardOffset === 2;
    },
    get zIndex() {
      const offset = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.store)('timeline-3d').state.cardOffset;
      if (offset === null) return 0;
      return Math.max(0, 20 - Math.abs(offset) * 2);
    },
    // ── Scrubber ──────────────────────────────────────────────────────────
    // Posizione % proporzionale all'anno all'interno del secolo attivo
    get markerLeft() {
      const ctx = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      const post = ctx.posts?.[ctx.postIndex];
      if (!post) return '0%';
      const min = ctx.activeCenturyMin;
      const max = ctx.activeCenturyMax;
      if (max === min) return '50%';
      const sk = post.sort_key ?? 0;
      const pct = (sk - min) / (max - min) * 100;
      return Math.max(0, Math.min(100, pct)).toFixed(2) + '%';
    },
    // Etichetta sopra il marker — solo la data (contesto locale: postIndex)
    get markerLabel() {
      const ctx = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      const post = ctx.posts?.[ctx.postIndex];
      return post?.data ?? '';
    },
    // Posizione % del cursore (contesto radice: activeIndex)
    get scrubberThumbLeft() {
      const ctx = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      const visible = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.store)('timeline-3d').state.visiblePosts;
      if (!visible.length) return '0%';
      const active = visible[ctx.activeIndex];
      if (!active) return '0%';
      const min = ctx.activeCenturyMin;
      const max = ctx.activeCenturyMax;
      if (max === min) return '50%';
      const sk = active.sort_key ?? 0;
      const pct = (sk - min) / (max - min) * 100;
      return Math.max(0, Math.min(100, pct)).toFixed(2) + '%';
    }
  },
  actions: {
    toggleFilters() {
      const ctx = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      ctx.filtersOpen = !ctx.filtersOpen;
    },
    clearFilters() {
      const ctx = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      ctx.filters.categoria = 'all';
      ctx.filters.materiali = '';
      ctx.filters.tecniche = '';
      ctx.activeIndex = 0;
    },
    // Un'unica action per tutte le pill — toggle singolo per gruppo
    togglePill() {
      const ctx = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      const {
        filterGroup,
        filterVal,
        filters
      } = ctx;
      if (filterGroup === 'categoria') {
        ctx.filters.categoria = filters.categoria === filterVal ? 'all' : filterVal;
      } else if (filterGroup === 'materiali') {
        ctx.filters.materiali = filters.materiali === filterVal ? '' : filterVal;
      } else if (filterGroup === 'tecniche') {
        ctx.filters.tecniche = filters.tecniche === filterVal ? '' : filterVal;
      }
      ctx.activeIndex = 0;
    },
    clearCategoria() {
      const ctx = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      ctx.filters.categoria = 'all';
      ctx.activeIndex = 0;
    },
    clearMateriali() {
      const ctx = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      ctx.filters.materiali = '';
      ctx.activeIndex = 0;
    },
    clearTecniche() {
      const ctx = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      ctx.filters.tecniche = '';
      ctx.activeIndex = 0;
    },
    setCentury() {
      const ctx = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      ctx.activeCenturyMin = ctx.segMin;
      ctx.activeCenturyMax = ctx.segMax;
      ctx.filters.categoria = 'all';
      ctx.filters.materiali = '';
      ctx.filters.tecniche = '';
      ctx.activeIndex = 0;
      ctx.filtersOpen = false;
    },
    setViewTimeline() {
      (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)().viewMode = 'timeline';
    },
    setViewGrid() {
      (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)().viewMode = 'grid';
    },
    toggleSort() {
      const ctx = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();

      // FLIP: registra posizioni attuali se siamo nella griglia
      let snapshots = null;
      if (ctx.viewMode === 'grid') {
        const cards = [...document.querySelectorAll('.grid-card:not(.is-hidden)')];
        snapshots = cards.map(el => ({
          el,
          first: el.getBoundingClientRect()
        }));
      }
      ctx.sortAsc = !ctx.sortAsc;
      ctx.activeIndex = 0;
      if (snapshots) {
        requestAnimationFrame(() => {
          // L: posizioni dopo il riordino (CSS order aggiornato)
          snapshots.forEach(({
            el,
            first
          }) => {
            const last = el.getBoundingClientRect();
            const dx = first.left - last.left;
            const dy = first.top - last.top;
            el.style.transition = 'none';
            el.style.transform = dx || dy ? `translate(${dx}px,${dy}px)` : '';
          });
          // Forza layout per fissare i transform prima del prossimo frame
          snapshots[0]?.el.getBoundingClientRect();
          requestAnimationFrame(() => {
            snapshots.forEach(({
              el
            }) => {
              el.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1)';
              el.style.transform = '';
            });
            setTimeout(() => snapshots.forEach(({
              el
            }) => {
              el.style.transition = '';
            }), 550);
          });
        });
      }
    },
    // Naviga allo specifico post cliccato sul marker (contesto locale: postIndex)
    goToMarker() {
      const ctx = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      const visible = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.store)('timeline-3d').state.visiblePosts;
      const post = ctx.posts?.[ctx.postIndex];
      if (!post) return;
      const idx = visible.indexOf(post);
      if (idx !== -1) ctx.activeIndex = idx;
    },
    // Drag scrubber — pointerdown: avvia cattura e salta
    scrubberPointerDown(event) {
      if (event.target.closest('.scrubber-marker')) {
        event.currentTarget.setPointerCapture(event.pointerId);
        return;
      }
      event.currentTarget.setPointerCapture(event.pointerId);
      const ctx = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      _scrubberJump(event, ctx, (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.store)('timeline-3d').state.visiblePosts);
    },
    // Drag scrubber — pointermove: aggiorna posizione durante il trascinamento
    scrubberPointerMove(event) {
      if (!event.buttons) return;
      const ctx = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      _scrubberJump(event, ctx, (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.store)('timeline-3d').state.visiblePosts);
    },
    next() {
      const ctx = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      const {
        state
      } = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.store)('timeline-3d');
      if (ctx.activeIndex < state.visibleCount - 1) ctx.activeIndex++;
    },
    prev() {
      const ctx = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      if (ctx.activeIndex > 0) ctx.activeIndex--;
    }
  },
  callbacks: {
    init() {
      const ctx = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();

      // Replica della logica di state.visiblePosts senza chiamare getContext():
      // accedere ai computed dello store da listener DOM plain rivaluta il getter
      // e fallisce perché lo stack del contesto Interactivity è vuoto.
      const visiblePosts = () => {
        if (!ctx.posts) return [];
        return ctx.posts.filter(p => {
          const sk = p.sort_key ?? 0;
          if (sk < ctx.activeCenturyMin || sk >= ctx.activeCenturyMax) return false;
          if (ctx.filters.categoria !== 'all' && p.categoria !== ctx.filters.categoria) return false;
          if (ctx.filters.materiali !== '' && !p.materiale.includes(ctx.filters.materiali)) return false;
          if (ctx.filters.tecniche !== '' && !p.tecnica.includes(ctx.filters.tecniche)) return false;
          return true;
        }).sort((a, b) => ctx.sortAsc ? (a.sort_key ?? 0) - (b.sort_key ?? 0) : (b.sort_key ?? 0) - (a.sort_key ?? 0));
      };
      const goNext = () => {
        const vp = visiblePosts();
        if (ctx.activeIndex < vp.length - 1) ctx.activeIndex++;
      };
      const goPrev = () => {
        if (ctx.activeIndex > 0) ctx.activeIndex--;
      };

      // Tastiera
      document.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') goNext();
        if (e.key === 'ArrowLeft') goPrev();
      });

      // Rotella del mouse → next / prev
      document.querySelector('.timeline-view')?.addEventListener('wheel', e => {
        e.preventDefault();
        if (e.deltaY > 0) goNext();else goPrev();
      }, {
        passive: false
      });

      // Swipe touch sulla viewport (mobile) → next / prev.
      // Il CSS imposta touch-action: pan-y sulla viewport, così lo scroll
      // verticale della pagina resta nativo e l'asse orizzontale è nostro.
      // Soglia 50px e direzione prevalentemente orizzontale per non
      // interpretare come swipe i tap o i piccoli movimenti.
      const viewport = document.querySelector('.timeline-viewport');
      if (viewport) {
        let startX = 0,
          startY = 0,
          swiped = false;
        viewport.addEventListener('touchstart', e => {
          if (e.touches.length !== 1) return;
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
          swiped = false;
        }, {
          passive: true
        });
        viewport.addEventListener('touchmove', e => {
          if (swiped || e.touches.length !== 1) return;
          const dx = e.touches[0].clientX - startX;
          const dy = e.touches[0].clientY - startY;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
            swiped = true;
            if (dx < 0) goNext();else goPrev();
          }
        }, {
          passive: true
        });
        // Sopprimi il click sintetico generato dal touchend dopo uno swipe,
        // altrimenti il listener click sopra riporterebbe in primo piano la
        // card sotto il dito.
        viewport.addEventListener('click', e => {
          if (swiped) {
            e.stopPropagation();
            e.preventDefault();
            swiped = false;
          }
        }, true);
      }

      // Click su card non-attiva → portarla in primo piano.
      // Il click bolla fino a .cards-container (le card non lo catturano per via del
      // contesto 3D), quindi trovo la card sotto il punto via bounding rect.
      document.querySelector('.timeline-viewport')?.addEventListener('click', e => {
        let card = e.target.closest('.timeline-card');
        if (!card) {
          const hits = Array.from(document.querySelectorAll('.timeline-card:not(.is-hidden)')).filter(c => !c.classList.contains('is-active')).filter(c => {
            const r = c.getBoundingClientRect();
            return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
          }).sort((a, b) => parseInt(b.style.zIndex || '0', 10) - parseInt(a.style.zIndex || '0', 10));
          card = hits[0];
        }
        if (!card || card.classList.contains('is-active')) return;
        e.preventDefault();
        const postId = parseInt(card.dataset.postId, 10);
        if (!postId) return;
        const idx = visiblePosts().findIndex(p => p.id === postId);
        if (idx !== -1) ctx.activeIndex = idx;
      });
    },
    // Lazy-load delle thumbnail: i post fuori dal secolo attivo hanno
    // <img data-src="..."> senza src, quindi non vengono richieste al
    // browser. Quando cambia il secolo (o filtri) le card non più
    // nascoste si caricano qui, con spinner sul wrapper finché arriva
    // il bitmap. Le card già caricate non hanno più data-src e vengono
    // ignorate al successivo passaggio.
    lazyLoadImages() {
      const ctx = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      // Tracking esplicito delle dipendenze reattive: il watch deve
      // rifirare al cambio di secolo o filtri.
      void ctx.activeCenturyMin;
      void ctx.activeCenturyMax;
      void ctx.filters.categoria;
      void ctx.filters.materiali;
      void ctx.filters.tecniche;
      requestAnimationFrame(() => {
        const imgs = document.querySelectorAll('.timeline-card:not(.is-hidden) .card-thumb img[data-src],' + '.grid-card:not(.is-hidden) .gc-img img[data-src]');
        imgs.forEach(img => {
          const src = img.dataset.src;
          if (!src) return;
          const wrapper = img.parentElement;
          wrapper?.classList.add('is-loading');
          // data-src rimosso solo a load completato: finché c'è
          // il CSS tiene opacity:0, evitando di mostrare il testo
          // alternativo / icona broken-image accanto allo spinner.
          // Al rilascio dell'attributo l'opacity torna a 1 con
          // la transizione → fade-in dell'immagine.
          const done = () => {
            wrapper?.classList.remove('is-loading');
            img.removeAttribute('data-src');
          };
          img.addEventListener('load', done, {
            once: true
          });
          img.addEventListener('error', done, {
            once: true
          });
          img.src = src;
        });
      });
    },
    savePrefs() {
      const ctx = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      const prefs = JSON.stringify({
        centuryMin: ctx.activeCenturyMin,
        centuryMax: ctx.activeCenturyMax,
        viewMode: ctx.viewMode,
        sortAsc: ctx.sortAsc,
        activeIndex: ctx.activeIndex,
        categoria: ctx.filters.categoria,
        materiali: ctx.filters.materiali,
        tecniche: ctx.filters.tecniche
      });
      document.cookie = 'tl_prefs=' + encodeURIComponent(prefs) + '; path=/; SameSite=Lax';
    }
  }
});
})();


//# sourceMappingURL=view.js.map