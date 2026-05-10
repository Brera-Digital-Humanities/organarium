<?php
$field_key = $attributes['fieldKey'] ?? '';
$label     = $attributes['label']    ?? '';
$variant   = in_array( $attributes['variant'] ?? '', [ 'standard', 'flush', 'top-border' ], true )
    ? $attributes['variant']
    : 'standard';

if ( ! $field_key || ! function_exists( 'get_field' ) ) {
    return;
}

$value = get_field( $field_key );

if ( empty( $value ) ) {
    return;
}

$value_html = wp_kses_post( $value );

$wrapper_attrs = get_block_wrapper_attributes( [
    'class' => 'acf-field acf-field--' . $variant . ' acf-field--' . sanitize_html_class( $field_key ),
] );
?>
<div <?php echo $wrapper_attrs; ?>>
    <?php if ( $label !== '' ) : ?>
    <strong class="acf-field__label"><?php echo esc_html( $label ); ?>:</strong>
    <?php endif; ?>
    <span class="acf-field__value"><?php echo $value_html; ?></span>
</div>
