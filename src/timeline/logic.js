// Funzioni pure estratte dallo store del blocco timeline.
// Non dipendono da @wordpress/interactivity né dal DOM: testabili in isolamento.
//
// La logica di filtraggio condivisa con mappa-interattiva e post-list vive in
// ../shared/filters-logic.js. Qui restano i wrapper specifici (vincolo di secolo)
// e le funzioni proprie della timeline (scrubber, etichette, percentuali).

import {
	isValueAvailable as sharedIsValueAvailable,
	filterAndSortPosts as sharedFilterAndSortPosts,
} from '../shared/filters-logic';

export { postMatchesFilters } from '../shared/filters-logic';

export function postInCentury( post, min, max ) {
	const sk = post.sort_key ?? 0;
	return sk >= min && sk < max;
}

export function filterAndSortPosts( posts, { activeCenturyMin, activeCenturyMax, filters, sortAsc } ) {
	return sharedFilterAndSortPosts( posts, {
		filters,
		sortAsc,
		extraFilter: ( p ) => postInCentury( p, activeCenturyMin, activeCenturyMax ),
	} );
}

// Per una pill (gruppo/valore), restituisce true se esiste almeno un post
// del secolo attivo che la rispetta, ignorando il filtro dello stesso gruppo.
export function isValueAvailable( posts, { filterGroup, filterVal, filters, activeCenturyMin, activeCenturyMax } ) {
	return sharedIsValueAvailable( posts, {
		filterGroup,
		filterVal,
		filters,
		extraMatch: ( p ) => postInCentury( p, activeCenturyMin, activeCenturyMax ),
	} );
}

// True se il valore non compare in alcun post del secolo attivo (pill nascosta).
export function isPillInvisible( posts, { filterGroup, filterVal, activeCenturyMin, activeCenturyMax } ) {
	if ( ! filterGroup ) return false;
	const inCentury = posts.filter( ( p ) => postInCentury( p, activeCenturyMin, activeCenturyMax ) );
	if ( filterGroup === 'categoria' ) return ! inCentury.some( ( p ) => p.categoria === filterVal );
	if ( filterGroup === 'materiali' ) return ! inCentury.some( ( p ) => p.materiale.includes( filterVal ) );
	if ( filterGroup === 'tecniche' )  return ! inCentury.some( ( p ) => p.tecnica.includes( filterVal ) );
	return false;
}

// Percentuale (stringa "xx.xx%") di sort_key all'interno del secolo [min, max].
export function markerPercent( sortKey, min, max ) {
	if ( max === min ) return '50%';
	const pct = ( ( ( sortKey ?? 0 ) - min ) / ( max - min ) ) * 100;
	return Math.max( 0, Math.min( 100, pct ) ).toFixed( 2 ) + '%';
}

// Etichetta secolo "min-max" (con suffisso a.C. per anni negativi).
export function formatCenturyLabel( min, max ) {
	const from = min < 0 ? `${ -min } a.C.` : `${ min }`;
	return `${ from }–${ max }`;
}

// Indice del post più vicino, dato un click/drag sullo scrubber.
// rectLeft/rectWidth = bounding rect della track; clientX = posizione del puntatore.
export function scrubberJumpIndex( clientX, rectLeft, rectWidth, visiblePosts ) {
	if ( ! visiblePosts.length ) return null;
	const pct  = Math.max( 0, Math.min( 1, ( clientX - rectLeft ) / rectWidth ) );
	const keys = visiblePosts.map( ( p ) => p.sort_key ?? 0 );
	const min  = Math.min( ...keys );
	const max  = Math.max( ...keys );
	if ( min === max ) return 0;
	const target = min + pct * ( max - min );
	return keys.reduce(
		( best, key, i ) => Math.abs( key - target ) < Math.abs( keys[ best ] - target ) ? i : best,
		0
	);
}
