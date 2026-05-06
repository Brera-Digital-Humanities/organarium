import { store, getContext, getElement } from '@wordpress/interactivity';
import L from 'leaflet';
import 'leaflet.markercluster';

delete L.Icon.Default.prototype._getIconUrl;

const CARTO_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';

const STYLES = {
    natural: {
        tileUrl: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        filter:  'sepia(25%) saturate(0.9) brightness(1.02) hue-rotate(5deg)',
    },
    warm: {
        tileUrl: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        filter:  'sepia(45%) saturate(1.1) brightness(0.98) hue-rotate(-5deg)',
    },
    teal: {
        tileUrl: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        filter:  'sepia(10%) saturate(0.8) brightness(1.03) hue-rotate(140deg)',
    },
    dark: {
        tileUrl: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        filter:  'sepia(35%) saturate(0.7) brightness(0.85) hue-rotate(5deg)',
    },
};

function makeIcon() {
    const svg = `<svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14" r="13" fill="#b85f29" stroke="#6b2a0b" stroke-width="2"/><circle cx="14" cy="14" r="6" fill="#f5cc5b"/></svg>`;
    return L.divIcon({ html: svg, className: 'map-pin-icon', iconSize: [28,28], iconAnchor: [14,14] });
}

function makeIconSelected() {
    const svg = `<svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14" r="13" fill="#f5cc5b" stroke="#b85f29" stroke-width="2"/><circle cx="14" cy="14" r="6" fill="#6b2a0b"/></svg>`;
    return L.divIcon({ html: svg, className: 'map-pin-icon map-pin-icon--selected', iconSize: [28,28], iconAnchor: [14,14] });
}

function makeClusterIcon( count ) {
    const s    = count < 10 ? 38 : count < 100 ? 46 : 54;
    const half = s / 2;
    const svg  = `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg"><circle cx="${half}" cy="${half}" r="${half - 2}" fill="#b85f29" stroke="#6b2a0b" stroke-width="2"/><text x="${half}" y="${half}" text-anchor="middle" dominant-baseline="central" fill="#f5cc5b" font-size="${s < 42 ? 14 : 16}" font-weight="700" font-family="sans-serif">${count}</text></svg>`;
    return L.divIcon( { html: svg, className: 'map-cluster-icon', iconSize: [ s, s ], iconAnchor: [ half, half ] } );
}

