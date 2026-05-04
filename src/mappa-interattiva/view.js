import L from 'leaflet';

// Fix percorsi immagini marker default di Leaflet con webpack
delete L.Icon.Default.prototype._getIconUrl;

const CARTO_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';

const STYLES = {
    natural: {
        name:       'Chiaro naturale',
        bg:         '#f5f0e8',
        water:      '#c8ddd6',
        land:       '#ede8de',
        green:      '#d4e4c8',
        road_major: '#b8a898',
        road_minor: '#cec5b8',
        building:   '#ddd8ce',
        border:     '#c8bfb0',
        label:      '#6b5040',
        label2:     '#8c7060',
        tileUrl:    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        filter:     'sepia(25%) saturate(0.9) brightness(1.02) hue-rotate(5deg)',
        pin:        '#b85f29',
        pinStroke:  '#6b2a0b',
        pinText:    '#fff',
        swatches:   [ '#f5f0e8', '#c8ddd6', '#d4e4c8', '#b8a898', '#6b5040' ],
    },
    warm: {
        name:       'Caldo bruciato',
        bg:         '#f0e8d8',
        water:      '#b8cec8',
        land:       '#e8dece',
        green:      '#c8d8b8',
        road_major: '#c8a878',
        road_minor: '#d8c8a8',
        building:   '#d8cebc',
        border:     '#c0b098',
        label:      '#6b2a0b',
        label2:     '#b85f29',
        tileUrl:    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        filter:     'sepia(45%) saturate(1.1) brightness(0.98) hue-rotate(-5deg)',
        pin:        '#f5cc5b',
        pinStroke:  '#b85f29',
        pinText:    '#6b2a0b',
        swatches:   [ '#f0e8d8', '#b8cec8', '#c8a878', '#f5cc5b', '#6b2a0b' ],
    },
    teal: {
        name:       'Freddo teal',
        bg:         '#eaf4f0',
        water:      '#8cbbba',
        land:       '#e8f0ec',
        green:      '#c0d8cc',
        road_major: '#a8c0b8',
        road_minor: '#c8d8d0',
        building:   '#d0dcd8',
        border:     '#9cb8b0',
        label:      '#3a6858',
        label2:     '#5a8878',
        tileUrl:    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        filter:     'sepia(10%) saturate(0.8) brightness(1.03) hue-rotate(140deg)',
        pin:        '#8cbbba',
        pinStroke:  '#3a6858',
        pinText:    '#fff',
        swatches:   [ '#eaf4f0', '#8cbbba', '#c0d8cc', '#a8c0b8', '#3a6858' ],
    },
    dark: {
        name:       'Scuro terroso',
        bg:         '#2c2418',
        water:      '#3a5048',
        land:       '#3c3228',
        green:      '#384830',
        road_major: '#5c5040',
        road_minor: '#483c30',
        building:   '#403830',
        border:     '#6c5c48',
        label:      '#d4c8b0',
        label2:     '#a89880',
        tileUrl:    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        filter:     'sepia(35%) saturate(0.7) brightness(0.85) hue-rotate(5deg)',
        pin:        '#f5cc5b',
        pinStroke:  '#b85f29',
        pinText:    '#2c2418',
        swatches:   [ '#2c2418', '#3a5048', '#5c5040', '#f5cc5b', '#d4c8b0' ],
    },
};

const DEFAULT_CENTER = [ 41.9, 12.5 ];
const DEFAULT_ZOOM   = 6;

function makeIcon( pin, pinStroke, pinText ) {
    const svg =
        '<svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="14" cy="14" r="13" fill="#b85f29" stroke="#6b2a0b" stroke-width="2"/>' +
        '<circle cx="14" cy="14" r="6" fill="#f5cc5b"/>' +
        '</svg>';
    return L.divIcon( {
        html:        svg,
        className:   'map-pin-icon',
        iconSize:    [28, 28],
        iconAnchor:  [14, 14],
        popupAnchor: [0, -18],
    } );
}

