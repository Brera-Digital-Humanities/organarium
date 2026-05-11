<?php
// ── Attributi del blocco ──────────────────────────────────────────────────────
$post_source         = $attributes['postSource']         ?? 'all';
$selected_categories = array_filter( array_map( 'intval', $attributes['selectedCategories'] ?? [] ) );
$show_filters        = (bool) ( $attributes['showFilters'] ?? true );
$image_ratio         = ( ( $attributes['imageRatio'] ?? '4/3' ) === '3/4' ) ? '3/4' : '4/3';
$img_ratio_class     = $image_ratio === '3/4' ? ' pl-card-img--portrait' : '';

// ── Helper: tronca label dopo il primo " (" ───────────────────────────────────
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
} elseif ( $post_source === 'fixed_categories' && ! empty( $selected_categories ) ) {
    $query_args['tax_query'] = [ [
        'taxonomy' => 'category',
        'field'    => 'term_id',
        'terms'    => array_values( $selected_categories ),
        'operator' => 'IN',
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
            'ubicazione'=> get_field( 'ubicazione' ),
            'sort_key'  => (int) get_field( 'data_per_la_timeline' ),
            'categoria' => get_field( 'categorie_generali' ) ?? '',
            'materiale' => array_values( array_filter( $materiali ) ),
            'tecnica'   => array_values( array_filter( $tecniche ) ),
        ];
    }
    wp_reset_postdata();
}

usort( $posts_data, static fn( $a, $b ) => $a['sort_key'] <=> $b['sort_key'] );

// ── Map valore→label dai field object ACF ────────────────────────────────────
$acf_choices = static function ( string $field_name, $post_id ): array {
    if ( ! function_exists( 'get_field_object' ) || ! $post_id ) return [];
    $obj = get_field_object( $field_name, $post_id );
    return ( is_array( $obj ) && ! empty( $obj['choices'] ) ) ? $obj['choices'] : [];
};

$cat_choices = $acf_choices( 'categorie_generali', $first_post_id );
$mat_choices = $acf_choices( 'materiale', $first_post_id );
$tec_choices = $acf_choices( 'tecniche', $first_post_id );

// ── Opzioni filtro ────────────────────────────────────────────────────────────
$unique_vals = static function ( array $data, string $key ): array {
    return array_values( array_unique( array_filter( array_column( $data, $key ) ) ) );
};

$unique_multi = static function ( array $data, string $key ): array {
    $all = array_merge( ...( array_column( $data, $key ) ?: [[]] ) );
    return array_values( array_unique( array_filter( $all ) ) );
};

$all_cat = array_map(
    static function ( $v ) use ( $cat_choices, $short_label ) {
        return [ 'value' => $v, 'label' => $short_label( $cat_choices[ $v ] ?? $v ) ];
    },
    $unique_vals( $posts_data, 'categoria' )
);

$all_mat = array_map(
    static function ( $v ) use ( $mat_choices ) {
        return [ 'value' => $v, 'label' => $mat_choices[ $v ] ?? $v ];
    },
    $unique_multi( $posts_data, 'materiale' )
);

$all_tec = array_map(
    static function ( $v ) use ( $tec_choices ) {
        return [ 'value' => $v, 'label' => $tec_choices[ $v ] ?? $v ];
    },
    $unique_multi( $posts_data, 'tecnica' )
);

// ── Context Interactivity API ─────────────────────────────────────────────────
$context = [
    'posts'        => $posts_data,
    'visibleCount' => 10,
    'filtersOpen'  => false,
    'filters'      => [
        'categoria' => 'all',
        'materiali' => '',
        'tecniche'  => '',
    ],
    'catOptions'   => array_values( $all_cat ),
    'matOptions'   => array_values( $all_mat ),
    'tecOptions'   => array_values( $all_tec ),
];
?>

<div
    data-wp-interactive="post-list"
    data-wp-context="<?php echo esc_attr( wp_json_encode( $context ) ); ?>"
    data-wp-init="callbacks.init"
    data-wp-watch--lazy="callbacks.lazyLoadImages"
    <?php echo get_block_wrapper_attributes( [ 'class' => 'pl-wrap' ] ); ?>
