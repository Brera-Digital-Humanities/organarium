import { effect } from '@preact/signals';
export { store, getConfig, getServerState, type AsyncAction, type TypeYield, } from './store';
export { getContext, getServerContext, getElement } from './scopes';
export { withScope, useWatch, useInit, useEffect, useLayoutEffect, useCallback, useMemo, splitTask, withSyncEvent, } from './utils';
export { useState, useRef } from 'preact/hooks';
/**
 * Subscribes to changes in any signal accessed inside the callback, re-running
 * the callback whenever those signals change. Returns a cleanup function to
 * stop watching.
 *
 * @example
 * ```js
 * const unwatch = watch( () => {
 *   console.log( state.counter );
 * } );
 *
 * // Later, to stop watching:
 * unwatch();
 * ```
 */
export declare const watch: typeof effect;
export declare const privateApis: (lock: "I acknowledge that using private APIs means my theme or plugin will inevitably break in the next version of WordPress.") => any;
//# sourceMappingURL=index.d.ts.map