// Funzioni pure estratte dallo store del blocco mappa-interattiva.
// Non dipendono da @wordpress/interactivity, Leaflet o DOM: testabili in isolamento.
//
// La logica di filtraggio condivisa con timeline e post-list vive in
// ../shared/filters-logic.js ed è qui ri-esportata per comodità delle viste.

import { matchesPeriodo } from '../shared/filters-logic';

export {
	matchesPeriodo,
	postMatchesFilters,
	isValueAvailable,
} from '../shared/filters-logic';

export function escapeHtml( s ) {
	return String( s ?? '' )
		.replace( /&/g, '&amp;' )
		.replace( /</g, '&lt;' )
		.replace( />/g, '&gt;' )
		.replace( /"/g, '&quot;' );
}

// Dimensione dell'icona del cluster in funzione del numero di marker raggruppati.
export function clusterIconSize( count ) {
	if ( count < 10 )  return 32;
	if ( count < 100 ) return 40;
	return 48;
}

// Raggruppa i post per coordinate (precisione 6 decimali).
// Ritorna un oggetto { "lat,lng": Post[] }.
export function groupPostsByCoord( posts ) {
	const groups = {};
	for ( const post of posts ) {
		const key = post.lat.toFixed( 6 ) + ',' + post.lng.toFixed( 6 );
		if ( ! groups[ key ] ) groups[ key ] = [];
		groups[ key ].push( post );
	}
	return groups;
}

// Costruisce la struttura `_filters` di un marker a partire da un gruppo di post co-localizzati.
export function buildMarkerFilters( group ) {
	return {
		categoria:      group.map( ( p ) => p.categoria || '' ),
		materiale:      [].concat( ...group.map( ( p ) => p.materiale || [] ) ),
		tecnica:        [].concat( ...group.map( ( p ) => p.tecnica   || [] ) ),
		hasTardoAntico: group.some( ( p ) => p.data_per_timeline <  800 ),
		hasMedioevo:    group.some( ( p ) => p.data_per_timeline >= 800 ),
	};
}

// Match dei filtri contro la struttura _filters di un marker (post co-localizzati).
export function markerMatchesFilters( markerFilters, filters ) {
	const okCat = filters.categoria === 'all' || markerFilters.categoria.includes( filters.categoria );
	const okMat = filters.materiali === ''    || markerFilters.materiale.includes( filters.materiali );
	const okTec = filters.tecniche  === ''    || markerFilters.tecnica.includes(   filters.tecniche  );
	const okPer = filters.periodo   === ''
		|| ( filters.periodo === 'tardo-antico'     && markerFilters.hasTardoAntico )
		|| ( filters.periodo === 'medioevo-moderno' && markerFilters.hasMedioevo );
	return okCat && okMat && okTec && okPer;
}

// Filtra una lista di post co-localizzati per il pannello informativo, in base al filtro periodo.
// Se nessun post supera il filtro, restituisce comunque il gruppo originale (fallback UI).
export function filterPostsForPanel( group, periodo ) {
	if ( ! periodo ) return group;
	const filtered = group.filter( ( p ) => matchesPeriodo( p.data_per_timeline, periodo ) );
	return filtered.length ? filtered : group;
}

// Costruisce l'HTML della card mostrata nel pannello informativo.
// `labels` contiene le etichette i18n ({ ubicazione: '...' }).
export function makeCard( post, labels = {} ) {
	const ubicazioneLabel = labels.ubicazione || 'UBICAZIONE:';
	const thumb = post.thumb
		? `<div class="mp-thumb"><a class="mp-title" href="${ escapeHtml( post.url ) }"><img src="${ escapeHtml( post.thumb ) }" alt="${ escapeHtml( post.title ) }" loading="lazy"></a></div>`
		: '';
	const ubicazione = post.ubicazione
		? `<span class="mp-ubicazione">${ escapeHtml( ubicazioneLabel ) } ${ escapeHtml( post.ubicazione ) }</span>`
		: '';
	const excerpt = post.excerpt
		? `<p class="mp-excerpt">${ escapeHtml( post.excerpt ) }</p>`
		: '';
	return `<div class="mp-card">${ thumb }<div class="mp-body">${ ubicazione }<a class="mp-title" href="${ escapeHtml( post.url ) }">${ escapeHtml( post.title ) }</a>${ excerpt }</div></div>`;
}
