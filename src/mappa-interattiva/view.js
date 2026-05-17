import { store, getContext, getElement } from '@wordpress/interactivity';
import L from 'leaflet';
import 'leaflet.markercluster';
import {
    isValueAvailable as pureIsValueAvailable,
    clusterIconSize,
    groupPostsByCoord,
    buildMarkerFilters,
    markerMatchesFilters,
    filterPostsForPanel,
    makeCard,
} from './logic';

delete L.Icon.Default.prototype._getIconUrl;

const CARTO_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';

const STYLES = {
    natural: {
        tileUrl: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        filter: 'sepia(25%) saturate(0.9) brightness(1.02) hue-rotate(5deg)',
    },
    warm: {
        tileUrl: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        filter: 'sepia(45%) saturate(1.1) brightness(0.98) hue-rotate(-5deg)',
    },
    teal: {
        tileUrl: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        filter: 'sepia(10%) saturate(0.8) brightness(1.03) hue-rotate(140deg)',
    },
    dark: {
        tileUrl: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        filter: 'sepia(35%) saturate(0.7) brightness(0.85) hue-rotate(5deg)',
    },
};

function pinInner(count, fill) {
    return count > 1
        ? `<text x="14" y="14" text-anchor="middle" dominant-baseline="central" fill="${fill}" font-size="12" font-weight="700" font-family="sans-serif">${count}</text>`
        : `<circle cx="14" cy="14" r="6" fill="${fill}"/>`;
}

function pinSize(count) {
    return count > 1 ? 28 : 26;
}

function makeIcon(count = 1) {
    const s = pinSize(count);
    const half = s / 2;
    const svg = `<svg width="${s}" height="${s}" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14" r="13" fill="#6B2A0B" stroke="#DAC898" stroke-width="2"/>${pinInner(count, '#DAC898')}</svg>`;
    return L.divIcon({ html: svg, className: 'map-pin-icon', iconSize: [s, s], iconAnchor: [half, half] });
}

function makeIconSelected(count = 1) {
    const s = pinSize(count);
    const half = s / 2;
    const svg = `<svg width="${s}" height="${s}" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14" r="13" fill="#DAC898" stroke="#6B2A0B" stroke-width="2"/>${pinInner(count, '#6b2a0b')}</svg>`;
    return L.divIcon({ html: svg, className: 'map-pin-icon map-pin-icon--selected', iconSize: [s, s], iconAnchor: [half, half] });
}

function makeClusterIcon(count) {
    const s = clusterIconSize(count);
    const half = s / 2;
    const svg = `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg"><circle cx="${half}" cy="${half}" r="${half - 2}" fill="#6B2A0B" stroke="#DAC898" stroke-width="2"/><text x="${half}" y="${half}" text-anchor="middle" dominant-baseline="central" fill="#DAC898" font-size="${s < 36 ? 12 : 14}" font-weight="700" font-family="sans-serif">${count}</text></svg>`;
    return L.divIcon({ html: svg, className: 'map-cluster-icon', iconSize: [s, s], iconAnchor: [half, half] });
}

// Refs non-reattivi: evita che la selezione marker ritrigghi updateMarkers (zoom-out indesiderato)
const ctxRefs = new WeakMap();
function getRefs(ctx) {
    let r = ctxRefs.get(ctx);
    if (!r) { r = { firstRender: true }; ctxRefs.set(ctx, r); }
    return r;
}

// Riquadro Europa usato come viewport iniziale su mobile (evita zoom-out estremi su set di pin intercontinentali)
const EUROPE_BOUNDS = [[35, -10], [70, 40]];
const isMobile = () => window.matchMedia('(max-width: 767px)').matches;

