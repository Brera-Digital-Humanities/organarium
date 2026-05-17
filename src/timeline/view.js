import { store, getContext } from '@wordpress/interactivity';
import {
    filterAndSortPosts,
    isValueAvailable as pureIsValueAvailable,
    isPillInvisible as pureIsPillInvisible,
    markerPercent,
    formatCenturyLabel,
    scrubberJumpIndex,
} from './logic';

function _scrubberJump( event, ctx, visiblePosts ) {
    const trackEl = event.currentTarget.querySelector( '.scrubber-track' );
    if ( ! trackEl ) return;
    const rect = trackEl.getBoundingClientRect();
    const idx  = scrubberJumpIndex( event.clientX, rect.left, rect.width, visiblePosts );
    if ( idx !== null ) ctx.activeIndex = idx;
}

store( 'timeline-3d', {

    state: {

        // ── Posts filtrati + ordinati per sort_key numerico ───────────────────
        get visiblePosts() {
            const { posts, filters, sortAsc, activeCenturyMin, activeCenturyMax } = getContext();
            return filterAndSortPosts( posts, { activeCenturyMin, activeCenturyMax, filters, sortAsc } );
        },

        get visibleCount() {
            return store( 'timeline-3d' ).state.visiblePosts.length;
        },

        get showScrubber() {
            return store( 'timeline-3d' ).state.visiblePosts.length >= 3;
        },

        get showNavBtn() {
            return store( 'timeline-3d' ).state.visiblePosts.length > 1;
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
            const { posts, filters, activeCenturyMin, activeCenturyMax, filterGroup, filterVal } = getContext();
            return pureIsValueAvailable( posts, { filterGroup, filterVal, filters, activeCenturyMin, activeCenturyMax } );
        },

        get isPillDisabled() {
            const { state } = store( 'timeline-3d' );
            // Disabled = esiste nel secolo ma escluso dai filtri (vs invisible = assente nel secolo)
            return ! state.isValueAvailable && ! state.isPillInvisible;
        },

        // ── Pill invisibile: il valore non compare in alcun post del secolo attivo ─
        get isPillInvisible() {
            const { posts, activeCenturyMin, activeCenturyMax, filterGroup, filterVal } = getContext();
            return pureIsPillInvisible( posts, { filterGroup, filterVal, activeCenturyMin, activeCenturyMax } );
        },

        // Per il binding HTML `disabled`: bottone non cliccabile in entrambi gli stati
        get isPillUnavailable() {
            return ! store( 'timeline-3d' ).state.isValueAvailable;
        },

        // ── Century bar ───────────────────────────────────────────────────────
        // Contesto locale del segmento: segMin / segMax
        get isCenturyActive() {
            const ctx = getContext();
            return ctx.activeCenturyMin === ctx.segMin;
        },

        // Contesto locale del dot: postIndex
        get isDotActive() {
            const ctx = getContext();
            const { state } = store( 'timeline-3d' );
            const activePost = state.visiblePosts[ ctx.activeIndex ];
            const dotPost    = ctx.posts?.[ ctx.postIndex ];
            return !! ( dotPost && activePost && dotPost.id === activePost.id );
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

        get activeCenturyLabel() {
            const { activeCenturyMin, activeCenturyMax } = getContext();
            return formatCenturyLabel( activeCenturyMin, activeCenturyMax );
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
        // Posizione % proporzionale all'anno all'interno del secolo attivo
        get markerLeft() {
            const ctx  = getContext();
            const post = ctx.posts?.[ ctx.postIndex ];
            if ( ! post ) return '0%';
            return markerPercent( post.sort_key, ctx.activeCenturyMin, ctx.activeCenturyMax );
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
            if ( ! visible.length ) return '0%';
            const active = visible[ ctx.activeIndex ];
            if ( ! active ) return '0%';
            return markerPercent( active.sort_key, ctx.activeCenturyMin, ctx.activeCenturyMax );
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

        setCentury() {
            const ctx = getContext();
            ctx.activeCenturyMin      = ctx.segMin;
            ctx.activeCenturyMax      = ctx.segMax;
            ctx.filters.categoria     = 'all';
            ctx.filters.materiali     = '';
            ctx.filters.tecniche      = '';
            ctx.filtersOpen           = false;

            // In vista 3D, se i post del nuovo segmento sono più di 4,
            // porta in primo piano la terza card (idx 2) anziché la prima.
            // Non interferisce col ripristino da cookie: si attiva solo
            // sul click utente al segmento, non all'init.
            /*const count = ctx.posts.filter( ( p ) => {
                const sk = p.sort_key ?? 0;
                return sk >= ctx.segMin && sk < ctx.segMax;
            } ).length;
            ctx.activeIndex = ( ctx.viewMode === 'timeline' && count > 4 ) ? 2 : 0;*/
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
            const ctx = getContext();

            // Replica di state.visiblePosts senza getContext() (non usabile in listener DOM plain)
            const visiblePosts = () => {
                if ( ! ctx.posts ) return [];
                return ctx.posts
                    .filter( ( p ) => {
                        const sk = p.sort_key ?? 0;
                        if ( sk < ctx.activeCenturyMin || sk >= ctx.activeCenturyMax ) return false;
                        if ( ctx.filters.categoria !== 'all' && p.categoria !== ctx.filters.categoria ) return false;
                        if ( ctx.filters.materiali !== '' && ! p.materiale.includes( ctx.filters.materiali ) ) return false;
                        if ( ctx.filters.tecniche !== '' && ! p.tecnica.includes( ctx.filters.tecniche ) ) return false;
                        return true;
                    } )
                    .sort( ( a, b ) => ctx.sortAsc
                        ? ( a.sort_key ?? 0 ) - ( b.sort_key ?? 0 )
                        : ( b.sort_key ?? 0 ) - ( a.sort_key ?? 0 )
                    );
            };

            const goNext = () => {
                const vp = visiblePosts();
                if ( ctx.activeIndex < vp.length - 1 ) ctx.activeIndex++;
            };
            const goPrev = () => {
                if ( ctx.activeIndex > 0 ) ctx.activeIndex--;
            };

            // Tastiera
            document.addEventListener( 'keydown', ( e ) => {
                if ( e.key === 'ArrowRight' ) goNext();
                if ( e.key === 'ArrowLeft' )  goPrev();
            } );

            // Rotella del mouse → next / prev (solo se ci sono ≥ 4 post visibili)
            document.querySelector( '.timeline-view' )?.addEventListener( 'wheel', ( e ) => {
                if ( visiblePosts().length < 4 ) return;
                e.preventDefault();
                if ( e.deltaY > 0 ) goNext();
                else goPrev();
            }, { passive: false } );

            // Swipe touch (mobile) — soglia 50px, asse prevalentemente orizzontale (touch-action:pan-y nel CSS)
            const viewport = document.querySelector( '.timeline-viewport' );
            if ( viewport ) {
                let startX = 0, startY = 0, swiped = false;
                viewport.addEventListener( 'touchstart', ( e ) => {
                    if ( e.touches.length !== 1 ) return;
                    startX = e.touches[ 0 ].clientX;
                    startY = e.touches[ 0 ].clientY;
                    swiped = false;
                }, { passive: true } );
                viewport.addEventListener( 'touchmove', ( e ) => {
                    if ( swiped || e.touches.length !== 1 ) return;
                    const dx = e.touches[ 0 ].clientX - startX;
                    const dy = e.touches[ 0 ].clientY - startY;
                    if ( Math.abs( dx ) > 50 && Math.abs( dx ) > Math.abs( dy ) ) {
                        swiped = true;
                        if ( dx < 0 ) goNext();
                        else goPrev();
                    }
                }, { passive: true } );
                // Sopprime il click sintetico post-swipe
                viewport.addEventListener( 'click', ( e ) => {
                    if ( swiped ) {
                        e.stopPropagation();
                        e.preventDefault();
                        swiped = false;
                    }
                }, true );
            }

            // Century bar — drag-to-pan + ripristino posizione scroll da cookie
            const bar = document.querySelector( '.tl-century-bar' );
            if ( bar ) {
                // Ripristino scroll salvato (dopo layout per scrollWidth corretto)
                requestAnimationFrame( () => {
                    const saved = ctx.centuryScrollLeft;
                    if ( typeof saved === 'number' && saved > 0 ) bar.scrollLeft = saved;
                } );

                // Drag con il mouse (touch usa pan-x nativo via touch-action)
                // NB: setPointerCapture viene chiamato solo quando il drag inizia davvero
                // (oltre la soglia di 3px). Catturarlo al pointerdown su Chrome causa il
                // re-target del click sulla bar, sopprimendo il click sui segmenti.
                let dragging = false, captured = false, startX = 0, startScroll = 0, moved = false;
                bar.addEventListener( 'pointerdown', ( e ) => {
                    if ( e.pointerType !== 'mouse' ) return;
                    dragging = true;
                    captured = false;
                    moved    = false;
                    startX   = e.clientX;
                    startScroll = bar.scrollLeft;
                } );
                bar.addEventListener( 'pointermove', ( e ) => {
                    if ( ! dragging ) return;
                    const dx = e.clientX - startX;
                    if ( Math.abs( dx ) > 3 ) {
                        if ( ! moved ) {
                            moved = true;
                            bar.classList.add( 'is-dragging' );
                            try { bar.setPointerCapture( e.pointerId ); captured = true; } catch ( _ ) {}
                        }
                        bar.scrollLeft = startScroll - dx;
                    }
                } );
                const endDrag = ( e ) => {
                    if ( ! dragging ) return;
                    dragging = false;
                    bar.classList.remove( 'is-dragging' );
                    if ( captured ) {
                        try { bar.releasePointerCapture( e.pointerId ); } catch ( _ ) {}
                        captured = false;
                    }
                    // Sopprime il click sintetico sul segmento se l'utente ha trascinato
                    if ( moved ) {
                        const stop = ( ev ) => { ev.stopPropagation(); ev.preventDefault(); };
                        bar.addEventListener( 'click', stop, { capture: true, once: true } );
                    }
                };
                bar.addEventListener( 'pointerup', endDrag );
                bar.addEventListener( 'pointercancel', endDrag );

                // Salva scrollLeft nel ctx (debounced) → triggera savePrefs reattivo
                let saveT;
                bar.addEventListener( 'scroll', () => {
                    clearTimeout( saveT );
                    saveT = setTimeout( () => {
                        ctx.centuryScrollLeft = bar.scrollLeft;
                    }, 250 );
                }, { passive: true } );
            }

            // Click su card non-attiva → in primo piano (hit-test via bounding rect, le card non catturano per il 3D)
            document.querySelector( '.timeline-viewport' )?.addEventListener( 'click', ( e ) => {
                let card = e.target.closest( '.timeline-card' );
                if ( ! card ) {
                    const hits = Array.from( document.querySelectorAll( '.timeline-card:not(.is-hidden)' ) )
                        .filter( ( c ) => ! c.classList.contains( 'is-active' ) )
                        .filter( ( c ) => {
                            const r = c.getBoundingClientRect();
                            return e.clientX >= r.left && e.clientX <= r.right
                                && e.clientY >= r.top  && e.clientY <= r.bottom;
                        } )
                        .sort( ( a, b ) => parseInt( b.style.zIndex || '0', 10 ) - parseInt( a.style.zIndex || '0', 10 ) );
                    card = hits[ 0 ];
                }
                if ( ! card || card.classList.contains( 'is-active' ) ) return;
                e.preventDefault();
                const postId = parseInt( card.dataset.postId, 10 );
                if ( ! postId ) return;
                const idx = visiblePosts().findIndex( ( p ) => p.id === postId );
                if ( idx !== -1 ) ctx.activeIndex = idx;
            } );
        },

        // Lazy-load thumbnail: data-src→src solo a load completato, spinner sul wrapper via CSS
        lazyLoadImages() {
            const ctx = getContext();
            // Dipendenze reattive esplicite per il watch
            void ctx.activeCenturyMin;
            void ctx.activeCenturyMax;
            void ctx.filters.categoria;
            void ctx.filters.materiali;
            void ctx.filters.tecniche;

            requestAnimationFrame( () => {
                const imgs = document.querySelectorAll(
                    '.timeline-card:not(.is-hidden) .card-thumb img[data-src],' +
                    '.grid-card:not(.is-hidden) .gc-img img[data-src]'
                );
                imgs.forEach( ( img ) => {
                    const src = img.dataset.src;
                    if ( ! src ) return;
                    const wrapper = img.parentElement;
                    wrapper?.classList.add( 'is-loading' );
                    // data-src rimosso solo a load completato, fade-in CSS
                    const done = () => {
                        wrapper?.classList.remove( 'is-loading' );
                        img.removeAttribute( 'data-src' );
                    };
                    img.addEventListener( 'load',  done, { once: true } );
                    img.addEventListener( 'error', done, { once: true } );
                    img.src = src;
                } );
            } );
        },

        savePrefs() {
            const ctx   = getContext();
            const prefs = JSON.stringify( {
                centuryMin:  ctx.activeCenturyMin,
                centuryMax:  ctx.activeCenturyMax,
                viewMode:    ctx.viewMode,
                sortAsc:     ctx.sortAsc,
                activeIndex: ctx.activeIndex,
                categoria:   ctx.filters.categoria,
                materiali:   ctx.filters.materiali,
                tecniche:    ctx.filters.tecniche,
                centuryScrollLeft: ctx.centuryScrollLeft,
            } );
            document.cookie = 'tl_prefs=' + encodeURIComponent( prefs ) + '; path=/; SameSite=Lax';
        },
    },
} );
