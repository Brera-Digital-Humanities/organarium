/**
 * External dependencies
 */
import { type ContainerNode, type ComponentChild } from 'preact';
export declare const getRegionRootFragment: (regions: Element | Element[]) => ContainerNode;
export declare const initialVdom: WeakMap<Element, ComponentChild>;
export declare const initialVdomPromise: Promise<WeakMap<Element, ComponentChild>>;
export declare const hydrateRegions: () => Promise<void>;
//# sourceMappingURL=hydration.d.ts.map