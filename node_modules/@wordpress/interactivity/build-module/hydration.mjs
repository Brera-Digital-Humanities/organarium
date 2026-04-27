// packages/interactivity/src/hydration.ts
import { hydrate } from "preact";
import { toVdom, hydratedIslands } from "./vdom.mjs";
import { createRootFragment, splitTask } from "./utils.mjs";
var regionRootFragments = /* @__PURE__ */ new WeakMap();
var getRegionRootFragment = (regions) => {
  const region = Array.isArray(regions) ? regions[0] : regions;
  if (!region.parentElement) {
    throw Error("The passed region should be an element with a parent.");
  }
  if (!regionRootFragments.has(region)) {
    regionRootFragments.set(
      region,
      createRootFragment(region.parentElement, regions)
    );
  }
  return regionRootFragments.get(region);
};
var initialVdom = /* @__PURE__ */ new WeakMap();
var resolveInitialVdom;
var initialVdomPromise = new Promise((resolve) => {
  resolveInitialVdom = resolve;
});
var hydrateRegions = async () => {
  const nodes = document.querySelectorAll(`[data-wp-interactive]`);
  for (const node of nodes) {
    if (!hydratedIslands.has(node)) {
      await splitTask();
      const fragment = getRegionRootFragment(node);
      const vdom = toVdom(node);
      initialVdom.set(node, vdom);
      await splitTask();
      hydrate(vdom, fragment);
    }
  }
  resolveInitialVdom(initialVdom);
};
export {
  getRegionRootFragment,
  hydrateRegions,
  initialVdom,
  initialVdomPromise
};
//# sourceMappingURL=hydration.mjs.map
