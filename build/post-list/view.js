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
/*!*******************************!*\
  !*** ./src/post-list/view.js ***!
  \*******************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/interactivity */ "@wordpress/interactivity");

(0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.store)('post-list', {
  state: {
    // ── Post filtrati per i tre gruppi ACF ────────────────────────────────
    get filteredPosts() {
      const {
        posts,
        filters
      } = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      return posts.filter(post => {
        const matchCat = filters.categoria === 'all' || post.categoria === filters.categoria;
        const matchMat = filters.materiali === '' || post.materiale.includes(filters.materiali);
        const matchTec = filters.tecniche === '' || post.tecnica.includes(filters.tecniche);
        return matchCat && matchMat && matchTec;
      });
    },
    get filteredCount() {
      return (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.store)('post-list').state.filteredPosts.length;
    },
    // ── Infinite scroll ───────────────────────────────────────────────────
    get hasMore() {
      return (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.store)('post-list').state.filteredPosts.length > (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)().visibleCount;
    },
    get showEndMessage() {
      const {
        state
      } = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.store)('post-list');
      return !state.hasMore && state.filteredCount > 0;
    },
    get showEmptyMessage() {
      return (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.store)('post-list').state.filteredCount === 0;
    },
    // ── Visibilità singola card (contesto locale: postIndex) ───────────────
    get isVisible() {
      const ctx = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      const {
        state
      } = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.store)('post-list');
      const post = ctx.posts?.[ctx.postIndex];
      if (!post) return false;
      const filtered = state.filteredPosts;
      const idx = filtered.indexOf(post);
      return idx !== -1 && idx < ctx.visibleCount;
    },
    // ── Filtri ────────────────────────────────────────────────────────────
    get filtersOpen() {
      return (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)().filtersOpen;
    },
    get filterToggleLabel() {
      return (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)().filtersOpen ? 'Filtra ↑' : 'Filtra ↓';
    },
    get hasActiveFilters() {
      const {
        filters
      } = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      return filters.categoria !== 'all' || filters.materiali !== '' || filters.tecniche !== '';
    },
    // ── Stato pill (contesto locale: filterGroup + filterVal) ─────────────
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
    // Pill disponibile se filterVal esiste in almeno un post filtrato dagli altri gruppi
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
      return !(0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.store)('post-list').state.isValueAvailable;
    },
    // ── Etichette filtri attivi ───────────────────────────────────────────
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
    }
  },
  actions: {
    toggleFilters() {
      (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)().filtersOpen = !(0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)().filtersOpen;
    },
    clearFilters() {
      const ctx = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      ctx.filters.categoria = 'all';
      ctx.filters.materiali = '';
      ctx.filters.tecniche = '';
      ctx.visibleCount = 10;
    },
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
      ctx.visibleCount = 10;
    },
    clearCategoria() {
      const ctx = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      ctx.filters.categoria = 'all';
      ctx.visibleCount = 10;
    },
    clearMateriali() {
      const ctx = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      ctx.filters.materiali = '';
      ctx.visibleCount = 10;
    },
    clearTecniche() {
      const ctx = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      ctx.filters.tecniche = '';
      ctx.visibleCount = 10;
    }
  },
  callbacks: {
    init() {
      // Cattura il contesto reattivo durante l'esecuzione della direttiva.
      // Le proprietà di ctx sono Preact signals: leggibili e scrivibili
      // ovunque, anche dentro callback asincroni come IntersectionObserver.
      const ctx = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      const root = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getElement)().ref;
      const sentinel = root.querySelector('.pl-sentinel');
      if (!sentinel) return;
      const observer = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        // Ricalcola il conteggio filtrato direttamente da ctx
        // evitando getContext() che non è disponibile qui.
        const {
          posts,
          filters,
          visibleCount
        } = ctx;
        const n = posts.filter(post => {
          const matchCat = filters.categoria === 'all' || post.categoria === filters.categoria;
          const matchMat = filters.materiali === '' || post.materiale.includes(filters.materiali);
          const matchTec = filters.tecniche === '' || post.tecnica.includes(filters.tecniche);
          return matchCat && matchMat && matchTec;
        }).length;
        if (n > ctx.visibleCount) {
          ctx.visibleCount += 10;
        }
      }, {
        rootMargin: '300px'
      });
      observer.observe(sentinel);
    }
  }
});
})();


//# sourceMappingURL=view.js.map