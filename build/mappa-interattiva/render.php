<?php
// ── Attributi blocco ──────────────────────────────────────────────────────────
$post_source       = $attributes['postSource']       ?? 'all';
$selected_category = (int) ( $attributes['selectedCategory'] ?? 0 );
$map_height        = (int) ( $attributes['mapHeight']        ?? 520 );
$map_style         = in_array( $attributes['mapStyle'] ?? '', [ 'natural', 'warm', 'teal', 'dark' ], true )
                     ? $attributes['mapStyle']
                     : 'natural';

// ── Helper: label breve (tronca la descrizione tra parentesi) ─────────────────
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
        $pid = get_the_ID();
        if ( ! $first_post_id ) $first_post_id = $pid;

        // get_field() con return_format:leaflet restituisce HTML, non dati grezzi.
        // get_post_meta() restituisce l'array serializzato con markers[lat/lng].
        $pos_raw = get_post_meta( $pid, 'posizione_per_mappa', true );
        if ( empty( $pos_raw ) ) continue;

        $pos = is_string( $pos_raw ) ? json_decode( $pos_raw, true ) : (array) $pos_raw;
        if ( ! is_array( $pos ) ) continue;

        // Formato A — ACFE Leaflet con array markers: {markers:[{lat,lng},...]}
        if ( ! empty( $pos['markers'] ) && is_array( $pos['markers'] ) ) {
            $lat = (float) ( $pos['markers'][0]['lat'] ?? 0 );
            $lng = (float) ( $pos['markers'][0]['lng'] ?? 0 );
        // Formato B — ACFE / ACF con lat+lng diretti a radice: {lat, lng, zoom, ...}
        } elseif ( isset( $pos['lat'] ) && isset( $pos['lng'] ) ) {
            $lat = (float) $pos['lat'];
            $lng = (float) $pos['lng'];
        // Formato C — array indicizzato: [[lat, lng], ...]
        } elseif ( isset( $pos[0] ) && is_array( $pos[0] ) ) {
            $lat = (float) ( $pos[0][0] ?? $pos[0]['lat'] ?? 0 );
            $lng = (float) ( $pos[0][1] ?? $pos[0]['lng'] ?? 0 );
        } else {
            continue;
        }

        if ( ! $lat && ! $lng ) continue;

        $materiali = (array) get_field( 'materiale', $pid );
        $tecniche  = (array) get_field( 'tecniche',  $pid );

        $posts_data[] = [
            'lat'        => $lat,
            'lng'        => $lng,
            'id'         => $pid,
            'url'        => get_permalink(),
            'title'      => get_the_title(),
            'thumb'      => get_the_post_thumbnail_url( $pid, 'medium' ) ?: '',
            'ubicazione' => get_field( 'ubicazione', $pid ) ?: '',
            'categoria'  => get_field( 'categorie_generali', $pid ) ?? '',
            'materiale'  => array_values( array_filter( $materiali ) ),
            'tecnica'    => array_values( array_filter( $tecniche ) ),
        ];
    }
    wp_reset_postdata();
}

// ── Mappa valore→label ACF ────────────────────────────────────────────────────
$acf_choices = static function ( string $field_name, $post_id ): array {
    if ( ! function_exists( 'get_field_object' ) ) return [];
    $obj = get_field_object( $field_name, $post_id );
    return ( is_array( $obj ) && ! empty( $obj['choices'] ) ) ? $obj['choices'] : [];
};

$cat_choices = $acf_choices( 'categorie_generali', $first_post_id );
$mat_choices = $acf_choices( 'materiale',          $first_post_id );
$tec_choices = $acf_choices( 'tecniche',           $first_post_id );

foreach ( $posts_data as &$post ) {
    $full             = $cat_choices[ $post['categoria'] ] ?? $post['categoria'];
    $post['catLabel'] = $short_label( (string) $full );
}
unset( $post );

// ── Valori unici per i filtri ─────────────────────────────────────────────────
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

$has_filters = ! empty( $all_cat ) || ! empty( $all_mat ) || ! empty( $all_tec );

// ── ID unico per istanze multiple dello stesso blocco ─────────────────────────
static $instance = 0;
$instance++;
$map_id = 'map-canvas-' . $instance;

// ── Config JSON per il frontend ───────────────────────────────────────────────
$map_config = [
    'mapStyle' => $map_style,
    'posts'    => $posts_data,
];

$wrapper_class = 'map-block-wrap' . ( $has_filters ? ' map-block-wrap--has-sidebar' : '' );
?>

<div <?php echo get_block_wrapper_attributes( [ 'class' => $wrapper_class ] ); ?>>

    <?php if ( $has_filters ) : ?>
    <!-- ═══ SIDEBAR FILTRI ═══ -->
    <aside class="map-sidebar">

        <div class="tl-bar map-sidebar__bar">
            <span class="tl-btn" style="pointer-events:none">Filtri</span>
        </div>

        <div class="tl-filters">
            <div class="filter-row filter-row--col">

                <?php if ( ! empty( $all_cat ) ) : ?>
                <div class="filter-col filter-col--accent-4">
                    <h5 class="filter-label">Categoria</h5>
                    <div class="pills">
                        <button class="pill active"
                                data-filter-group="categoria"
                                data-filter-val="all">Tutte</button>
                        <?php foreach ( $all_cat as $opt ) : ?>
                        <button class="pill"
                                data-filter-group="categoria"
                                data-filter-val="<?php echo esc_attr( $opt['value'] ); ?>">
                            <?php echo esc_html( $opt['label'] ); ?>
                        </button>
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
                                data-filter-group="materiale"
                                data-filter-val="<?php echo esc_attr( $opt['value'] ); ?>">
                            <?php echo esc_html( $opt['label'] ); ?>
                        </button>
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
                                data-filter-group="tecnica"
                                data-filter-val="<?php echo esc_attr( $opt['value'] ); ?>">
                            <?php echo esc_html( $opt['label'] ); ?>
                        </button>
                        <?php endforeach; ?>
                    </div>
                </div>
                <?php endif; ?>

            </div>
        </div>

        <div class="tl-divider"></div>

        <div class="tl-active-filters" style="display:none">
            <button class="tl-btn tl-btn--link map-clear-all">× Azzera filtri</button>
            <button class="active-filter-tag filter-col--accent-4 map-clear-group"
                    data-clear-group="categoria" style="display:none">
                <span class="map-active-label"></span> ×
            </button>
            <button class="active-filter-tag filter-col--accent-1 map-clear-group"
                    data-clear-group="materiale" style="display:none">
                <span class="map-active-label"></span> ×
            </button>
            <button class="active-filter-tag filter-col--accent-2 map-clear-group"
                    data-clear-group="tecnica" style="display:none">
                <span class="map-active-label"></span> ×
            </button>
        </div>

    </aside>
    <?php endif; ?>

    <!-- ═══ MAPPA ═══ -->
    <div
        id="<?php echo esc_attr( $map_id ); ?>"
        class="map-canvas"
        style="height:<?php echo esc_attr( $map_height ); ?>px"
        data-map-config="<?php echo esc_attr( wp_json_encode( $map_config ) ); ?>"
        aria-label="Mappa interattiva delle opere"
        role="application"
    ></div>

    <?php if ( empty( $posts_data ) ) : ?>
    <p class="map-empty">Nessun articolo con posizione geolocalizzata trovato.</p>
    <?php endif; ?>

</div>
