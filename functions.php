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
        'trattato_completo'   => array( 'sc' => 'acf_trattato_completo',      'label' => 'Trattato completo' ),
        'edizione'            => array( 'sc' => 'acf_edizione',      'label' => 'Edizione' ),
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
            if ( $acf_key === 'fonti' || $acf_key === 'provenienza' || $acf_key === 'trattato_completo') {
                // Gestione per il campo "provenienza" (tipo Rich Editor / WYSIWYG)
                $value_html = wp_kses_post( $value );
                if($acf_key === 'fonti' ){
                    return '<div style="border-top-color:var(--wp--preset--color--contrast);border-top-style:solid;border-top-width:1px;padding-bottom:0px;padding-top:15px;display: inline-block;width: 100%;"><div class="acf-field-wrapper ' . esc_attr( $config['sc'] ) . '">' . $label_html . $value_html . '</div></div>';
                } elseif ( $acf_key === 'provenienza' ) {
                    return '<div style="padding-top:0px;padding-bottom:15px;display: inline-block;width: 100%;"><div class="acf-field-wrapper ' . esc_attr( $config['sc'] ) . '">' . $label_html . $value_html . '</div></div>';
                } else{
                    return '<div style="border-bottom-color:var(--wp--preset--color--contrast);border-bottom-style:solid;border-bottom-width:1px;padding-top:0px;padding-bottom:15px;margin-bottom:20px;display: inline-block;width: 100%;"><div class="acf-field-wrapper ' . esc_attr( $config['sc'] ) . '">' . $label_html . $value_html . '</div></div>';  
                }
            } else {
                // Gestione standard per campi di testo semplice
                $value_html = esc_html( $value );
                return '<div style="border-bottom-color:var(--wp--preset--color--contrast);border-bottom-style:solid;border-bottom-width:1px;padding-top:0px;padding-bottom:15px;margin-bottom:20px;display: inline-block;width: 100%;"><div class="acf-field-wrapper ' . esc_attr( $config['sc'] ) . '">' . $label_html . $value_html . '</div></div>';

            }

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

function custom_excerpt_length( $length ) {
    return 85; 
}
add_filter( 'excerpt_length', 'custom_excerpt_length', 999 );
