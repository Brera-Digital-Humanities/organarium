<?php
/**
 * Twenty Twenty-Five Child functions
 */

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