function esc( str ) {
    return String( str ?? '' )
        .replace( /&/g, '&amp;' )
        .replace( /</g, '&lt;' )
        .replace( />/g, '&gt;' )
        .replace( /"/g, '&quot;' );
}

function makeCard( post ) {
    const thumb = post.thumb
        ? '<div class="mp-thumb"><img src="' + esc( post.thumb ) + '" alt="' + esc( post.title ) + '" loading="lazy"></div>'
        : '';
    const ubicazione = post.ubicazione
        ? '<span class="mp-ubicazione">' + esc( post.ubicazione ) + '</span>'
        : '';
    return (
        '<div class="mp-card">' +
            thumb +
            '<div class="mp-body">' +
                ubicazione +
                '<a class="mp-title" href="' + esc( post.url ) + '">' + esc( post.title ) + '</a>' +
            '</div>' +
        '</div>'
    );
}

function makePopupHtml( group ) {
    return (
        '<div class="mp-popup">' +
        group.map( makeCard ).join( '<div class="mp-divider"></div>' ) +
        '</div>'
    );
}

function initMaps() {
    document.querySelectorAll( '.map-canvas' ).forEach( function ( el ) {
        let config = {};
        try { config = JSON.parse( el.dataset.mapConfig || '{}' ); } catch ( e ) { return; }

        const style     = STYLES[ config.mapStyle ] || STYLES.natural;
        const posts     = config.posts || [];
        const tileLayer = L.tileLayer( style.tileUrl, { attribution: CARTO_ATTR, maxZoom: 20 } );
        const map       = L.map( el, { layers: [ tileLayer ] } );

        // Applica il filtro CSS al tile pane
        map.getPanes().tilePane.style.filter = style.filter;

        // Mappa senza dati: mostra vista di default
        if ( ! posts.length ) {
            map.setView( DEFAULT_CENTER, DEFAULT_ZOOM );
            return;
        }

        // Raggruppa post con stesse coordinate in un unico marker
        const coordGroups = {};
        posts.forEach( function ( post ) {
            const key = post.lat.toFixed( 6 ) + ',' + post.lng.toFixed( 6 );
            if ( ! coordGroups[ key ] ) coordGroups[ key ] = [];
            coordGroups[ key ].push( post );
        } );

        // Costruisce marker con popup (un marker per gruppo di coordinate)
        const icon       = makeIcon( style.pin, style.pinStroke, style.pinText );
        const markerList = Object.values( coordGroups ).map( function ( group ) {
            const first  = group[ 0 ];
            const marker = L.marker( [ first.lat, first.lng ], { icon } )
                .bindPopup( makePopupHtml( group ), {
                    maxWidth:  280,
                    maxHeight: 420,
                    className: 'mp-container',
                } );
            marker._categoria = group.map( function ( p ) { return p.categoria || ''; } );
            marker._materiale = [].concat( ...group.map( function ( p ) { return p.materiale || []; } ) );
            marker._tecnica   = [].concat( ...group.map( function ( p ) { return p.tecnica   || []; } ) );
            return marker;
        } );

        const markerGroup = L.layerGroup( markerList ).addTo( map );

        // Adatta il viewport ai marker visibili
        const coords = posts.map( function ( p ) { return [ p.lat, p.lng ]; } );
        if ( coords.length === 1 ) {
            map.setView( coords[ 0 ], 13 );
        } else {
            map.fitBounds( L.latLngBounds( coords ), { padding: [ 48, 48 ] } );
        }

        // ── Filtri multi-gruppo (stessa logica timeline) ──────────────────────
        const wrap = el.closest( '.map-block-wrap' );
        if ( ! wrap ) return;

        const activeFilters = { categoria: 'all', materiale: 'all', tecnica: 'all' };

        function matchesFilters( m ) {
            const okCat = activeFilters.categoria === 'all' || m._categoria.includes( activeFilters.categoria );
            const okMat = activeFilters.materiale === 'all' || m._materiale.includes( activeFilters.materiale );
            const okTec = activeFilters.tecnica   === 'all' || m._tecnica.includes( activeFilters.tecnica );
            return okCat && okMat && okTec;
        }

        // Verifica se un valore è disponibile dato i filtri degli ALTRI gruppi
        function isValueAvailable( group, val ) {
            if ( val === 'all' ) return true;
            return posts.some( function ( post ) {
                const okCat = group === 'categoria' ? true : ( activeFilters.categoria === 'all' || post.categoria === activeFilters.categoria );
                const okMat = group === 'materiale' ? true : ( activeFilters.materiale === 'all' || ( post.materiale || [] ).includes( activeFilters.materiale ) );
                const okTec = group === 'tecnica'   ? true : ( activeFilters.tecnica   === 'all' || ( post.tecnica   || [] ).includes( activeFilters.tecnica ) );
                if ( ! okCat || ! okMat || ! okTec ) return false;
                if ( group === 'categoria' ) return post.categoria === val;
                if ( group === 'materiale' ) return ( post.materiale || [] ).includes( val );
                if ( group === 'tecnica' )   return ( post.tecnica   || [] ).includes( val );
                return false;
            } );
        }

        function updatePillAvailability() {
            wrap.querySelectorAll( '.pill[data-filter-group]' ).forEach( function ( btn ) {
                const val = btn.dataset.filterVal;
                if ( val === 'all' ) return;
                const available = isValueAvailable( btn.dataset.filterGroup, val );
                btn.disabled = ! available;
                btn.classList.toggle( 'disabled', ! available );
            } );
        }

        function updateActiveFiltersUI() {
            const hasActive = activeFilters.categoria !== 'all'
                           || activeFilters.materiale !== 'all'
                           || activeFilters.tecnica   !== 'all';

            const afSection = wrap.querySelector( '.tl-active-filters' );
            if ( afSection ) afSection.style.display = hasActive ? '' : 'none';

            [ 'categoria', 'materiale', 'tecnica' ].forEach( function ( group ) {
                const isActive = activeFilters[ group ] !== 'all';
                const tag = wrap.querySelector( '.map-clear-group[data-clear-group="' + group + '"]' );
                if ( ! tag ) return;
                tag.style.display = isActive ? '' : 'none';
                if ( isActive ) {
                    const labelEl = tag.querySelector( '.map-active-label' );
                    if ( labelEl ) {
                        const pill = wrap.querySelector( '.pill[data-filter-group="' + group + '"][data-filter-val="' + activeFilters[ group ] + '"]' );
                        labelEl.textContent = pill ? pill.textContent.trim() : activeFilters[ group ];
                    }
                }
            } );
        }

        function syncPillActiveState( group ) {
            wrap.querySelectorAll( '.pill[data-filter-group="' + group + '"]' ).forEach( function ( b ) {
                b.classList.remove( 'active' );
            } );
            const activePill = wrap.querySelector(
                '.pill[data-filter-group="' + group + '"][data-filter-val="' + activeFilters[ group ] + '"]'
            );
            if ( activePill ) activePill.classList.add( 'active' );
        }

        function applyFilters() {
            markerGroup.clearLayers();
            const visible = markerList.filter( matchesFilters );
            visible.forEach( function ( m ) { markerGroup.addLayer( m ); } );

            if ( visible.length === 1 ) {
                map.setView( visible[ 0 ].getLatLng(), map.getZoom() );
            } else if ( visible.length > 1 ) {
                map.fitBounds(
                    L.latLngBounds( visible.map( function ( m ) { return m.getLatLng(); } ) ),
                    { padding: [ 48, 48 ] }
                );
            }

            updatePillAvailability();
            updateActiveFiltersUI();
        }

        function resetGroup( group ) {
            activeFilters[ group ] = 'all';
            syncPillActiveState( group );
        }

        // Click su ogni pill
        wrap.querySelectorAll( '.pill[data-filter-group]' ).forEach( function ( btn ) {
            btn.addEventListener( 'click', function () {
                const group = btn.dataset.filterGroup;
                const val   = btn.dataset.filterVal;

                if ( val === 'all' ) {
                    activeFilters[ group ] = 'all';
                } else {
                    // Toggle: click sulla pill già attiva → reset
                    activeFilters[ group ] = activeFilters[ group ] === val ? 'all' : val;
                }

                syncPillActiveState( group );
                applyFilters();
            } );
        } );

        // Clear per singolo gruppo (click sul tag filtro attivo)
        wrap.querySelectorAll( '.map-clear-group' ).forEach( function ( btn ) {
            btn.addEventListener( 'click', function () {
                resetGroup( btn.dataset.clearGroup );
                applyFilters();
            } );
        } );

        // Azzera tutti i filtri
        const clearAllBtn = wrap.querySelector( '.map-clear-all' );
        if ( clearAllBtn ) {
            clearAllBtn.addEventListener( 'click', function () {
                resetGroup( 'categoria' );
                resetGroup( 'materiale' );
                resetGroup( 'tecnica' );
                applyFilters();
            } );
        }
    } );
}

if ( document.readyState === 'loading' ) {
    document.addEventListener( 'DOMContentLoaded', initMaps );
} else {
    initMaps();
}
