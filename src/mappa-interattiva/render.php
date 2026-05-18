<?php
$map_height = (int) ( $attributes['mapHeight'] ?? 520 );
$map_style  = in_array( $attributes['mapStyle'] ?? '', [ 'natural', 'warm', 'teal', 'dark' ], true )
              ? $attributes['mapStyle'] : 'natural';

// Tronca descrizione tra parentesi dalla label
$short_label = static function ( string $label ): string {
    $pos = strpos( $label, ' (' );
    return $pos !== false ? trim( substr( $label, 0, $pos ) ) : trim( $label );
};

// Query posts
$query_args = [
    'post_type'      => 'post',
    'posts_per_page' => -1,
    'orderby'        => 'date',
    'order'          => 'ASC',
];

$query         = function_exists( 'jerus_query_with_lang_fallback' )
    ? jerus_query_with_lang_fallback( $query_args )
    : new WP_Query( $query_args );
$posts_data    = [];
$first_post_id = false;

if ( $query->have_posts() ) {
    while ( $query->have_posts() ) {
        $query->the_post();
        $pid = get_the_ID();
        if ( ! $first_post_id ) $first_post_id = $pid;

        $pos_raw = get_post_meta( $pid, 'posizione_per_mappa', true );
        if ( empty( $pos_raw ) ) continue;

        $pos = is_string( $pos_raw ) ? json_decode( $pos_raw, true ) : (array) $pos_raw;
        if ( ! is_array( $pos ) ) continue;

        if ( ! empty( $pos['markers'] ) && is_array( $pos['markers'] ) ) {
            $lat = (float) ( $pos['markers'][0]['lat'] ?? 0 );
            $lng = (float) ( $pos['markers'][0]['lng'] ?? 0 );
        } elseif ( isset( $pos['lat'], $pos['lng'] ) ) {
            $lat = (float) $pos['lat'];
            $lng = (float) $pos['lng'];
        } elseif ( isset( $pos[0] ) && is_array( $pos[0] ) ) {
            $lat = (float) ( $pos[0][0] ?? $pos[0]['lat'] ?? 0 );
            $lng = (float) ( $pos[0][1] ?? $pos[0]['lng'] ?? 0 );
        } else {
            continue;
        }

        if ( ! $lat && ! $lng ) continue;

        $materiali = (array) get_field( 'materiale', $pid );
        $tecniche  = (array) get_field( 'tecniche',  $pid );

        $data_raw = get_field( 'data_per_la_timeline', $pid );
        $posts_data[] = [
            'lat'              => $lat,
            'lng'              => $lng,
            'url'              => get_permalink(),
            'title'            => get_the_title(),
            'thumb'            => get_the_post_thumbnail_url( $pid, 'medium' ) ?: '',
            'ubicazione'       => get_field( 'ubicazione', $pid ) ?: '',
            'excerpt'          => html_entity_decode( get_the_excerpt( $pid ), ENT_QUOTES | ENT_HTML5, 'UTF-8' ) ?: '',
            'categoria'        => get_field( 'categorie_generali', $pid ) ?? '',
            'materiale'        => array_values( array_filter( $materiali ) ),
            'tecnica'          => array_values( array_filter( $tecniche ) ),
            'data_per_timeline' => $data_raw ? (int) $data_raw : 0,
        ];
    }
    wp_reset_postdata();
}

// Map valore→label: usa l'helper i18n del theme (sempre coerente con la locale
// corrente, indipendente da ACF cache).
$cat_choices = function_exists( 'jerus_get_translated_choices' ) ? jerus_get_translated_choices( 'categorie_generali' ) : [];
$mat_choices = function_exists( 'jerus_get_translated_choices' ) ? jerus_get_translated_choices( 'materiale' )          : [];
$tec_choices = function_exists( 'jerus_get_translated_choices' ) ? jerus_get_translated_choices( 'tecniche' )           : [];

// Valori unici per i filtri
$unique_vals = static function ( array $data, string $key ): array {
    return array_values( array_unique( array_filter( array_column( $data, $key ) ) ) );
};