function esc( s ) {
    return String( s ?? '' )
        .replace( /&/g, '&amp;' ).replace( /</g, '&lt;' )
        .replace( />/g, '&gt;' ).replace( /"/g, '&quot;' );
}

function makeCard( post ) {
    const thumb      = post.thumb      ? `<div class="mp-thumb"><a class="mp-title" href="${ esc(post.url) }"><img src="${ esc(post.thumb) }" alt="${ esc(post.title) }" loading="lazy"></a></div>` : '';
    const ubicazione = post.ubicazione ? `<span class="mp-ubicazione">${ esc(post.ubicazione) }</span>` : '';
    const excerpt    = post.excerpt    ? `<p class="mp-excerpt">${ esc(post.excerpt) }</p>` : '';
    return `<div class="mp-card">${ thumb }<div class="mp-body">${ ubicazione }<a class="mp-title" href="${ esc(post.url) }">${ esc(post.title) }</a>${ excerpt }</div></div>`;
}

store( 'mappa-interattiva', {
    state: {

        // ── Filtri ────────────────────────────────────────────────────────────
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

        // ── Stato di una singola pill (contesto locale: filterGroup + filterVal) ──
        get isPillActive() {
            const ctx = getContext();
            const { filterGroup, filterVal, filters } = ctx;
            if ( ! filterGroup ) return false;
            if ( filterGroup === 'categoria' ) return filters.categoria === filterVal;
            if ( filterGroup === 'materiali' ) return filters.materiali === filterVal;
            if ( filterGroup === 'tecniche' )  return filters.tecniche  === filterVal;
            if ( filterGroup === 'periodo' )   return filters.periodo   === filterVal;
            return false;
        },

        // ── Disponibilità condizionale di una pill ────────────────────────────
        get isValueAvailable() {
            const ctx = getContext();
            const { filterGroup, filterVal, posts, filters } = ctx;
            if ( ! filterGroup ) return true;

            const filtered = posts.filter( ( post ) => {
                const matchCat = filterGroup === 'categoria'
                    ? true
                    : ( filters.categoria === 'all' || post.categoria === filters.categoria );
                const matchMat = filterGroup === 'materiali'
                    ? true
                    : ( filters.materiali === '' || post.materiale.includes( filters.materiali ) );
                const matchTec = filterGroup === 'tecniche'
                    ? true
                    : ( filters.tecniche === '' || post.tecnica.includes( filters.tecniche ) );
                const matchPer = filterGroup === 'periodo'
                    ? true
                    : ( filters.periodo === ''
                        || ( filters.periodo === 'tardo-antico'     && post.data_per_timeline < 800 )
                        || ( filters.periodo === 'medioevo-moderno' && post.data_per_timeline >= 800 ) );
                return matchCat && matchMat && matchTec && matchPer;
            } );

            if ( filterGroup === 'categoria' ) return filtered.some( ( p ) => p.categoria === filterVal );
            if ( filterGroup === 'materiali' ) return filtered.some( ( p ) => p.materiale.includes( filterVal ) );
            if ( filterGroup === 'tecniche' )  return filtered.some( ( p ) => p.tecnica.includes( filterVal ) );
            if ( filterGroup === 'periodo' ) {
                if ( filterVal === 'tardo-antico' )     return filtered.some( ( p ) => p.data_per_timeline < 800 );
                if ( filterVal === 'medioevo-moderno' ) return filtered.some( ( p ) => p.data_per_timeline >= 800 );
            }
            return true;
        },

        get isPillDisabled() {
            return ! store( 'mappa-interattiva' ).state.isValueAvailable;
        },

        // ── Filtri attivi (per le etichette sotto il divider) ─────────────────
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
            return catOptions?.find( ( o ) => o.value === filters.categoria )?.label ?? filters.categoria;
        },

        get activeMaterialiLabel() {
            const { filters, matOptions } = getContext();
            return matOptions?.find( ( o ) => o.value === filters.materiali )?.label ?? filters.materiali;
        },

        get activeTecnicheLabel() {
            const { filters, tecOptions } = getContext();
            return tecOptions?.find( ( o ) => o.value === filters.tecniche )?.label ?? filters.tecniche;
        },

        get activePeriodoLabel() {
            const { filters, periOptions } = getContext();
            return periOptions?.find( ( o ) => o.value === filters.periodo )?.label ?? filters.periodo;
        },
    },

    actions: {

        toggleFilters() {
            getContext().filtersOpen = ! getContext().filtersOpen;
        },

        togglePill() {
            const ctx = getContext();
            const { filterGroup, filterVal, filters } = ctx;
            if ( ! filterGroup ) return;
            if ( filterGroup === 'categoria' ) {
                ctx.filters.categoria = filters.categoria === filterVal ? 'all' : filterVal;
            } else if ( filterGroup === 'materiali' ) {
                ctx.filters.materiali = filters.materiali === filterVal ? '' : filterVal;
            } else if ( filterGroup === 'tecniche' ) {
                ctx.filters.tecniche = filters.tecniche === filterVal ? '' : filterVal;
            } else if ( filterGroup === 'periodo' ) {
                ctx.filters.periodo = filters.periodo === filterVal ? '' : filterVal;
            }
        },

        clearFilters() {
            const { filters } = getContext();
            filters.categoria = 'all';
            filters.materiali = '';
            filters.tecniche  = '';
            filters.periodo   = '';
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
            const ctx     = getContext();
            const { ref } = getElement();
            if ( ctx.allMarkers ) return;

            const style = STYLES[ ctx.mapStyle ] || STYLES.natural;
            const map   = L.map( ref );
            L.tileLayer( style.tileUrl, { attribution: CARTO_ATTR } ).addTo( map );
            map.getPanes().tilePane.style.filter = style.filter;

            const panel        = ref.closest( '[data-wp-interactive]' ).querySelector( '.mp-info-panel' );
            const panelContent = panel.querySelector( '.mp-info-panel__content' );
            const defaultIcon  = makeIcon();
            const selectedIcon = makeIconSelected();

            ctx._panel       = panel;
            ctx._defaultIcon = defaultIcon;

            panel.querySelector( '.mp-info-panel__close' ).addEventListener( 'click', () => {
                panel.classList.remove( 'is-open' );
                if ( ctx._selectedMarker ) {
                    ctx._selectedMarker.setIcon( defaultIcon );
                    ctx._selectedMarker = null;
                }
            } );

            const coordGroups = {};
            ctx.posts.forEach( ( post ) => {
                const key = post.lat.toFixed(6) + ',' + post.lng.toFixed(6);
                if ( ! coordGroups[ key ] ) coordGroups[ key ] = [];
                coordGroups[ key ].push( post );
            } );

            ctx.allMarkers = Object.values( coordGroups ).map( ( group ) => {
                const first  = group[ 0 ];
                const marker = L.marker( [ first.lat, first.lng ], { icon: defaultIcon } );
                marker._filters = {
                    categoria:     group.map( ( p ) => p.categoria || '' ),
                    materiale:     [].concat( ...group.map( ( p ) => p.materiale || [] ) ),
                    tecnica:       [].concat( ...group.map( ( p ) => p.tecnica   || [] ) ),
                    hasTardoAntico: group.some( ( p ) => p.data_per_timeline < 800 ),
                    hasMedioevo:    group.some( ( p ) => p.data_per_timeline >= 800 ),
                };

                marker.on( 'click', () => {
                    if ( ctx._selectedMarker && ctx._selectedMarker !== marker ) {
                        ctx._selectedMarker.setIcon( defaultIcon );
                    }
                    marker.setIcon( selectedIcon );
                    ctx._selectedMarker = marker;

                    const { filters } = ctx;
                    const periodoActive = filters.periodo;
                    const postsInPanel = ! periodoActive
                        ? group
                        : group.filter( ( p ) =>
                            periodoActive === 'tardo-antico'
                                ? p.data_per_timeline < 800
                                : p.data_per_timeline >= 800
                        );

                    panelContent.innerHTML = ( postsInPanel.length ? postsInPanel : group )
                        .map( makeCard ).join( '<div class="mp-divider"></div>' );
                    panel.classList.add( 'is-open' );
                    panel.scrollTop = 0;
                } );

                return marker;
            } );

            ctx.markerGroup = L.markerClusterGroup( {
                iconCreateFunction:    ( cluster ) => makeClusterIcon( cluster.getChildCount() ),
                showCoverageOnHover:   false,
                zoomToBoundsOnClick:   true,
                spiderfyOnMaxZoom:     true,
                disableClusteringAtZoom: 17,
                maxClusterRadius:      60,
                animate:               true,
            } ).addTo( map );

            // Imposta mapInstance DOPO invalidateSize: il data-wp-watch su
            // updateMarkers si ri-esegue automaticamente quando mapInstance cambia.
            setTimeout( () => {
                map.invalidateSize();
                ctx.mapInstance = map;
            }, 100 );
        },

        updateMarkers() {
            const ctx = getContext();
            const { mapInstance, markerGroup, allMarkers, filters } = ctx;
            if ( ! mapInstance ) return;

            markerGroup.clearLayers();

            const visible = allMarkers.filter( ( m ) => {
                const okCat = filters.categoria === 'all' || m._filters.categoria.includes( filters.categoria );
                const okMat = filters.materiali === ''    || m._filters.materiale.includes( filters.materiali );
                const okTec = filters.tecniche  === ''    || m._filters.tecnica.includes(   filters.tecniche  );
                const okPer = filters.periodo   === ''
                    || ( filters.periodo === 'tardo-antico'     && m._filters.hasTardoAntico )
                    || ( filters.periodo === 'medioevo-moderno' && m._filters.hasMedioevo   );
                return okCat && okMat && okTec && okPer;
            } );

            visible.forEach( ( m ) => markerGroup.addLayer( m ) );

            if ( ctx._selectedMarker && ! visible.includes( ctx._selectedMarker ) ) {
                if ( ctx._panel ) ctx._panel.classList.remove( 'is-open' );
                ctx._selectedMarker.setIcon( ctx._defaultIcon );
                ctx._selectedMarker = null;
            }

            if ( visible.length === 1 ) {
                mapInstance.setView( visible[ 0 ].getLatLng(), 13 );
            } else if ( visible.length > 1 ) {
                mapInstance.fitBounds(
                    L.latLngBounds( visible.map( ( m ) => m.getLatLng() ) ),
                    { padding: [ 48, 48 ] }
                );
            }
        },
    },
} );
