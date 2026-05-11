<?php
// ── Attributi del blocco ──────────────────────────────────────────────────────
$post_source        = $attributes['postSource']        ?? 'all';
$allowed_views      = $attributes['allowedViews']      ?? 'both';
$selected_category  = (int) ( $attributes['selectedCategory'] ?? 0 );
$show_scrubber      = (bool) ( $attributes['showScrubber']    ?? true );

// Tronca la descrizione tra parentesi dalla label
$short_label = static function ( string $label ): string {
    $pos = strpos( $label, ' (' );
    return $pos !== false ? trim( substr( $label, 0, $pos ) ) : trim( $label );
};

// ── Query posts ───────────────────────────────────────────────────────────────
$query_args = [
    'post_type'      => 'post',
    'posts_per_page' => -1,
    'orderby'        => 'date',
    'order'          => 'ASC',
];

if ( $post_source === 'current_category' ) {
    $term = get_queried_object();
    if ( $term instanceof WP_Term ) {
        $query_args['tax_query'] = [ [
            'taxonomy' => $term->taxonomy,
            'field'    => 'term_id',
            'terms'    => $term->term_id,
        ] ];
    }
} elseif ( $post_source === 'fixed_category' && $selected_category > 0 ) {
    $query_args['tax_query'] = [ [
        'taxonomy' => 'category',
        'field'    => 'term_id',
        'terms'    => $selected_category,
    ] ];
}

$query = new WP_Query( $query_args );

$posts_data    = [];
$first_post_id = false;

if ( $query->have_posts() ) {
    while ( $query->have_posts() ) {
        $query->the_post();
        if ( ! $first_post_id ) $first_post_id = get_the_ID();
        $materiali = (array) get_field( 'materiale' );
        $tecniche  = (array) get_field( 'tecniche' );

        $posts_data[] = [
            'id'        => get_the_ID(),
            'url'       => get_permalink(),
            'title'     => get_the_title(),
            'excerpt'   => get_the_excerpt(),
            'thumb'     => get_the_post_thumbnail_url( get_the_ID(), 'medium' ),
            'data'      => get_field( 'data' ),
            'sort_key'  => (int) get_field( 'data_per_la_timeline' ),
            'categoria' => get_field( 'categorie_generali' ) ?? '',
            'materiale' => array_values( array_filter( $materiali ) ),
            'tecnica'   => array_values( array_filter( $tecniche ) ),
        ];
    }
    wp_reset_postdata();
}

// Map valore→label ACF — richiede $post_id reale (su pagine statiche $post globale = page senza i custom field)
$acf_choices = static function ( string $field_name, $post_id ): array {
    if ( ! function_exists( 'get_field_object' ) ) return [];
    $obj = get_field_object( $field_name, $post_id );
    return ( is_array( $obj ) && ! empty( $obj['choices'] ) ) ? $obj['choices'] : [];
};

$cat_choices = $acf_choices( 'categorie_generali', $first_post_id );
$mat_choices = $acf_choices( 'materiale', $first_post_id );
$tec_choices = $acf_choices( 'tecniche', $first_post_id );

// ── Opzioni filtro: array di {value, label} ───────────────────────────────────
$unique_vals = static function ( array $posts_data, string $key ): array {
    return array_values( array_unique( array_filter( array_column( $posts_data, $key ) ) ) );
};

$unique_multi = static function ( array $posts_data, string $key ): array {
    $all = array_merge( ...( array_column( $posts_data, $key ) ?: [[]] ) );
    return array_values( array_unique( array_filter( $all ) ) );
};

// Categorie — label breve (senza la descrizione tra parentesi)
$all_cat = array_map(
    static function ( $v ) use ( $cat_choices, $short_label ) {
        $full = $cat_choices[ $v ] ?? $v;
        return [ 'value' => $v, 'label' => $short_label( $full ) ];
    },
    $unique_vals( $posts_data, 'categoria' )
);