store('mappa-interattiva', {
    state: {

        // Filtri
        get hasActiveFilters() {
            const { filters } = getContext();
            return filters.categoria !== 'all' || filters.materiali !== '' || filters.tecniche !== '' || filters.periodo !== '';
        },

        get filtersOpen() {
            return getContext().filtersOpen;
        },

        get filterToggleLabel() {
            return getContext().filtersOpen ? 'Filtra ↑' : 'Filtra ↓';
        },

        // Stato singola pill (ctx locale: filterGroup + filterVal)
        get isPillActive() {
            const ctx = getContext();
            const { filterGroup, filterVal, filters } = ctx;
            if (!filterGroup) return false;
            if (filterGroup === 'categoria') return filters.categoria === filterVal;
            if (filterGroup === 'materiali') return filters.materiali === filterVal;
            if (filterGroup === 'tecniche') return filters.tecniche === filterVal;
            if (filterGroup === 'periodo') return filters.periodo === filterVal;
            return false;
        },

        // Disponibilità condizionale pill
        get isValueAvailable() {
            const { posts, filters, filterGroup, filterVal } = getContext();
            return pureIsValueAvailable( posts, { filterGroup, filterVal, filters } );
        },

        get isPillDisabled() {
            return !store('mappa-interattiva').state.isValueAvailable;
        },

        // Filtri attivi (label sotto divider)
        get hasCategoriaFilter() {
            return getContext().filters.categoria !== 'all';
        },

        get hasMaterialiFilter() {
            return getContext().filters.materiali !== '';
        },

        get hasTecnicheFilter() {
            return getContext().filters.tecniche !== '';
        },

        get hasPeriodoFilter() {
            return getContext().filters.periodo !== '';
        },

        get activeCategoriaLabel() {
            const { filters, catOptions } = getContext();
            return catOptions?.find((o) => o.value === filters.categoria)?.label ?? filters.categoria;
        },

        get activeMaterialiLabel() {
            const { filters, matOptions } = getContext();
            return matOptions?.find((o) => o.value === filters.materiali)?.label ?? filters.materiali;
        },

        get activeTecnicheLabel() {
            const { filters, tecOptions } = getContext();
            return tecOptions?.find((o) => o.value === filters.tecniche)?.label ?? filters.tecniche;
        },

        get activePeriodoLabel() {
            const { filters, periOptions } = getContext();
            return periOptions?.find((o) => o.value === filters.periodo)?.label ?? filters.periodo;
        },
    },

    actions: {

        toggleFilters() {
            getContext().filtersOpen = !getContext().filtersOpen;
        },

        togglePill() {
            const ctx = getContext();
            const { filterGroup, filterVal, filters } = ctx;
            if (!filterGroup) return;
            if (filterGroup === 'categoria') {
                ctx.filters.categoria = filters.categoria === filterVal ? 'all' : filterVal;
            } else if (filterGroup === 'materiali') {
                ctx.filters.materiali = filters.materiali === filterVal ? '' : filterVal;
            } else if (filterGroup === 'tecniche') {
                ctx.filters.tecniche = filters.tecniche === filterVal ? '' : filterVal;
            } else if (filterGroup === 'periodo') {
                ctx.filters.periodo = filters.periodo === filterVal ? '' : filterVal;
            }
        },

        clearFilters() {
            const { filters } = getContext();
            filters.categoria = 'all';
            filters.materiali = '';
            filters.tecniche = '';
            filters.periodo = '';
        },

        clearCategoria() {
            getContext().filters.categoria = 'all';
        },

        clearMateriali() {
            getContext().filters.materiali = '';
        },

        clearTecniche() {
            getContext().filters.tecniche = '';
        },

        clearPeriodo() {
            getContext().filters.periodo = '';
        },
    },

    callbacks: {
        initMap() {
            const ctx = getContext();
            const { ref } = getElement();
            if (ctx.allMarkers) return;

            const style = STYLES[ctx.mapStyle] || STYLES.natural;
            const map = L.map(ref, { zoomControl: false });
            L.control.zoom({ position: 'bottomright' }).addTo(map);
            L.tileLayer(style.tileUrl, { attribution: CARTO_ATTR }).addTo(map);
            map.getPanes().tilePane.style.filter = style.filter;

            const panel = ref.closest('[data-wp-interactive]').querySelector('.mp-info-panel');
            const panelContent = panel.querySelector('.mp-info-panel__content');

            const refs = getRefs(ctx);
            refs.panel = panel;

            panel.querySelector('.mp-info-panel__close').addEventListener('click', () => {
                panel.classList.remove('is-open');
                if (refs.selectedMarker) {
                    refs.selectedMarker.setIcon(refs.selectedMarker._defaultIcon);
                    refs.selectedMarker = null;
                }
            });

            const coordGroups = groupPostsByCoord(ctx.posts);

            ctx.allMarkers = Object.values(coordGroups).map((group) => {
                const first = group[0];
                const count = group.length;
                const defaultIcon = makeIcon(count);
                const selectedIcon = makeIconSelected(count);
                const marker = L.marker([first.lat, first.lng], { icon: defaultIcon });
                marker._filters = buildMarkerFilters(group);
                marker._postCount = count;
                marker._defaultIcon = defaultIcon;

                marker.on('click', () => {
                    if (refs.selectedMarker && refs.selectedMarker !== marker) {
                        refs.selectedMarker.setIcon(refs.selectedMarker._defaultIcon);
                    }
                    marker.setIcon(selectedIcon);
                    refs.selectedMarker = marker;

                    const postsInPanel = filterPostsForPanel(group, ctx.filters.periodo);
                    panelContent.innerHTML = postsInPanel
                        .map(makeCard).join('<div class="mp-divider"></div>');
                    panel.classList.add('is-open');
                    panel.scrollTop = 0;
                });

                return marker;
            });

            ctx.markerGroup = L.markerClusterGroup({
                iconCreateFunction: (cluster) => {
                    const total = cluster.getAllChildMarkers()
                        .reduce((s, m) => s + (m._postCount || 1), 0);
                    return makeClusterIcon(total);
                },
                showCoverageOnHover: false,
                zoomToBoundsOnClick: true,
                spiderfyOnMaxZoom: true,
                disableClusteringAtZoom: 14,
                maxClusterRadius: 30,
                animate: true,
            }).addTo(map);

            // mapInstance va settata dopo invalidateSize → triggera il watch updateMarkers
            setTimeout(() => {
                map.invalidateSize();
                ctx.mapInstance = map;
            }, 100);
        },

        updateMarkers() {
            const ctx = getContext();
            const { mapInstance, markerGroup, allMarkers, filters } = ctx;
            if (!mapInstance) return;

            const refs = getRefs(ctx);

            markerGroup.clearLayers();

            const visible = allMarkers.filter((m) => markerMatchesFilters(m._filters, filters));

            visible.forEach((m) => markerGroup.addLayer(m));

            if (refs.selectedMarker && !visible.includes(refs.selectedMarker)) {
                if (refs.panel) refs.panel.classList.remove('is-open');
                refs.selectedMarker.setIcon(refs.selectedMarker._defaultIcon);
                refs.selectedMarker = null;
            }

            if (visible.length === 1) {
                mapInstance.setView(visible[0].getLatLng(), 13);
            } else if (visible.length > 1) {
                if (refs.firstRender && isMobile()) {
                    mapInstance.fitBounds(EUROPE_BOUNDS, { padding: [16, 16] });
                } else {
                    mapInstance.fitBounds(
                        L.latLngBounds(visible.map((m) => m.getLatLng())),
                        { padding: [48, 48] }
                    );
                }
            }

            refs.firstRender = false;
        },
    },
});
