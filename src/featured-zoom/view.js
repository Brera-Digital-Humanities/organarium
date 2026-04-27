import { store, getContext } from '@wordpress/interactivity';

store( 'ttf-child/featured-zoom', {
	actions: {
		zoomIn: () => {
			const context = getContext();
			context.scale += 0.5;
		},
		zoomOut: () => {
			const context = getContext();
			if ( context.scale > 1 ) {
				context.scale -= 0.5;
				if ( context.scale <= 1 ) {
					context.scale = 1;
					context.translateX = 0;
					context.translateY = 0;
				}
			}
		},
		startDrag: ( e ) => {
			const context = getContext();
			// Se l'immagine non è zoomata, non attiviamo il drag
			if ( context.scale <= 1 ) {
				return;
			}

			e.preventDefault();
			context.isDragging = true;
			
			// Calcoliamo l'offset iniziale
			context.startX = e.clientX - context.translateX;
			context.startY = e.clientY - context.translateY;
			
		},
		stopDrag: () => {
			const context = getContext();
			if ( context.isDragging ) {
				context.isDragging = false;
			}
		},
		drag: ( e ) => {
			const context = getContext();
			if ( ! context.isDragging ) return;

			e.preventDefault();

			// Nuova posizione potenziale
			const nextX = e.clientX - context.startX;
			const nextY = e.clientY - context.startY;

			// Calcolo limiti
			const container = e.currentTarget;
			const rect = container.getBoundingClientRect();
			const maxW = ( rect.width * context.scale - rect.width ) / 2;
			const maxH = ( rect.height * context.scale - rect.height ) / 2;

			context.translateX = Math.max( -maxW, Math.min( maxW, nextX ) );
			context.translateY = Math.max( -maxH, Math.min( maxH, nextY ) );

			
		},
	},
	callbacks: {
		imageStyle: () => {
			const { scale, translateX, translateY, isDragging } = getContext();
			const transition = isDragging ? 'none' : 'transform 0.2s ease-out';
			
			// IMPORTANTE: usiamo translate3d per assicurarci che il browser usi la GPU
			return `transform: translate3d(${ translateX }px, ${ translateY }px, 0) scale(${ scale }); transition: ${ transition }; cursor: ${ scale > 1 ? ( isDragging ? 'grabbing' : 'grab' ) : 'default' };`;
		},
	},
} );