// Materiali — label diretta
$all_mat = array_map(
    static function ( $v ) use ( $mat_choices ) {
        return [ 'value' => $v, 'label' => $mat_choices[ $v ] ?? $v ];
    },
    $unique_multi( $posts_data, 'materiale' )
);

// Tecniche — label diretta
$all_tec = array_map(
    static function ( $v ) use ( $tec_choices ) {
        return [ 'value' => $v, 'label' => $tec_choices[ $v ] ?? $v ];
    },
    $unique_multi( $posts_data, 'tecnica' )
);

// Century segments — 17 segmenti larghezza uguale (200 a.C.→0, 0→100, poi 100→1500 a passi di 100)
$_build_seg = static function ( int $seg_min, int $seg_max, string $label, int $units ) use ( $posts_data ): array {
    $dots_by_x   = [];
    $bucket_size = 5;
    foreach ( $posts_data as $pi => $post ) {
        $sk = (int) $post['sort_key'];
        if ( $sk >= $seg_min && $sk < $seg_max ) {
            $bucket_start = $seg_min + intdiv( $sk - $seg_min, $bucket_size ) * $bucket_size;
            $x = (int) round( ( $bucket_start - $seg_min ) / ( $seg_max - $seg_min ) * 100 );
            $x = max( 0, min( 95, $x ) );
            $dots_by_x[ $x ][] = $pi;
        }
    }
    ksort( $dots_by_x );
    return compact( 'seg_min', 'seg_max', 'label', 'units', 'dots_by_x' );
};

$century_segments   = [];
$century_segments[] = $_build_seg( -200, 0, '200 a.C.', 1 );
$century_segments[] = $_build_seg( 0, 100, '0', 1 );
for ( $s = 100; $s <= 1500; $s += 100 ) {
    $century_segments[] = $_build_seg( $s, $s + 100, (string) $s, 1 );
}

// Max stack di dots per ogni segmento (altezza indipendente) + conteggio totale dot
foreach ( $century_segments as &$_seg ) {
    $_seg_max = 1;
    $_seg_total = 0;
    foreach ( $_seg['dots_by_x'] as $_indices ) {
        $c = count( $_indices );
        $_seg_total += $c;
        if ( $c > $_seg_max ) $_seg_max = $c;
    }
    $_seg['max_stack']  = $_seg_max;
    $_seg['total_dots'] = $_seg_total;
}
unset( $_seg );

// Preferenze dal cookie di sessione
$_tl_prefs = [];
if ( ! empty( $_COOKIE['tl_prefs'] ) ) {
    $decoded = json_decode( wp_unslash( $_COOKIE['tl_prefs'] ), true );
    if ( is_array( $decoded ) ) $_tl_prefs = $decoded;
}

$_pref_century_min  = isset( $_tl_prefs['centuryMin'] )  ? (int)  $_tl_prefs['centuryMin']  : -200;
$_pref_century_max  = isset( $_tl_prefs['centuryMax'] )  ? (int)  $_tl_prefs['centuryMax']  : 0;
$_pref_sort_asc     = isset( $_tl_prefs['sortAsc'] )     ? (bool) $_tl_prefs['sortAsc']     : true;
$_pref_active_index = isset( $_tl_prefs['activeIndex'] ) ? (int)  $_tl_prefs['activeIndex'] : 0;
$_pref_categoria   = sanitize_text_field( $_tl_prefs['categoria'] ?? 'all' );
$_pref_materiali   = sanitize_text_field( $_tl_prefs['materiali'] ?? '' );
$_pref_tecniche    = sanitize_text_field( $_tl_prefs['tecniche']  ?? '' );

// viewMode dal cookie rispettato solo se permesso dal blocco
if ( $allowed_views === 'timeline' ) {
    $_pref_view_mode = 'timeline';
} elseif ( $allowed_views === 'grid' ) {
    $_pref_view_mode = 'grid';
} elseif ( in_array( $_tl_prefs['viewMode'] ?? '', [ 'timeline', 'grid' ], true ) ) {
    $_pref_view_mode = $_tl_prefs['viewMode'];
} else {
    $_pref_view_mode = 'timeline';
}

