import { store, getContext, getElement } from '@wordpress/interactivity';
import {
    filterAndSortPosts,
    isValueAvailable as pureIsValueAvailable,
    cardOrder,
    isCardVisible,
    countFilteredPosts,
} from './logic';

store( 'post-list', {

    state: {

        // ── Post filtrati + ordinati per sort_key numerico ────────────────────
        get filteredPosts() {
            const { posts, filters, sortAsc } = getContext();
            return filterAndSortPosts( posts, { filters, sortAsc } );
        },

        get filteredCount() {
            return store( 'post-list' ).state.filteredPosts.length;
        },

        // ── Infinite scroll ───────────────────────────────────────────────────
        get hasMore() {
            return store( 'post-list' ).state.filteredPosts.length > getContext().visibleCount;
        },

        get showEndMessage() {
            const { state } = store( 'post-list' );
            return ! state.hasMore && state.filteredCount > 0;
        },

        get showEmptyMessage() {
            return store( 'post-list' ).state.filteredCount === 0;
        },

        // ── Visibilità singola card (contesto locale: postIndex) ───────────────
        get isVisible() {
            const ctx = getContext();
            const post = ctx.posts?.[ ctx.postIndex ];
            return isCardVisible( store( 'post-list' ).state.filteredPosts, post, ctx.visibleCount );
        },

        // ── Ordine CSS della card nel flex column (contesto locale: postIndex) ─
        get cardOrder() {
            const ctx  = getContext();
            const post = ctx.posts?.[ ctx.postIndex ];
            return cardOrder( store( 'post-list' ).state.filteredPosts, post );
        },

        // ── Ordinamento ───────────────────────────────────────────────────────
        get sortLabel() {
            return getContext().sortAsc ? 'Ordina ↑↓' : 'Ordina ↓↑';
        },

        // ── Filtri ────────────────────────────────────────────────────────────
        get filtersOpen() {
            return getContext().filtersOpen;
        },

        get filterToggleLabel() {
            return getContext().filtersOpen ? 'Filtra ↑' : 'Filtra ↓';
        },

        get hasActiveFilters() {
            const { filters } = getContext();
            return filters.categoria !== 'all' || filters.materiali !== '' || filters.tecniche !== '';
        },

        // ── Stato pill (contesto locale: filterGroup + filterVal) ─────────────
        get isPillActive() {
            const ctx = getContext();
            const { filterGroup, filterVal, filters } = ctx;
            if ( ! filterGroup ) return false;
            if ( filterGroup === 'categoria' ) return filters.categoria === filterVal;
            if ( filterGroup === 'materiali' ) return filters.materiali === filterVal;
            if ( filterGroup === 'tecniche' )  return filters.tecniche  === filterVal;
            return false;
        },

        // Pill disponibile se filterVal esiste in almeno un post degli altri gruppi
        get isValueAvailable() {
            const { posts, filters, filterGroup, filterVal } = getContext();
            return pureIsValueAvailable( posts, { filterGroup, filterVal, filters } );
        },

        get isPillDisabled() {
            return ! store( 'post-list' ).state.isValueAvailable;
        },

        // ── Etichette filtri attivi ───────────────────────────────────────────
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
    },

    actions: {

        toggleFilters() {
            getContext().filtersOpen = ! getContext().filtersOpen;
        },

        clearFilters() {
            const ctx = getContext();
            ctx.filters.categoria = 'all';
            ctx.filters.materiali = '';
            ctx.filters.tecniche  = '';
            ctx.visibleCount = 10;
        },

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
            ctx.visibleCount = 10;
        },

        clearCategoria() {
            const ctx = getContext();
            ctx.filters.categoria = 'all';
            ctx.visibleCount = 10;
        },

        clearMateriali() {
            const ctx = getContext();
            ctx.filters.materiali = '';
            ctx.visibleCount = 10;
        },

        clearTecniche() {
            const ctx = getContext();
            ctx.filters.tecniche = '';
            ctx.visibleCount = 10;
        },

        toggleSort() {
            const ctx = getContext();
            ctx.sortAsc = ! ctx.sortAsc;
            ctx.visibleCount = 10;
        },
    },

    callbacks: {

        init() {
            // ctx catturato qui per restare accessibile nei callback asincroni
            const ctx      = getContext();
            const root     = getElement().ref;
            const sentinel = root.querySelector( '.pl-sentinel' );
            if ( ! sentinel ) return;

            // Conteggio filtrato (getContext() non è disponibile in callback async)
            const filteredCount = () => countFilteredPosts( ctx.posts, ctx.filters );

            // Loop manuale: IntersectionObserver notifica solo i cambi di stato
            const loadMore = () => {
                if ( filteredCount() <= ctx.visibleCount ) return;
                ctx.visibleCount += 10;
                requestAnimationFrame( () => {
                    const rect = sentinel.getBoundingClientRect();
                    const inView = rect.top < ( window.innerHeight + 300 ) && rect.bottom > -300;
                    if ( inView ) loadMore();
                } );
            };

            const observer = new IntersectionObserver(
                ( entries ) => { if ( entries[ 0 ].isIntersecting ) loadMore(); },
                { rootMargin: '300px' }
            );

            observer.observe( sentinel );
        },

        // Lazy-load thumbnail: data-src→src solo dopo load completato (spinner via CSS)
        lazyLoadImages() {
            const ctx = getContext();
            if ( ! ctx ) return;
            void ctx.visibleCount;
            void ctx.sortAsc;
            void ctx.filters?.categoria;
            void ctx.filters?.materiali;
            void ctx.filters?.tecniche;

            requestAnimationFrame( () => {
                document.querySelectorAll(
                    '.pl-card:not(.pl-hidden) .pl-card-img img[data-src]'
                ).forEach( ( img ) => {
                    const src = img.dataset.src;
                    if ( ! src ) return;
                    const wrapper = img.parentElement;
                    wrapper?.classList.add( 'is-loading' );
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
    },
} );
