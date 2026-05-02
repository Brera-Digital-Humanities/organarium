import { store, getContext } from '@wordpress/interactivity';

function _scrubberJump( event, ctx, visiblePosts ) {
    const trackEl = event.currentTarget.querySelector( '.scrubber-track' );
    if ( ! trackEl ) return;
    const rect = trackEl.getBoundingClientRect();
    const pct  = Math.max( 0, Math.min( 1, ( event.clientX - rect.left ) / rect.width ) );
    const keys = visiblePosts.map( ( p ) => p.sort_key ?? 0 );
    if ( keys.length === 0 ) return;
    const min = Math.min( ...keys );
    const max = Math.max( ...keys );
    let idx = 0;
    if ( min !== max ) {
        const target = min + pct * ( max - min );
        idx = keys.reduce(
            ( best, key, i ) => Math.abs( key - target ) < Math.abs( keys[ best ] - target ) ? i : best,
            0
        );
    }
    ctx.activeIndex = idx;
}

store( 'timeline-3d', {

    state: {

        // ── Posts filtrati + ordinati per sort_key numerico ───────────────────
        get visiblePosts() {
            const { posts, filters, sortAsc } = getContext();
            return posts
                .filter( ( post ) => {
                    const matchCat = filters.categoria === 'all' || post.categoria === filters.categoria;
                    const matchMat = filters.materiali === '' || post.materiale.includes( filters.materiali );
                    const matchTec = filters.tecniche === '' || post.tecnica.includes( filters.tecniche );
                    return matchCat && matchMat && matchTec;
                } )
                .sort( ( a, b ) => sortAsc
                    ? ( a.sort_key ?? 0 ) - ( b.sort_key ?? 0 )
                    : ( b.sort_key ?? 0 ) - ( a.sort_key ?? 0 )
                );
        },

        get visibleCount() {
            return store( 'timeline-3d' ).state.visiblePosts.length;
        },

        get counterCurrent() {
            return getContext().activeIndex + 1;
        },

        // ── Filtri ────────────────────────────────────────────────────────────
        get hasActiveFilters() {
            const { filters } = getContext();
            return filters.categoria !== 'all' || filters.materiali !== '' || filters.tecniche !== '';
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
            if ( filterGroup === 'tecniche' )  return filters.tecniche === filterVal;
            return false;
        },

        // ── Disponibilità condizionale di una pill ────────────────────────────
        // Calcola se filterVal esiste in almeno un post filtrato dagli ALTRI gruppi
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
                return matchCat && matchMat && matchTec;
            } );

            if ( filterGroup === 'categoria' ) return filtered.some( ( p ) => p.categoria === filterVal );
            if ( filterGroup === 'materiali' ) return filtered.some( ( p ) => p.materiale.includes( filterVal ) );
            if ( filterGroup === 'tecniche' )  return filtered.some( ( p ) => p.tecnica.includes( filterVal ) );
            return true;
        },

        get isPillDisabled() {
            return ! store( 'timeline-3d' ).state.isValueAvailable;
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

        // ── Vista ─────────────────────────────────────────────────────────────
        get isViewTimeline() {
            return getContext().viewMode === 'timeline';
        },

        get isViewGrid() {
            return getContext().viewMode === 'grid';
        },

        // ── Ordinamento ───────────────────────────────────────────────────────
        get sortLabel() {
            return getContext().sortAsc ? 'Ordina ↑↓' : 'Ordina ↓↑';
        },

        // Posizione CSS order nella griglia (contesto locale: postIndex)
        get gridOrder() {
            const ctx     = getContext();
            const visible = store( 'timeline-3d' ).state.visiblePosts;
            const post    = ctx.posts?.[ ctx.postIndex ];
            if ( ! post ) return 9999;
            const idx = visible.indexOf( post );
            return idx === -1 ? 9999 : idx + 1;
        },

        // ── Navigazione carousel ──────────────────────────────────────────────
        get isFirst() {
            return getContext().activeIndex === 0;
        },

        get isLast() {
            const { state } = store( 'timeline-3d' );
            return getContext().activeIndex >= state.visibleCount - 1;
        },

        // ── Posizione della card nel carousel (contesto locale: postIndex) ────
        get cardOffset() {
            const ctx       = getContext();
            const { state } = store( 'timeline-3d' );
            const visible   = state.visiblePosts;
            const cardPost  = ctx.posts?.[ ctx.postIndex ];
            if ( ! cardPost ) return null;
            const visibleIdx = visible.indexOf( cardPost );
            if ( visibleIdx === -1 ) return null;
            const activePost = visible[ ctx.activeIndex ];
            if ( ! activePost ) return null;
            return visibleIdx - visible.indexOf( activePost );
        },

        get isVisible() {
            return store( 'timeline-3d' ).state.cardOffset !== null;
        },

        get isActive() {
            return store( 'timeline-3d' ).state.cardOffset === 0;
        },

        get isPrev() {
            return store( 'timeline-3d' ).state.cardOffset === -1;
        },

        get isNext() {
            return store( 'timeline-3d' ).state.cardOffset === 1;
        },

        get isPrev2() {
            return store( 'timeline-3d' ).state.cardOffset === -2;
        },

        get isNext2() {
            return store( 'timeline-3d' ).state.cardOffset === 2;
        },

        get zIndex() {
            const offset = store( 'timeline-3d' ).state.cardOffset;
            if ( offset === null ) return 0;
            return Math.max( 0, 20 - Math.abs( offset ) * 2 );
        },

        // ── Scrubber ──────────────────────────────────────────────────────────
        // Posizione % proporzionale alla data reale (contesto locale: postIndex)
        get markerLeft() {
            const ctx     = getContext();
            const visible = store( 'timeline-3d' ).state.visiblePosts;
            if ( visible.length <= 1 ) return '50%';
            const post = ctx.posts?.[ ctx.postIndex ];
            if ( ! post ) return '0%';
            const keys = visible.map( ( p ) => p.sort_key ?? 0 );
            const min  = Math.min( ...keys );
            const max  = Math.max( ...keys );
            if ( min === max ) return '50%';
            return ( ( ( post.sort_key ?? 0 ) - min ) / ( max - min ) * 100 ).toFixed( 2 ) + '%';
        },

        // Etichetta sopra il marker — solo la data (contesto locale: postIndex)
        get markerLabel() {
            const ctx  = getContext();
            const post = ctx.posts?.[ ctx.postIndex ];
            return post?.data ?? '';
        },

        // Posizione % del cursore (contesto radice: activeIndex)
        get scrubberThumbLeft() {
            const ctx     = getContext();
            const visible = store( 'timeline-3d' ).state.visiblePosts;
            if ( visible.length <= 1 ) return '50%';
            const active = visible[ ctx.activeIndex ];
            if ( ! active ) return '0%';
            const keys = visible.map( ( p ) => p.sort_key ?? 0 );
            const min  = Math.min( ...keys );
            const max  = Math.max( ...keys );
            if ( min === max ) return '50%';
            return ( ( ( active.sort_key ?? 0 ) - min ) / ( max - min ) * 100 ).toFixed( 2 ) + '%';
        },
    },

    actions: {

        toggleFilters() {
            const ctx = getContext();
            ctx.filtersOpen = ! ctx.filtersOpen;
        },

        clearFilters() {
            const ctx = getContext();
            ctx.filters.categoria = 'all';
            ctx.filters.materiali = '';
            ctx.filters.tecniche  = '';
            ctx.activeIndex = 0;
        },

        // Un'unica action per tutte le pill — toggle singolo per gruppo
        togglePill() {
            const ctx = getContext();
            const { filterGroup, filterVal, filters } = ctx;
            if ( filterGroup === 'categoria' ) {
                ctx.filters.categoria = filters.categoria === filterVal ? 'all' : filterVal;
            } else if ( filterGroup === 'materiali' ) {
                ctx.filters.materiali = filters.materiali === filterVal ? '' : filterVal;
            } else if ( filterGroup === 'tecniche' ) {
                ctx.filters.tecniche = filters.tecniche === filterVal ? '' : filterVal;
            }
            ctx.activeIndex = 0;
        },

        clearCategoria() {
            const ctx = getContext();
            ctx.filters.categoria = 'all';
            ctx.activeIndex = 0;
        },

        clearMateriali() {
            const ctx = getContext();
            ctx.filters.materiali = '';
            ctx.activeIndex = 0;
        },

        clearTecniche() {
            const ctx = getContext();
            ctx.filters.tecniche = '';
            ctx.activeIndex = 0;
        },

        setViewTimeline() {
            getContext().viewMode = 'timeline';
        },

        setViewGrid() {
            getContext().viewMode = 'grid';
        },

        toggleSort() {
            const ctx = getContext();

            // FLIP: registra posizioni attuali se siamo nella griglia
            let snapshots = null;
            if ( ctx.viewMode === 'grid' ) {
                const cards = [ ...document.querySelectorAll( '.grid-card:not(.is-hidden)' ) ];
                snapshots = cards.map( ( el ) => ( { el, first: el.getBoundingClientRect() } ) );
            }

            ctx.sortAsc = ! ctx.sortAsc;
            ctx.activeIndex = 0;

            if ( snapshots ) {
                requestAnimationFrame( () => {
                    // L: posizioni dopo il riordino (CSS order aggiornato)
                    snapshots.forEach( ( { el, first } ) => {
                        const last = el.getBoundingClientRect();
                        const dx   = first.left - last.left;
                        const dy   = first.top  - last.top;
                        el.style.transition = 'none';
                        el.style.transform  = ( dx || dy ) ? `translate(${ dx }px,${ dy }px)` : '';
                    } );
                    // Forza layout per fissare i transform prima del prossimo frame
                    snapshots[ 0 ]?.el.getBoundingClientRect();
                    requestAnimationFrame( () => {
                        snapshots.forEach( ( { el } ) => {
                            el.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1)';
                            el.style.transform  = '';
                        } );
                        setTimeout( () => snapshots.forEach( ( { el } ) => {
                            el.style.transition = '';
                        } ), 550 );
                    } );
                } );
            }
        },

        // Naviga allo specifico post cliccato sul marker (contesto locale: postIndex)
        goToMarker() {
            const ctx     = getContext();
            const visible = store( 'timeline-3d' ).state.visiblePosts;
            const post    = ctx.posts?.[ ctx.postIndex ];
            if ( ! post ) return;
            const idx = visible.indexOf( post );
            if ( idx !== -1 ) ctx.activeIndex = idx;
        },

        // Drag scrubber — pointerdown: avvia cattura e salta
        scrubberPointerDown( event ) {
            if ( event.target.closest( '.scrubber-marker' ) ) {
                event.currentTarget.setPointerCapture( event.pointerId );
                return;
            }
            event.currentTarget.setPointerCapture( event.pointerId );
            const ctx = getContext();
            _scrubberJump( event, ctx, store( 'timeline-3d' ).state.visiblePosts );
        },

        // Drag scrubber — pointermove: aggiorna posizione durante il trascinamento
        scrubberPointerMove( event ) {
            if ( ! event.buttons ) return;
            const ctx = getContext();
            _scrubberJump( event, ctx, store( 'timeline-3d' ).state.visiblePosts );
        },

        next() {
            const ctx       = getContext();
            const { state } = store( 'timeline-3d' );
            if ( ctx.activeIndex < state.visibleCount - 1 ) ctx.activeIndex++;
        },

        prev() {
            const ctx = getContext();
            if ( ctx.activeIndex > 0 ) ctx.activeIndex--;
        },
    },

    callbacks: {
        init() {
            document.addEventListener( 'keydown', ( e ) => {
                const { actions } = store( 'timeline-3d' );
                if ( e.key === 'ArrowRight' ) actions.next();
                if ( e.key === 'ArrowLeft' )  actions.prev();
            } );
        },
    },
} );