// ── Context Interactivity API ─────────────────────────────────────────────────
$context = [
    'posts'            => $posts_data,
    'activeIndex'      => $_pref_active_index,
    'viewMode'         => $_pref_view_mode,
    'filtersOpen'      => false,
    'sortAsc'          => $_pref_sort_asc,
    'activeCenturyMin' => $_pref_century_min,
    'activeCenturyMax' => $_pref_century_max,
    'filters'          => [
        'categoria' => $_pref_categoria,
        'materiali' => $_pref_materiali,
        'tecniche'  => $_pref_tecniche,
    ],
    'catOptions'  => array_values( $all_cat ),
    'matOptions'  => array_values( $all_mat ),
    'tecOptions'  => array_values( $all_tec ),
];
?>

<div
    data-wp-interactive="timeline-3d"
    data-wp-context="<?php echo esc_attr( wp_json_encode( $context ) ); ?>"
    data-wp-init="callbacks.init"
    data-wp-watch--save="callbacks.savePrefs"
    data-wp-watch--lazy="callbacks.lazyLoadImages"
    <?php echo get_block_wrapper_attributes( [ 'class' => 'tl-wrap' ] ); ?>
>

    <!-- ═══ BARRA SUPERIORE ═══ -->
    <div class="tl-bar">

        <div class="tl-bar-left">
            <button class="tl-btn"
                    data-wp-on--click="actions.toggleFilters"
                    data-wp-text="state.filterToggleLabel">Filtra ↓</button>
        </div>

        <div class="tl-bar-right">
            <button class="tl-btn"
                    data-wp-on--click="actions.toggleSort"
                    data-wp-text="state.sortLabel">Ordina ↑↓</button>
            <?php if ( $allowed_views === 'both' ) : ?>
            <div class="view-toggle" role="group" aria-label="Vista">
                <button class="v-btn"
                        data-wp-on--click="actions.setViewTimeline"
                        data-wp-class--active="state.isViewTimeline"
                        title="Vista timeline">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 -960 960 960" fill="currentColor">
                        <path d="M240-280h240v-80H240v80Zm120-160h240v-80H360v80Zm120-160h240v-80H480v80ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z"/>
                    </svg>
                    <span class="sr-only">Timeline</span>
                </button>
                <button class="v-btn"
                        data-wp-on--click="actions.setViewGrid"
                        data-wp-class--active="state.isViewGrid"
                        title="Vista griglia">
                    <svg width="16" height="16" fill="none" viewBox="0 0 16 16" aria-hidden="true">
                        <rect x="2" y="2" width="5" height="5" rx="1" fill="currentColor"/>
                        <rect x="9" y="2" width="5" height="5" rx="1" fill="currentColor"/>
                        <rect x="2" y="9" width="5" height="5" rx="1" fill="currentColor"/>
                        <rect x="9" y="9" width="5" height="5" rx="1" fill="currentColor"/>
                    </svg>
                    <span class="sr-only">Griglia</span>
                </button>
            </div>
            <?php endif; ?>
        </div>

    </div><!-- .tl-bar -->

    <!-- ═══ PANNELLO FILTRI (a scomparsa) ═══ -->
    <div class="tl-filters" data-wp-class--open="state.filtersOpen">
        <div class="filter-row">

            <?php if ( ! empty( $all_cat ) ) : ?>
            <div class="filter-col filter-col--accent-4">
                <h5 class="filter-label">Categoria</h5>
                <div class="pills">
                    <button class="pill"
                            data-wp-class--active="!state.hasActiveFilters"
                            data-wp-on--click="actions.clearFilters">Tutte</button>
                    <?php foreach ( $all_cat as $opt ) : ?>
                    <button class="pill"
                            data-wp-context="<?php echo esc_attr( wp_json_encode( [ 'filterGroup' => 'categoria', 'filterVal' => $opt['value'] ] ) ); ?>"
                            data-wp-class--active="state.isPillActive"
                            data-wp-class--disabled="state.isPillDisabled"
                            data-wp-class--invisible="state.isPillInvisible"
                            data-wp-bind--disabled="state.isPillUnavailable"
                            data-wp-on--click="actions.togglePill"><?php echo esc_html( $opt['label'] ); ?></button>
                    <?php endforeach; ?>
                </div>
            </div>
            <?php endif; ?>

            <?php if ( ! empty( $all_mat ) ) : ?>
            <div class="filter-col filter-col--accent-1">
                <h5 class="filter-label">Materiale</h5>
                <div class="pills">
                    <?php foreach ( $all_mat as $opt ) : ?>
                    <button class="pill"
                            data-wp-context="<?php echo esc_attr( wp_json_encode( [ 'filterGroup' => 'materiali', 'filterVal' => $opt['value'] ] ) ); ?>"
                            data-wp-class--active="state.isPillActive"
                            data-wp-class--disabled="state.isPillDisabled"
                            data-wp-class--invisible="state.isPillInvisible"
                            data-wp-bind--disabled="state.isPillUnavailable"
                            data-wp-on--click="actions.togglePill"><?php echo esc_html( $opt['label'] ); ?></button>
                    <?php endforeach; ?>
                </div>
            </div>
            <?php endif; ?>

            <?php if ( ! empty( $all_tec ) ) : ?>
            <div class="filter-col filter-col--accent-2">
                <h5 class="filter-label">Tecnica</h5>
                <div class="pills">
                    <?php foreach ( $all_tec as $opt ) : ?>
                    <button class="pill"
                            data-wp-context="<?php echo esc_attr( wp_json_encode( [ 'filterGroup' => 'tecniche', 'filterVal' => $opt['value'] ] ) ); ?>"
                            data-wp-class--active="state.isPillActive"
                            data-wp-class--disabled="state.isPillDisabled"
                            data-wp-class--invisible="state.isPillInvisible"
                            data-wp-bind--disabled="state.isPillUnavailable"
                            data-wp-on--click="actions.togglePill"><?php echo esc_html( $opt['label'] ); ?></button>
                    <?php endforeach; ?>
                </div>
            </div>
            <?php endif; ?>

        </div>
    </div><!-- .tl-filters -->

    <div class="tl-divider"></div>

    <!-- ═══ FILTRI ATTIVI ═══ -->
    <div class="tl-active-filters">
    <p class="tl-counter">
            <span data-wp-text="state.counterCurrent">1</span>&thinsp;/&thinsp;<span data-wp-text="state.visibleCount"><?php echo count( $posts_data ); ?></span>
        </p>
        <span class="tl-current-century">Anni: <span data-wp-text="state.activeCenturyLabel"></span></span>
        <button class="tl-btn tl-btn--link"
                data-wp-class--tl-hidden="!state.hasActiveFilters"
                data-wp-on--click="actions.clearFilters">× Azzera filtri</button>
        <button class="active-filter-tag filter-col--accent-4"
                data-wp-class--tl-hidden="!state.hasCategoriaFilter"
                data-wp-on--click="actions.clearCategoria">
            <span data-wp-text="state.activeCategoriaLabel"></span> ×
        </button>
        <button class="active-filter-tag filter-col--accent-1"
                data-wp-class--tl-hidden="!state.hasMaterialiFilter"
                data-wp-on--click="actions.clearMateriali">
            <span data-wp-text="state.activeMaterialiLabel"></span> ×
        </button>
        <button class="active-filter-tag filter-col--accent-2"
                data-wp-class--tl-hidden="!state.hasTecnicheFilter"
                data-wp-on--click="actions.clearTecniche">
            <span data-wp-text="state.activeTecnicheLabel"></span> ×
        </button>
    </div>

    <!-- ═══ CENTURY BAR ═══ -->
    <div class="tl-century-bar">
        <?php foreach ( $century_segments as $seg ) : ?>
        <?php $_is_empty = $seg['total_dots'] === 0; ?>
        <button class="century-seg<?php echo $_is_empty ? ' is-empty' : ''; ?>"
                type="button"
                <?php disabled( $_is_empty ); ?>
                style="--tl-seg-stack:<?php echo (int) $seg['max_stack']; ?>"
                data-wp-context="<?php echo esc_attr( wp_json_encode( [ 'segMin' => $seg['seg_min'], 'segMax' => $seg['seg_max'] ] ) ); ?>"
                data-wp-class--is-active="state.isCenturyActive"
                data-wp-on--click="actions.setCentury">
            <div class="century-seg__head">
                <span class="century-seg__label"><?php echo esc_html( $seg['label'] ); ?></span>
            </div>
            <div class="century-seg__dots">
                <?php foreach ( $seg['dots_by_x'] as $x_pct => $indices ) : ?>
                    <?php foreach ( $indices as $stack_i => $pi ) : ?>
                    <div class="century-dot"
                         data-wp-context="<?php echo esc_attr( wp_json_encode( [ 'postIndex' => $pi ] ) ); ?>"
                         data-wp-class--is-active="state.isDotActive"
                         style="left:<?php echo $x_pct; ?>%;--tl-stack-i:<?php echo (int) $stack_i; ?>"></div>
                    <?php endforeach; ?>
                <?php endforeach; ?>
            </div>
        </button>
        <?php endforeach; ?>
    </div>

    <?php if ( $allowed_views !== 'grid' ) : ?>
    <!-- ═══ VISTA TIMELINE (carousel 3D, 5 card) ═══ -->
    <div class="timeline-view" data-wp-class--show="state.isViewTimeline">

        

        <div class="timeline-viewport">
            <div class="cards-container">

                <?php foreach ( $posts_data as $index => $post ) : ?>
                <article
                    class="timeline-card"
                    data-post-id="<?php echo (int) $post['id']; ?>"
                    data-wp-context="<?php echo esc_attr( wp_json_encode( [ 'postIndex' => $index ] ) ); ?>"
                    data-wp-class--is-hidden="!state.isVisible"
                    data-wp-class--is-active="state.isActive"
                    data-wp-class--is-prev="state.isPrev"
                    data-wp-class--is-next="state.isNext"
                    data-wp-class--is-prev2="state.isPrev2"
                    data-wp-class--is-next2="state.isNext2"
                    data-wp-style--z-index="state.zIndex"
                >
                    <div class="card-inner">
                        <a class="card-link" href="<?php echo esc_url( $post['url'] ); ?>">
                        <?php if ( ! empty( $post['thumb'] ) ) : ?>
                        <div class="card-thumb">
                            <img data-src="<?php echo esc_url( $post['thumb'] ); ?>"
                                 alt="<?php echo esc_attr( $post['title'] ); ?>"
                                 loading="lazy">
                        </div>
                        <?php endif; ?>
                        <?php if ( ! empty( $post['data'] ) ) : ?>
                        <time class="card-date">DATA: <?php echo esc_html( $post['data'] ); ?></time>
                        <?php endif; ?>
                        <h3 class="card-title"><?php echo esc_html( $post['title'] ); ?></h3>
                        </a>
                        <?php if ( ! empty( $post['excerpt'] ) ) : ?>
                        <p class="card-excerpt"><?php echo esc_html( $post['excerpt'] ); ?></p>
                        <?php endif; ?>
                        <?php if ( ! empty( $post['categoria'] ) ) : ?>
                        <span class="card-tag"><?php echo esc_html( $cat_choices[ $post['categoria'] ] ? $short_label( $cat_choices[ $post['categoria'] ] ) : $post['categoria'] ); ?></span>
                        <?php endif; ?>
                    </div>
                </article>
                <?php endforeach; ?>

            </div><!-- .cards-container -->
        </div><!-- .timeline-viewport -->

        <nav class="nav-buttons" aria-label="Navigazione timeline"
                data-wp-class--tl-hidden="!state.showNavBtn">
            <button class="nav-btn nav-btn--prev"
                    data-wp-on--click="actions.prev"
                    data-wp-bind--disabled="state.isFirst">
                <span aria-hidden="true">
                    <svg width="24px" height="24px" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 20L7 12L15 4" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>             
                </span>
                <span class="sr-only">Precedente</span>
            </button>
            <button class="nav-btn nav-btn--next"
                    data-wp-on--click="actions.next"
                    data-wp-bind--disabled="state.isLast">
                <span aria-hidden="true">
                <svg width="24px" height="24px" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 20L17 12L9 4" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                </span>
                <span class="sr-only">Successivo</span>
            </button>
        </nav>

        <!-- ═══ SCRUBBER ═══ -->
        <?php if ( $show_scrubber ) : ?>
        <div class="tl-scrubber"
             data-wp-class--tl-hidden="!state.showScrubber"
             data-wp-on--pointerdown="actions.scrubberPointerDown"
             data-wp-on--pointermove="actions.scrubberPointerMove">
            <div class="scrubber-track">

                <?php foreach ( $posts_data as $index => $post ) : ?>
                <button class="scrubber-marker"
                        data-wp-context="<?php echo esc_attr( wp_json_encode( [ 'postIndex' => $index ] ) ); ?>"
                        data-wp-class--is-hidden="!state.isVisible"
                        data-wp-class--is-active="state.isActive"
                        data-wp-style--left="state.markerLeft"
                        data-wp-on--click="actions.goToMarker"
                        aria-label="<?php echo esc_attr( $post['title'] ); ?>">
                    <span class="scrubber-marker__label" data-wp-text="state.markerLabel"></span>
                </button>
                <?php endforeach; ?>

                <div class="scrubber-thumb"
                     data-wp-style--left="state.scrubberThumbLeft"></div>

            </div><!-- .scrubber-track -->
        </div><!-- .tl-scrubber -->
        <?php endif; ?>

    </div><!-- .timeline-view -->
    <?php endif; ?>

    <?php if ( $allowed_views !== 'timeline' ) : ?>
    <!-- ═══ VISTA GRIGLIA ═══ -->
    <div class="grid-view" data-wp-class--show="state.isViewGrid">

        <?php foreach ( $posts_data as $index => $post ) : ?>
        <div class="grid-card"
             data-wp-context="<?php echo esc_attr( wp_json_encode( [ 'postIndex' => $index ] ) ); ?>"
             data-wp-class--is-hidden="!state.isVisible"
             data-wp-style--order="state.gridOrder">
            <a class="gc-link" href="<?php echo esc_url( $post['url'] ); ?>">
            <div class="gc-img<?php echo empty( $post['thumb'] ) ? ' gc-img--ph' : ''; ?>">
                <?php if ( ! empty( $post['thumb'] ) ) : ?>
                <img data-src="<?php echo esc_url( $post['thumb'] ); ?>"
                     alt="<?php echo esc_attr( $post['title'] ); ?>"
                     class="gc-img-inner"
                     loading="lazy">
                <?php endif; ?>
            </div>
            <div class="gc-body">
                <?php if ( ! empty( $post['data'] ) ) : ?>
                <div class="gc-year">DATA: <?php echo esc_html( $post['data'] ); ?></div>
                <?php endif; ?>
                <div class="gc-title"><?php echo esc_html( $post['title'] ); ?></div>
                <?php if ( ! empty( $post['excerpt'] ) ) : ?>
                        <p class="gc-excerpt"><?php echo esc_html( $post['excerpt'] ); ?></p>
                <?php endif; ?>
                <?php if ( ! empty( $post['categoria'] ) ) : ?>
                <div class="gc-tags"><span class="gc-tag"><?php echo esc_html( isset( $cat_choices[ $post['categoria'] ] ) ? $short_label( $cat_choices[ $post['categoria'] ] ) : $post['categoria'] ); ?></span></div>
                <?php endif; ?>
            </div>
            </a>
        </div>
        <?php endforeach; ?>

    </div><!-- .grid-view -->
    <?php endif; ?>

</div><!-- .tl-wrap -->
