// Funzioni pure estratte dallo store del blocco post-list.
// Non dipendono da @wordpress/interactivity né dal DOM: testabili in isolamento.
//
// La logica di filtraggio condivisa con mappa-interattiva e timeline vive in
// ../shared/filters-logic.js ed è qui ri-esportata per comodità della vista.

import { postMatchesFilters } from '../shared/filters-logic';

export {
	postMatchesFilters,
	filterAndSortPosts,
	isValueAvailable,
} from '../shared/filters-logic';

// Indice CSS `order` di una card nel layout flex column.
// Restituisce 9999 (in fondo) se il post non è nella lista filtrata.
export function cardOrder( filteredPosts, post ) {
	if ( ! post ) return 9999;
	const idx = filteredPosts.indexOf( post );
	return idx === -1 ? 9999 : idx + 1;
}

// True se il post è tra i primi `visibleCount` della lista filtrata.
export function isCardVisible( filteredPosts, post, visibleCount ) {
	if ( ! post ) return false;
	const idx = filteredPosts.indexOf( post );
	return idx !== -1 && idx < visibleCount;
}

// Numero di post che soddisfano i filtri (senza ordinare — più economico di filterAndSortPosts).
export function countFilteredPosts( posts, filters ) {
	let n = 0;
	for ( const post of posts ) {
		if ( postMatchesFilters( post, filters ) ) n++;
	}
	return n;
}
