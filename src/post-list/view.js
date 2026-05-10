import { store, getContext, getElement } from '@wordpress/interactivity';

store( 'post-list', {

    state: {

        // ── Post filtrati per i tre gruppi ACF ────────────────────────────────
        get filteredPosts() {
            const { posts, filters } = getContext();
            return posts.filter( ( post ) => {
                const matchCat = filters.categoria === 'all' || post.categoria === filters.categoria;
                const matchMat = filters.materiali === '' || post.materiale.includes( filters.materiali );
                const matchTec = filters.tecniche  === '' || post.tecnica.includes( filters.tecniche );
                return matchCat && matchMat && matchTec;
            } );
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
            const ctx     = getContext();
            const { state } = store( 'post-list' );
            const post    = ctx.posts?.[ ctx.postIndex ];
            if ( ! post ) return false;
            const filtered = state.filteredPosts;
            const idx = filtered.indexOf( post );
            return idx !== -1 && idx < ctx.visibleCount;
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

        // Pill disponibile se filterVal esiste in almeno un post filtrato dagli altri gruppi
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
    },

    callbacks: {

        init() {
            // Cattura il contesto reattivo durante l'esecuzione della direttiva.
            // Le proprietà di ctx sono Preact signals: leggibili e scrivibili
            // ovunque, anche dentro callback asincroni come IntersectionObserver.
            const ctx      = getContext();
            const root     = getElement().ref;
            const sentinel = root.querySelector( '.pl-sentinel' );
            if ( ! sentinel ) return;

            // Conteggio filtrato calcolato da ctx (getContext() non è
            // disponibile dentro callback asincroni).
            const filteredCount = () => ctx.posts.filter( ( post ) => {
                const { filters } = ctx;
                const matchCat = filters.categoria === 'all' || post.categoria === filters.categoria;
                const matchMat = filters.materiali === '' || post.materiale.includes( filters.materiali );
                const matchTec = filters.tecniche  === '' || post.tecnica.includes( filters.tecniche );
                return matchCat && matchMat && matchTec;
            } ).length;

            // IntersectionObserver notifica solo i cambi di stato: se dopo
            // l'incremento il sentinel resta intersecato (es. pochi post,
            // viewport alto), bisogna ricaricare in loop finché esce dal
            // viewport o non ci sono più post.
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

        // Lazy-load delle thumbnail: i post con <img data-src> non hanno src
        // e non vengono richiesti al browser. Quando cambiano filtri o
        // visibleCount (infinite scroll) le card non più nascoste si
        // caricano qui, con spinner sul wrapper finché arriva il bitmap.
        // data-src viene rimosso solo a load completato, così il CSS può
        // tenere opacity:0 finché l'immagine non è pronta (niente alt /
        // icona broken-image accanto allo spinner).
        lazyLoadImages() {
            const ctx = getContext();
            void ctx.visibleCount;
            void ctx.filters.categoria;
            void ctx.filters.materiali;
            void ctx.filters.tecniche;

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
