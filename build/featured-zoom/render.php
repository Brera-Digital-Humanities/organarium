<?php
$featured_id = get_post_thumbnail_id(get_the_ID());
$img_src = wp_get_attachment_image_src($featured_id, 'full');
$dida = get_field('didascalia_foto_in_primo_piano');

if ($img_src): ?>
    <div <?php echo get_block_wrapper_attributes(['class' => 'wp-block-ttf-child-featured-zoom']); ?> 
        data-wp-interactive="ttf-child/featured-zoom"
        data-wp-context='{ "scale": 1, "translateX": 0, "translateY": 0, "isDragging": false, "startX": 0, "startY": 0 }'
    >
        <div class="zoom-image-container" 
             data-wp-on--mousedown="actions.startDrag"
             data-wp-on--mousemove="actions.drag"
             data-wp-on-window--mouseup="actions.stopDrag"
             data-wp-on--mouseleave="actions.stopDrag">
            
            <img 
                src="<?php echo esc_url($img_src[0]); ?>" 
                alt="<?php the_title_attribute(); ?>" 
                data-wp-bind--style="callbacks.imageStyle"
                draggable="false" 
                data-wp-on--dragstart="actions.stopDrag"
                style="pointer-events: none;"
            />
        </div>

        <div class="zoom-controls">
            <button type="button" class="zoom-in" data-wp-on--click="actions.zoomIn">+</button>
            <button type="button" class="zoom-out" data-wp-on--click="actions.zoomOut">−</button>
        </div>
    </div>
    
    <?php if ($dida): ?>
        <div class="has-medium-font-size"><?php echo esc_html($dida); ?></div>
    <?php endif; ?>
<?php endif; ?>