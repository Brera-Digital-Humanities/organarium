<?php
/**
 * Twenty Twenty-Five Child functions
 */

/**
 * Enqueue custom assets
 */
add_action( 'wp_enqueue_scripts', 'jerus_enqueue_styles' );

function jerus_enqueue_styles() {
	wp_enqueue_style( 
		'grand-sunrise-style', 
		get_stylesheet_uri()
	);
}

/**
 * Registrazione Shortcode per visualizzare campi ACF
 */
function ttf_register_acf_shortcodes() {
    $fields = array(
        'data'                => array( 'sc' => 'acf_data',       'label' => 'Data' ),
        'ubicazione'          => array( 'sc' => 'acf_ubicazione', 'label' => 'Ubicazione' ),
        'autore'              => array( 'sc' => 'acf_autore',     'label' => 'Autore' ),
        'tecnica_e_materiali' => array( 'sc' => 'acf_tecnica',    'label' => 'Tecnica e materiali' ),
        'dimensioni'          => array( 'sc' => 'acf_dimensioni', 'label' => 'Dimensioni' ),
        'provenienza'         => array( 'sc' => 'acf_provenienza', 'label' => 'Provenienza' ),
        'fonti'               => array( 'sc' => 'acf_fonti',      'label' => 'Fonti' ),
    );

    foreach ( $fields as $acf_key => $config ) {
        add_shortcode( $config['sc'], function() use ( $acf_key, $config ) {
            if ( ! function_exists( 'get_field' ) ) {
                return '';
            }

            $value = get_field( $acf_key );

            if ( empty( $value ) ) {
                return '';
            }

            $label_html = '<strong  style="font-style:normal;font-weight:700; font-family: var(--wp--preset--font-family--baloo-2);">' . esc_html( $config['label'] ) . ':</strong> ';
            $value_html = '';

            // Gestione specifica per il campo "fonti" (tipo Link di ACF)
            if ( $acf_key === 'fonti' && is_array( $value ) ) {
                $link_url    = esc_url( $value['url'] );
                $link_title  = esc_html( $value['title'] );
                $link_target = ! empty( $value['target'] ) ? esc_attr( $value['target'] ) : '_self';
                $value_html  = "<a href='{$link_url}' target='{$link_target}' class='acf-link-field'>{$link_title}</a>";
            } elseif ( $acf_key === 'provenienza' ) {
                // Gestione per il campo "provenienza" (tipo Rich Editor / WYSIWYG)
                $value_html = wp_kses_post( $value );
            } else {
                // Gestione standard per campi di testo semplice
                $value_html = esc_html( $value );
            }

            return '<div class="acf-field-wrapper ' . esc_attr( $config['sc'] ) . '">' . $label_html . $value_html . '</div>';
        });
    }
}
add_action( 'init', 'ttf_register_acf_shortcodes' );


/**
 * Registrazione Blocchi Custom dal Build
 */
add_action('init', 'ttf_register_custom_blocks');
function ttf_register_custom_blocks() {

    register_block_type( __DIR__ . '/build/timeline' );
    register_block_type( __DIR__ . '/build/featured-zoom' );
    register_block_type( __DIR__ . '/build/mappa-interattiva' );
    register_block_type( __DIR__ . '/build/post-list' );
}