>

    <!-- ═══ BARRA SUPERIORE ═══ -->
    <div class="pl-bar<?php echo $show_filters ? '' : ' pl-bar--no-filters'; ?>">
        <?php if ( $show_filters ) : ?>
        <button class="pl-btn"
                data-wp-on--click="actions.toggleFilters"
                data-wp-text="state.filterToggleLabel">Filtra ↓</button>
        <?php endif; ?>
        <span class="pl-counter">
            <span data-wp-text="state.filteredCount"><?php echo count( $posts_data ); ?></span>&nbsp;risultati
        </span>
    </div>

    <!-- ═══ PANNELLO FILTRI (a scomparsa) ═══ -->
    <?php if ( $show_filters ) : ?>
    <div class="pl-filters" data-wp-class--open="state.filtersOpen">
        <div class="pl-filter-row">

            <?php if ( ! empty( $all_cat ) ) : ?>
            <div class="pl-filter-col pl-filter-col--accent-4">
                <h5 class="pl-filter-label">Categoria</h5>
                <div class="pl-pills">
                    <button class="pl-pill"
                            data-wp-class--active="!state.hasActiveFilters"
                            data-wp-on--click="actions.clearFilters">Tutte</button>
                    <?php foreach ( $all_cat as $opt ) : ?>
                    <button class="pl-pill"
                            data-wp-context="<?php echo esc_attr( wp_json_encode( [ 'filterGroup' => 'categoria', 'filterVal' => $opt['value'] ] ) ); ?>"
                            data-wp-class--active="state.isPillActive"
                            data-wp-class--disabled="state.isPillDisabled"
                            data-wp-bind--disabled="state.isPillDisabled"
                            data-wp-on--click="actions.togglePill"><?php echo esc_html( $opt['label'] ); ?></button>
                    <?php endforeach; ?>
                </div>
            </div>
            <?php endif; ?>

            <?php if ( ! empty( $all_mat ) ) : ?>
            <div class="pl-filter-col pl-filter-col--accent-1">
                <h5 class="pl-filter-label">Materiale</h5>
                <div class="pl-pills">
                    <?php foreach ( $all_mat as $opt ) : ?>
                    <button class="pl-pill"
                            data-wp-context="<?php echo esc_attr( wp_json_encode( [ 'filterGroup' => 'materiali', 'filterVal' => $opt['value'] ] ) ); ?>"
                            data-wp-class--active="state.isPillActive"
                            data-wp-class--disabled="state.isPillDisabled"
                            data-wp-bind--disabled="state.isPillDisabled"
                            data-wp-on--click="actions.togglePill"><?php echo esc_html( $opt['label'] ); ?></button>
                    <?php endforeach; ?>
                </div>
            </div>
            <?php endif; ?>

            <?php if ( ! empty( $all_tec ) ) : ?>
            <div class="pl-filter-col pl-filter-col--accent-2">
                <h5 class="pl-filter-label">Tecnica</h5>
                <div class="pl-pills">
                    <?php foreach ( $all_tec as $opt ) : ?>
                    <button class="pl-pill"
                            data-wp-context="<?php echo esc_attr( wp_json_encode( [ 'filterGroup' => 'tecniche', 'filterVal' => $opt['value'] ] ) ); ?>"
                            data-wp-class--active="state.isPillActive"
                            data-wp-class--disabled="state.isPillDisabled"
                            data-wp-bind--disabled="state.isPillDisabled"
                            data-wp-on--click="actions.togglePill"><?php echo esc_html( $opt['label'] ); ?></button>
                    <?php endforeach; ?>
                </div>
            </div>
            <?php endif; ?>

        </div>
    </div><!-- .pl-filters -->

    <div class="pl-divider"></div>

    <!-- ═══ FILTRI ATTIVI ═══ -->
    <div class="pl-active-filters" data-wp-class--pl-hidden="!state.hasActiveFilters">
        <button class="pl-btn pl-btn--link"
                data-wp-on--click="actions.clearFilters">× Azzera filtri</button>
        <button class="pl-active-tag pl-filter-col--accent-4"
                data-wp-class--pl-hidden="!state.hasCategoriaFilter"
                data-wp-on--click="actions.clearCategoria">
            <span data-wp-text="state.activeCategoriaLabel"></span> ×
        </button>
        <button class="pl-active-tag pl-filter-col--accent-1"
                data-wp-class--pl-hidden="!state.hasMaterialiFilter"
                data-wp-on--click="actions.clearMateriali">
            <span data-wp-text="state.activeMaterialiLabel"></span> ×
        </button>
        <button class="pl-active-tag pl-filter-col--accent-2"
                data-wp-class--pl-hidden="!state.hasTecnicheFilter"
                data-wp-on--click="actions.clearTecniche">
            <span data-wp-text="state.activeTecnicheLabel"></span> ×
        </button>
    </div>
    <?php endif; // show_filters ?>

    <!-- ═══ LISTA POST ═══ -->
    <div class="pl-list">
        <?php foreach ( $posts_data as $index => $post ) : ?>
        <article
            class="pl-card"
            data-wp-context="<?php echo esc_attr( wp_json_encode( [ 'postIndex' => $index ] ) ); ?>"
            data-wp-class--pl-hidden="!state.isVisible"
        >
            <a class="pl-card-link" href="<?php echo esc_url( $post['url'] ); ?>">
                <div class="pl-card-img<?php echo $img_ratio_class; echo empty( $post['thumb'] ) ? ' pl-card-img--ph' : ''; ?>">
                    <?php if ( ! empty( $post['thumb'] ) ) : ?>
                    <img data-src="<?php echo esc_url( $post['thumb'] ); ?>"
                         alt="<?php echo esc_attr( $post['title'] ); ?>"
                         class="pl-card-img-inner"
                         loading="lazy">
                    <?php endif; ?>
                </div>
                <div class="pl-card-body">
                    <?php if ( ! empty( $post['data'] ) || ! empty( $post['ubicazione'] ) ) : ?>
                    <div class="pl-card-meta">
                        <?php if ( ! empty( $post['data'] ) ) : ?>
                        <div class="pl-card-meta__row"><span class="pl-card-meta__label">Data:</span><?php echo esc_html( $post['data'] ); ?></div>
                        <?php endif; ?>
                        <?php if ( ! empty( $post['ubicazione'] ) ) : ?>
                        <div class="pl-card-meta__row"><span class="pl-card-meta__label">Ubicazione:</span><?php echo esc_html( $post['ubicazione'] ); ?></div>
                        <?php endif; ?>
                    </div>
                    <?php endif; ?>
                    <h3 class="pl-card-title"><?php echo esc_html( $post['title'] ); ?></h3>
                    <?php if ( ! empty( $post['excerpt'] ) ) : ?>
                    <p class="pl-card-excerpt"><?php echo esc_html( $post['excerpt'] ); ?></p>
                    <?php endif; ?>
                    <?php if ( ! empty( $post['categoria'] ) ) : ?>
                    <span class="pl-card-tag"><?php echo esc_html( isset( $cat_choices[ $post['categoria'] ] ) ? $short_label( $cat_choices[ $post['categoria'] ] ) : $post['categoria'] ); ?></span>
                    <?php endif; ?>
                </div>
            </a>
        </article>
        <?php endforeach; ?>
    </div><!-- .pl-list -->

    <!-- ═══ SENTINEL (infinite scroll) ═══ -->
    <div class="pl-sentinel" aria-hidden="true"></div>

    <!-- ═══ MESSAGGI STATO ═══ -->
    <p class="pl-status-msg" data-wp-class--pl-hidden="!state.showEndMessage">Fine dei risultati</p>
    <p class="pl-status-msg" data-wp-class--pl-hidden="!state.showEmptyMessage">Nessun risultato trovato</p>

</div><!-- .pl-wrap -->
