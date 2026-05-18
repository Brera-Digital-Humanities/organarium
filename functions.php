<?php
/**
 * Twenty Twenty-Five Child functions
 */

/**
 * Carica le traduzioni del child theme da /languages.
 * I file .mo devono essere nominati jerus-organo-{locale}.mo (es. jerus-organo-en_US.mo).
 */
add_action( 'after_setup_theme', 'jerus_load_textdomain' );
function jerus_load_textdomain() {
	load_child_theme_textdomain( 'jerus-organo', get_stylesheet_directory() . '/languages' );
}

/**
 * Mappa un term_id (o un array di term_id) all'equivalente nella lingua corrente
 * quando Polylang è attivo. Senza Polylang ritorna l'input invariato.
 *
 * @param int|int[] $term_id
 * @return int|int[]
 */
function jerus_localize_term_ids( $term_id ) {
	if ( ! function_exists( 'pll_get_term' ) ) {
		return $term_id;
	}
	if ( is_array( $term_id ) ) {
		$mapped = array_map( 'pll_get_term', $term_id );
		return array_values( array_filter( array_map( 'intval', $mapped ) ) );
	}
	$mapped = pll_get_term( (int) $term_id );
	return $mapped ? (int) $mapped : (int) $term_id;
}

/**
 * Esegue WP_Query con fallback alla lingua di default se la lingua corrente
 * non ha risultati. Funziona anche senza Polylang (ritorna la query normale).
 *
 * @param array $args  Argomenti di WP_Query.
 * @return WP_Query
 */
