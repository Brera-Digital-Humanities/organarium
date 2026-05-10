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
	wp_enqueue_style(
		'jerus-header',
		get_stylesheet_uri()
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
