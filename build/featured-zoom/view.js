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
/*!***********************************!*\
  !*** ./src/featured-zoom/view.js ***!
  \***********************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/interactivity */ "@wordpress/interactivity");

(0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.store)('featured-zoom', {
  actions: {
    zoomIn: () => {
      const context = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      if (context) {
        context.scale += 0.5;
      }
    },
    zoomOut: () => {
      const context = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      if (context.scale > 1) {
        context.scale -= 0.5;
        if (context.scale <= 1) {
          context.scale = 1;
          context.translateX = 0;
          context.translateY = 0;
        }
      }
    },
    startDrag: e => {
      const context = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();

      // Rimuoviamo il blocco scale <= 1 qui per permettere 
      // il cambio del cursore, ma limiteremo il movimento in drag()
      if (context.scale <= 1) return;
      e.preventDefault();
      context.isDragging = true;

      // Calcoliamo l'offset iniziale
      context.startX = e.clientX - context.translateX;
      context.startY = e.clientY - context.translateY;
    },
    stopDrag: () => {
      const context = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      if (context.isDragging) {
        context.isDragging = false;
      }
    },
    drag: e => {
      const context = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      if (!context.isDragging || context.scale <= 1) return;
      e.preventDefault();

      // Nuova posizione potenziale
      const nextX = e.clientX - context.startX;
      const nextY = e.clientY - context.startY;

      // Calcolo limiti
      const container = e.currentTarget;
      const rect = container.getBoundingClientRect();
      const maxW = (rect.width * context.scale - rect.width) / 2;
      const maxH = (rect.height * context.scale - rect.height) / 2;
      context.translateX = Math.max(-maxW, Math.min(maxW, nextX));
      context.translateY = Math.max(-maxH, Math.min(maxH, nextY));
    }
  },
  callbacks: {
    imageStyle: () => {
      const {
        scale,
        translateX,
        translateY,
        isDragging
      } = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      return {
        transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
        transition: isDragging ? 'none' : 'transform 0.2s ease-out'
      };
    },
    containerStyle: () => {
      const {
        scale,
        isDragging
      } = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      // Gestiamo il cursore sul contenitore perché l'immagine ha pointer-events: none
      if (scale > 1) {
        return {
          cursor: isDragging ? 'grabbing' : 'grab'
        };
      }
      return {
        cursor: 'default'
      };
    }
  }
});
})();


//# sourceMappingURL=view.js.map