function jerus_query_with_lang_fallback( array $args ): WP_Query {
	$query = new WP_Query( $args );

	if ( $query->have_posts() ) {
		return $query;
	}
	if ( ! function_exists( 'pll_current_language' ) || ! function_exists( 'pll_default_language' ) ) {
		return $query;
	}

	$current = pll_current_language();
	$default = pll_default_language();
	if ( ! $current || ! $default || $current === $default ) {
		return $query;
	}

	$fallback_args = $args;
	$fallback_args['lang'] = $default; // forza la lingua di default su Polylang
	return new WP_Query( $fallback_args );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * ACF — traduzione di labels e choices via acf/load_field
 *
 * Si traduce a runtime (no re-import del field group). Le `value` delle choices
 * restano slug (lingua-agnostici) per non rompere i filtri salvati nei post o
 * nel cookie tl_prefs.
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * Restituisce la mappa di traduzioni per le choices ACF.
 * Le chiavi sono i `value` (slug) di ACF, i valori sono le label tradotte
 * via __() — vengono prese dal .mo della lingua corrente.
 */
function jerus_acf_choices_translations(): array {
	return [
		'categorie_generali' => [
			'pittura'     => __( 'Pittura su Supporto Mobile (Raccoglie le opere che potevano essere spostate o che facevano parte dell\'arredo dell\'organo stesso. Materiali: Olio, Tempera, Tela, Tavola. Include le pale d\'altare e le portelle degli organi. )', 'jerus-organo' ),
			'monumentale' => __( 'Decorazione Murale e Architettonica (Opere nate per essere parte integrante din un edificio. Materiali: Affresco, Stucco, Intonaco. Queste opere mostrano l\'organo nel suo contesto spaziale originale, spesso circondato da angeli musicanti o decorazioni che ne prolungano la struttura nella muratura. )', 'jerus-organo' ),
			'plastica'    => __( 'Arti Plastiche e Scultoree (Qui raccogliamo i materiali che hai citato come la terracotta e il marmo. Materiali: Terracotta (anche invetriata), Marmo, Pietra, Bronzo. Raggruppa gli oggetti tridimensionali. Qui l\'organo non è "dipinto" ma "costruito" nel volume. )', 'jerus-organo' ),
			'grafica'     => __( 'Grafica e Disegno su Carta  (Opere bidimensionali, spesso monocromatiche o tecniche. Materiali: Incisione, Sanguigna, Matita, Tecnica mista su carta. Include sia il materiale di studio (disegni) che quello di diffusione (stampe)).', 'jerus-organo' ),
			'vitree'      => __( 'Arti Applicate e Decorative (Opere dove l\'immagine dell\'organo è vincolata a una funzione decorativa specifica. Materiali: Vetro (vetrate), Mosaico, Intarsio. Sono tecniche dove la resa dell\'organo è più stilizzata a causa del materiale difficile da lavorare).', 'jerus-organo' ),
		],
		'materiale' => [
			'tela'       => __( 'Tela', 'jerus-organo' ),
			'legno'      => __( 'Legno', 'jerus-organo' ),
			'intonaco'   => __( 'Intonaco', 'jerus-organo' ),
			'calce'      => __( 'Calce', 'jerus-organo' ),
			'pietra'     => __( 'Pietra', 'jerus-organo' ),
			'terracotta' => __( 'Terracotta', 'jerus-organo' ),
			'marmo'      => __( 'Marmo', 'jerus-organo' ),
			'bronzo'     => __( 'Bronzo', 'jerus-organo' ),
			'carta'      => __( 'Carta', 'jerus-organo' ),
			'tessuto'    => __( 'Tessuto', 'jerus-organo' ),
			'vetro'      => __( 'Vetro', 'jerus-organo' ),
			'piombo'     => __( 'Piombo', 'jerus-organo' ),
		],
		'tecniche' => [
			'affresco'     => __( 'Affresco', 'jerus-organo' ),
			'stucco'       => __( 'Stucco', 'jerus-organo' ),
			'mosaico'      => __( 'Mosaico', 'jerus-organo' ),
			'scultura'     => __( 'Scultura', 'jerus-organo' ),
			'modellato'    => __( 'Modellato', 'jerus-organo' ),
			'bassorilievo' => __( 'Bassorilievo', 'jerus-organo' ),
			'incisione'    => __( 'Incisione', 'jerus-organo' ),
			'disegno'      => __( 'Disegno', 'jerus-organo' ),
			'vetrata'      => __( 'Vetrata', 'jerus-organo' ),
			'miniatura'    => __( 'Miniatura', 'jerus-organo' ),
			'arazzo'       => __( 'Arazzo', 'jerus-organo' ),
			'pittura'      => __( 'Pittura', 'jerus-organo' ),
			'intarsio'     => __( 'Intarsio', 'jerus-organo' ),
		],
	];
}

/**
 * Mappa nome campo ACF → label tradotta (admin edit screen + render).
 */
function jerus_acf_field_labels(): array {
	return [
		'data'                           => __( 'DATA VISUALIZZATA', 'jerus-organo' ),
		'ubicazione'                     => __( 'UBICAZIONE', 'jerus-organo' ),
		'autore'                         => __( 'AUTORE', 'jerus-organo' ),
		'tecnica_e_materiali'            => __( 'TECNICA E MATERIALI (versione in testo da inserire nella scheda, più descrittiva)', 'jerus-organo' ),
		'dimensioni'                     => __( 'DIMENSIONI', 'jerus-organo' ),
		'provenienza'                    => __( 'PROVENIENZA', 'jerus-organo' ),
		'trattato_completo'              => __( 'TRATTATO COMPLETO', 'jerus-organo' ),
		'edizione'                       => __( 'EDIZIONE', 'jerus-organo' ),
		'fonti'                          => __( 'FONTI', 'jerus-organo' ),
		'data_per_la_timeline'           => __( 'DATA NUMERICA PER LA TIMELINE', 'jerus-organo' ),
		'posizione_per_mappa'            => __( 'POSIZIONE PER MAPPA', 'jerus-organo' ),
		'didascalia_foto_in_primo_piano' => __( 'DIDASCALIA FOTO IN PRIMO PIANO', 'jerus-organo' ),
		'categorie_generali'             => __( 'CATEGORIE PER GENERALI', 'jerus-organo' ),
		'materiale'                      => __( 'MATERIALI', 'jerus-organo' ),
		'tecniche'                       => __( 'TECNICHE', 'jerus-organo' ),
	];
}

/**
 * Filtro globale acf/load_field: traduce label + choices in base al text-domain.
 * Si applica a ogni campo; il lookup costa pochissimo e centralizza tutto.
 */
add_filter( 'acf/load_field', 'jerus_acf_translate_field' );
function jerus_acf_translate_field( $field ) {
	if ( ! is_array( $field ) || empty( $field['name'] ) ) {
		return $field;
	}

	$labels = jerus_acf_field_labels();
	if ( isset( $labels[ $field['name'] ] ) ) {
		$field['label'] = $labels[ $field['name'] ];
	}

	$choices_map = jerus_acf_choices_translations();
	if ( isset( $choices_map[ $field['name'] ] ) && ! empty( $field['choices'] ) && is_array( $field['choices'] ) ) {
		foreach ( $field['choices'] as $value => $original_label ) {
			if ( isset( $choices_map[ $field['name'] ][ $value ] ) ) {
				$field['choices'][ $value ] = $choices_map[ $field['name'] ][ $value ];
			}
		}
	}

	return $field;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Fallback alla lingua di default sulle pagine archivio / categoria
 *
 * Se la main query nella lingua corrente non trova post, ri-esegue la query
 * con lang=<lingua di default>. Si limita ad archivi e home per evitare di
 * "sostituire" il singolo post (che ha una propria logica di traduzione).
 * ──────────────────────────────────────────────────────────────────────────── */
add_filter( 'the_posts', 'jerus_main_query_lang_fallback', 10, 2 );
function jerus_main_query_lang_fallback( $posts, $query ) {
	if ( ! empty( $posts ) ) {
		return $posts;
	}
	if ( is_admin() || ! $query instanceof WP_Query || ! $query->is_main_query() ) {
		return $posts;
	}
	if ( ! ( $query->is_category() || $query->is_tag() || $query->is_tax() || $query->is_archive() || $query->is_home() ) ) {
		return $posts;
	}
	if ( ! function_exists( 'pll_current_language' ) || ! function_exists( 'pll_default_language' ) ) {
		return $posts;
	}

	$current = pll_current_language();
	$default = pll_default_language();
	if ( ! $current || ! $default || $current === $default ) {
		return $posts;
	}

	// Sentinel anti-ricorsione
	if ( ! empty( $query->query_vars['_jerus_fallback'] ) ) {
		return $posts;
	}

	$args = $query->query_vars;
	$args['lang'] = $default;
	$args['_jerus_fallback'] = true;

	$fallback = new WP_Query( $args );
	if ( ! empty( $fallback->posts ) ) {
		$query->found_posts   = $fallback->found_posts;
		$query->max_num_pages = $fallback->max_num_pages;
		$query->post_count    = $fallback->post_count;
		return $fallback->posts;
	}
	return $posts;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Header / Footer template-part per lingua (FSE)
 *
 * Il template di TwentyTwentyFive include <!-- wp:template-part {"slug":"header"} /-->
 * e idem per "footer". Filtriamo il blocco subito prima del render e, se la
 * lingua corrente non è quella di default, sostituiamo lo slug con "<slug>-<lang>"
 * (es. "header-en"). Se la variante non esiste come file in /parts né come post
 * wp_template_part, WordPress ricade automaticamente sulla versione di default.
 * ──────────────────────────────────────────────────────────────────────────── */
add_filter( 'render_block_data', 'jerus_swap_template_part_per_language' );
function jerus_swap_template_part_per_language( $parsed_block ) {
	if ( ! is_array( $parsed_block ) || empty( $parsed_block['blockName'] ) ) {
		return $parsed_block;
	}
	if ( 'core/template-part' !== $parsed_block['blockName'] ) {
		return $parsed_block;
	}
	if ( ! function_exists( 'pll_current_language' ) || ! function_exists( 'pll_default_language' ) ) {
		return $parsed_block;
	}

	$current = pll_current_language();
	$default = pll_default_language();
	if ( ! $current || $current === $default ) {
		return $parsed_block;
	}

	$slug = $parsed_block['attrs']['slug'] ?? '';
	// Estendi questo array per altre parti che vuoi tradurre (es. 'sidebar').
	$swappable = [ 'header', 'footer' ];
	if ( ! in_array( $slug, $swappable, true ) ) {
		return $parsed_block;
	}

	$localized_slug = $slug . '-' . $current;

	// Verifica esistenza variante: file in /parts/ del child o post wp_template_part.
	$file_path = get_stylesheet_directory() . '/parts/' . $localized_slug . '.html';
	if ( file_exists( $file_path ) ) {
		$parsed_block['attrs']['slug'] = $localized_slug;
		return $parsed_block;
	}

	$existing = get_block_template( get_stylesheet() . '//' . $localized_slug, 'wp_template_part' );
	if ( $existing ) {
		$parsed_block['attrs']['slug'] = $localized_slug;
	}

	return $parsed_block;
}

/**
 * Enqueue custom assets
 */
add_action( 'wp_enqueue_scripts', 'jerus_enqueue_styles' );

function jerus_enqueue_styles() {
	// Header del child theme (richiesto da WordPress)
	$header_css = get_stylesheet_directory() . '/style.css';
	wp_enqueue_style(
		'jerus-header',
		get_stylesheet_uri(),
		array(),
		file_exists( $header_css ) ? filemtime( $header_css ) : null
	);

	// Stile globale compilato da SCSS, dipende dal parent theme
	$global_css = get_stylesheet_directory() . '/build/style/style-style.css';
	if ( file_exists( $global_css ) ) {
		wp_enqueue_style(
			'jerus-global',
			get_stylesheet_directory_uri() . '/build/style/style-style.css',
			array( 'twentytwentyfive-style' ),
			filemtime( $global_css ) 
		);
	}
}

/**
 * Registrazione Blocchi Custom dal Build
 */
add_action('init', 'ttf_register_custom_blocks');
function ttf_register_custom_blocks() {

    register_block_type( __DIR__ . '/build/timeline' );
    register_block_type( __DIR__ . '/build/featured-zoom' );
    register_block_type( __DIR__ . '/build/mappa-interattiva' );
    register_block_type( __DIR__ . '/build/post-list' );
    register_block_type( __DIR__ . '/build/acf-field' );
}

function custom_excerpt_length( $length ) {
    return 85;
}
add_filter( 'excerpt_length', 'custom_excerpt_length', 999 );

/**
 * Forza filemtime() come versione su tutti gli asset del child theme
 * (cartella /build/), così ogni rebuild invalida la cache del browser.
 */
add_filter( 'style_loader_src',  'jerus_force_filemtime_version', 10, 1 );
add_filter( 'script_loader_src', 'jerus_force_filemtime_version', 10, 1 );

function jerus_force_filemtime_version( $src ) {
	$theme_uri = get_stylesheet_directory_uri();
	if ( strpos( $src, $theme_uri . '/build/' ) === false ) {
		return $src;
	}

	$clean_src   = strtok( $src, '?' );
	$relative    = str_replace( $theme_uri, '', $clean_src );
	$local_path  = get_stylesheet_directory() . $relative;

	if ( file_exists( $local_path ) ) {
		return add_query_arg( 'ver', filemtime( $local_path ), $clean_src );
	}

	return $src;
}
