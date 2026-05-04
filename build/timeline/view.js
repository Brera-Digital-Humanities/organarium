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
        sortAsc
      } = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      return posts.filter(post => {
        const matchCat = filters.categoria === 'all' || post.categoria === filters.categoria;
        const matchMat = filters.materiali === '' || post.materiale.includes(filters.materiali);
        const matchTec = filters.tecniche === '' || post.tecnica.includes(filters.tecniche);
        return matchCat && matchMat && matchTec;
      }).sort((a, b) => sortAsc ? (a.sort_key ?? 0) - (b.sort_key ?? 0) : (b.sort_key ?? 0) - (a.sort_key ?? 0));
    },
    get visibleCount() {
      return (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.store)('timeline-3d').state.visiblePosts.length;
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
        filters
      } = ctx;
      if (!filterGroup) return true;
      const filtered = posts.filter(post => {
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
      return !(0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.store)('timeline-3d').state.isValueAvailable;
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
    // Posizione % proporzionale alla data reale (contesto locale: postIndex)
    get markerLeft() {
      const ctx = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      const visible = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.store)('timeline-3d').state.visiblePosts;
      if (visible.length <= 1) return '50%';
      const post = ctx.posts?.[ctx.postIndex];
      if (!post) return '0%';
      const keys = visible.map(p => p.sort_key ?? 0);
      const min = Math.min(...keys);
      const max = Math.max(...keys);
      if (min === max) return '50%';
      return (((post.sort_key ?? 0) - min) / (max - min) * 100).toFixed(2) + '%';
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
      if (visible.length <= 1) return '50%';
      const active = visible[ctx.activeIndex];
      if (!active) return '0%';
      const keys = visible.map(p => p.sort_key ?? 0);
      const min = Math.min(...keys);
      const max = Math.max(...keys);
      if (min === max) return '50%';
      return (((active.sort_key ?? 0) - min) / (max - min) * 100).toFixed(2) + '%';
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
      document.addEventListener('keydown', e => {
        const {
          actions
        } = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.store)('timeline-3d');
        if (e.key === 'ArrowRight') actions.next();
        if (e.key === 'ArrowLeft') actions.prev();
      });
    }
  }
});
})();


//# sourceMappingURL=view.js.map