// Logica di filtraggio condivisa tra i blocchi mappa-interattiva, timeline e post-list.
// Non dipende da @wordpress/interactivity né dal DOM: testabile in isolamento.
//
// Il filtro `periodo` è opzionale: se `filters.periodo` è `undefined`, viene ignorato
// (timeline e post-list non lo usano; mappa-interattiva sì).

// Match del filtro periodo. periodo === '' → nessun filtro (true).
// 'tardo-antico' < 800; 'medioevo-moderno' >= 800.
export function matchesPeriodo( dataPerTimeline, periodo ) {
	if ( periodo === '' ) return true;
	if ( periodo === 'tardo-antico' )      return dataPerTimeline <  800;
	if ( periodo === 'medioevo-moderno' )  return dataPerTimeline >= 800;
	return false;
}

export function postMatchesFilters( post, filters ) {
	const matchCat = filters.categoria === 'all' || post.categoria === filters.categoria;
	const matchMat = filters.materiali === '' || post.materiale.includes( filters.materiali );
	const matchTec = filters.tecniche === '' || post.tecnica.includes( filters.tecniche );
	const matchPer = filters.periodo === undefined
		|| matchesPeriodo( post.data_per_timeline, filters.periodo );
	return matchCat && matchMat && matchTec && matchPer;
}

// Per una pill (gruppo/valore), restituisce true se esiste almeno un post
// che la rispetta, ignorando il filtro dello stesso gruppo.
// `extraMatch( post )` opzionale: ulteriore predicato (es. vincolo di secolo in timeline).
export function isValueAvailable( posts, { filterGroup, filterVal, filters, extraMatch } ) {
	if ( ! filterGroup ) return true;

	const filtered = posts.filter( ( post ) => {
		if ( extraMatch && ! extraMatch( post ) ) return false;
		const matchCat = filterGroup === 'categoria' ? true
			: ( filters.categoria === 'all' || post.categoria === filters.categoria );
		const matchMat = filterGroup === 'materiali' ? true
			: ( filters.materiali === '' || post.materiale.includes( filters.materiali ) );
		const matchTec = filterGroup === 'tecniche' ? true
			: ( filters.tecniche === '' || post.tecnica.includes( filters.tecniche ) );
		const matchPer = filterGroup === 'periodo' || filters.periodo === undefined
			? true
			: matchesPeriodo( post.data_per_timeline, filters.periodo );
		return matchCat && matchMat && matchTec && matchPer;
	} );

	if ( filterGroup === 'categoria' ) return filtered.some( ( p ) => p.categoria === filterVal );
	if ( filterGroup === 'materiali' ) return filtered.some( ( p ) => p.materiale.includes( filterVal ) );
	if ( filterGroup === 'tecniche' )  return filtered.some( ( p ) => p.tecnica.includes( filterVal ) );
	if ( filterGroup === 'periodo' )   return filtered.some( ( p ) => matchesPeriodo( p.data_per_timeline, filterVal ) );
	return true;
}

// Filtra e ordina i post per `sort_key`. `extraFilter( post )` opzionale per
// vincoli ulteriori (es. intervallo di secolo in timeline).
export function filterAndSortPosts( posts, { filters, sortAsc, extraFilter } ) {
	return posts
		.filter( ( p ) => ( ! extraFilter || extraFilter( p ) ) && postMatchesFilters( p, filters ) )
		.sort( ( a, b ) => sortAsc
			? ( a.sort_key ?? 0 ) - ( b.sort_key ?? 0 )
			: ( b.sort_key ?? 0 ) - ( a.sort_key ?? 0 )
		);
}
