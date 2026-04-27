<?php
/**
 * Twenty Twenty-Five Child functions
 */

/**
 * Enqueue custom assets
 */
function ttf_enqueue_custom_assets() {
	
    // Gli asset verranno gestiti automaticamente tramite register_block_type e il build di wp-scripts
}
add_action( 'wp_enqueue_scripts', 'ttf_enqueue_custom_assets' );

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
    // Registra il blocco della timeline
    register_block_type( 'ttf-child/timeline', array(
        'render_callback' => 'ttf_render_timeline_block',
    ));

    // Registra il nuovo blocco Featured Zoom (caricando il metadata dal build)
    register_block_type( __DIR__ . '/build/featured-zoom' );
}

/**
 * Render callback per la Timeline
 * Estrae i dati ACF (Free) e genera il markup
 */
function ttf_render_timeline_block( $attributes, $content ) {
    if ( ! function_exists( 'get_field' ) ) return '';

    // Recuperiamo i campi ACF definiti per il post corrente
    $data_opera = get_field('data');
    $ubicazione = get_field('ubicazione');
    $autore     = get_field('autore');

    if ( ! $data_opera && ! $autore ) return '<p>Configura i campi ACF per vedere la timeline.</p>';

    ob_start(); ?>
    <div class="timeline-container">
        <div class="timeline-item">
            <span class="timeline-date"><?php echo esc_html($data_opera); ?></span>
            <div class="timeline-content">
                <strong><?php echo esc_html($autore); ?></strong><br>
                <span><?php echo esc_html($ubicazione); ?></span>
            </div>
        </div>
    </div>
    <?php
    return ob_get_clean();
}