$unique_multi = static function ( array $data, string $key ): array {
    $all = array_merge( ...( array_column( $data, $key ) ?: [ [] ] ) );
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

// Context Interactivity API
$context = [
    'mapStyle'    => $map_style,
    'posts'       => $posts_data,
    'filtersOpen' => false,
    'filters'     => [
        'categoria' => 'all',
        'materiali' => '',
        'tecniche'  => '',
        'periodo'   => '',
    ],
    'catOptions'  => array_values( $all_cat ),
    'matOptions'  => array_values( $all_mat ),
    'tecOptions'  => array_values( $all_tec ),
    'periOptions' => [
        [ 'value' => 'tardo-antico',     'label' => __( 'Tardo Antico', 'jerus-organo' ) ],
        [ 'value' => 'medioevo-moderno', 'label' => __( 'Medioevo / Moderno', 'jerus-organo' ) ],
    ],
    // Etichette dinamiche per il JS (vedi view.js: state.filterToggleLabel, makeCard)
    'i18n'        => [
        'filtersOpen'   => __( 'Filtra ↑', 'jerus-organo' ),
        'filtersClose'  => __( 'Filtra ↓', 'jerus-organo' ),
        'ubicazione'    => __( 'UBICAZIONE:', 'jerus-organo' ),
    ],
];
?>

<div class="map-block-wrap"
     style="--map-height:<?php echo $map_height; ?>px"
     data-wp-interactive="mappa-interattiva"
     data-wp-context="<?php echo esc_attr( wp_json_encode( $context ) ); ?>">

    <!-- Riga principale -->
    <div class="map-main">

    <!-- Sidebar filtri -->
    <div class="map-sidebar" data-wp-class--is-open="state.filtersOpen">

        <button class="map-sidebar__toggle"
                data-wp-on--click="actions.toggleFilters"
                data-wp-text="state.filterToggleLabel"
                data-wp-bind--aria-expanded="state.filtersOpen"><?php esc_html_e( 'Filtra ↓', 'jerus-organo' ); ?></button>

        <div class="map-sidebar__panel">

            <?php if ( ! empty( $all_cat ) ) : ?>
            <div class="filter-col filter-col--accent-4">
                <h5 class="filter-label"><?php esc_html_e( 'Categoria', 'jerus-organo' ); ?></h5>
                <div class="pills">
                    <button class="pill"
                            data-wp-class--active="!state.hasActiveFilters"
                            data-wp-on--click="actions.clearFilters"><?php esc_html_e( 'Tutte', 'jerus-organo' ); ?></button>
                    <?php foreach ( $all_cat as $opt ) : ?>
                    <button class="pill"
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
            <div class="filter-col filter-col--accent-1">
                <h5 class="filter-label"><?php esc_html_e( 'Materiale', 'jerus-organo' ); ?></h5>
                <div class="pills">
                    <?php foreach ( $all_mat as $opt ) : ?>
                    <button class="pill"
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
            <div class="filter-col filter-col--accent-2">
                <h5 class="filter-label"><?php esc_html_e( 'Tecnica', 'jerus-organo' ); ?></h5>
                <div class="pills">
                    <?php foreach ( $all_tec as $opt ) : ?>
                    <button class="pill"
                            data-wp-context="<?php echo esc_attr( wp_json_encode( [ 'filterGroup' => 'tecniche', 'filterVal' => $opt['value'] ] ) ); ?>"
                            data-wp-class--active="state.isPillActive"
                            data-wp-class--disabled="state.isPillDisabled"
                            data-wp-bind--disabled="state.isPillDisabled"
                            data-wp-on--click="actions.togglePill"><?php echo esc_html( $opt['label'] ); ?></button>
                    <?php endforeach; ?>
                </div>
            </div>
            <?php endif; ?>

            <div class="filter-col filter-col--accent-3">
                <h5 class="filter-label"><?php esc_html_e( 'Periodo', 'jerus-organo' ); ?></h5>
                <div class="pills">
                    <button class="pill"
                            data-wp-context='{"filterGroup":"periodo","filterVal":"tardo-antico"}'
                            data-wp-class--active="state.isPillActive"
                            data-wp-class--disabled="state.isPillDisabled"
                            data-wp-bind--disabled="state.isPillDisabled"
                            data-wp-on--click="actions.togglePill"><?php esc_html_e( 'Tardo Antico', 'jerus-organo' ); ?></button>
                    <button class="pill"
                            data-wp-context='{"filterGroup":"periodo","filterVal":"medioevo-moderno"}'
                            data-wp-class--active="state.isPillActive"
                            data-wp-class--disabled="state.isPillDisabled"
                            data-wp-bind--disabled="state.isPillDisabled"
                            data-wp-on--click="actions.togglePill"><?php esc_html_e( 'Medioevo', 'jerus-organo' ); ?></button>
                </div>
            </div>

        </div><!-- .map-sidebar__panel -->
    </div><!-- .map-sidebar -->

    <!-- Filtri attivi -->
    <div class="tl-active-filters">
        <button class="tl-btn tl-btn--link"
                data-wp-class--tl-hidden="!state.hasActiveFilters"
                data-wp-on--click="actions.clearFilters"><?php esc_html_e( '× Azzera filtri', 'jerus-organo' ); ?></button>
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
        <button class="active-filter-tag filter-col--accent-3"
                data-wp-class--tl-hidden="!state.hasPeriodoFilter"
                data-wp-on--click="actions.clearPeriodo">
            <span data-wp-text="state.activePeriodoLabel"></span> ×
        </button>
    </div>

    <!-- Area mappa -->
    <div class="map-area" style="height:<?php echo $map_height; ?>px">

        <div class="map-canvas"
             data-wp-init="callbacks.initMap"
             data-wp-watch="callbacks.updateMarkers"></div>

        <!-- Info panel (overlay) -->
        <div class="mp-info-panel">
            <button class="mp-info-panel__close" aria-label="<?php esc_attr_e( 'Chiudi', 'jerus-organo' ); ?>">×</button>
            <div class="mp-info-panel__content"></div>
        </div>

    </div><!-- .map-area -->

    </div><!-- .map-main -->

</div><!-- .map-block-wrap -->
