import { store, getContext } from '@wordpress/interactivity';

store( 'featured-zoom', {
	actions: {
		zoomIn: () => {
			const context = getContext();
			if ( context ) {
				context.scale += 0.5;
			}
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
			
			// Rimuoviamo il blocco scale <= 1 qui per permettere 
			// il cambio del cursore, ma limiteremo il movimento in drag()
			if ( context.scale <= 1 ) return;

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
			if ( ! context.isDragging || context.scale <= 1 ) return;

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
			return {
				transform: `translate3d(${ translateX }px, ${ translateY }px, 0) scale(${ scale })`,
				transition: isDragging ? 'none' : 'transform 0.2s ease-out',
			};
		},
		containerStyle: () => {
			const { scale, isDragging } = getContext();
			// Gestiamo il cursore sul contenitore perché l'immagine ha pointer-events: none
			if ( scale > 1 ) {
				return { cursor: isDragging ? 'grabbing' : 'grab' };
			}
			return { cursor: 'default' };
		}
	},
} );