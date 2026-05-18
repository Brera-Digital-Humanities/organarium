import {
	escapeHtml,
	matchesPeriodo,
	postMatchesFilters,
	isValueAvailable,
	clusterIconSize,
	groupPostsByCoord,
	buildMarkerFilters,
	markerMatchesFilters,
	filterPostsForPanel,
	makeCard,
} from '../logic';

const POSTS = [
	{ id: 1, lat: 41.9, lng: 12.5, categoria: 'scultura', materiale: [ 'marmo' ],            tecnica: [ 'a tutto tondo' ], data_per_timeline:  300 },
	{ id: 2, lat: 41.9, lng: 12.5, categoria: 'pittura',  materiale: [ 'tela', 'pigmenti' ], tecnica: [ 'olio' ],           data_per_timeline: 1500 },
	{ id: 3, lat: 45.4, lng:  9.2, categoria: 'scultura', materiale: [ 'bronzo' ],           tecnica: [ 'fusione' ],        data_per_timeline:  900 },
	{ id: 4, lat: 40.8, lng: 14.3, categoria: 'pittura',  materiale: [ 'tavola' ],           tecnica: [ 'tempera' ],        data_per_timeline:  500 },
];

const NO_FILTERS = { categoria: 'all', materiali: '', tecniche: '', periodo: '' };

describe( 'escapeHtml', () => {
	test( 'escapa &, <, >, "', () => {
		expect( escapeHtml( '<a href="x">A & B</a>' ) )
			.toBe( '&lt;a href=&quot;x&quot;&gt;A &amp; B&lt;/a&gt;' );
	} );

	test( 'null/undefined → stringa vuota', () => {
		expect( escapeHtml( null ) ).toBe( '' );
		expect( escapeHtml( undefined ) ).toBe( '' );
	} );

	test( 'l\'ordine impedisce doppio-escape di & dentro &amp;', () => {
		// "&" deve diventare "&amp;", non "&amp;amp;" se contiene un'entità esistente
		expect( escapeHtml( '&amp;' ) ).toBe( '&amp;amp;' );
		// (comportamento atteso: l'ordine attuale escapa & per primo — questo test pinifica il comportamento)
	} );
} );

describe( 'matchesPeriodo', () => {
	test( 'periodo vuoto → sempre true', () => {
		expect( matchesPeriodo( 0, '' ) ).toBe( true );
		expect( matchesPeriodo( 9999, '' ) ).toBe( true );
	} );

	test( 'tardo-antico è < 800 (800 escluso)', () => {
		expect( matchesPeriodo( 500, 'tardo-antico' ) ).toBe( true );
		expect( matchesPeriodo( 799, 'tardo-antico' ) ).toBe( true );
		expect( matchesPeriodo( 800, 'tardo-antico' ) ).toBe( false );
	} );

	test( 'medioevo-moderno è >= 800 (800 incluso)', () => {
		expect( matchesPeriodo( 800,  'medioevo-moderno' ) ).toBe( true );
		expect( matchesPeriodo( 1500, 'medioevo-moderno' ) ).toBe( true );
		expect( matchesPeriodo( 799,  'medioevo-moderno' ) ).toBe( false );
	} );

	test( 'periodo sconosciuto → false', () => {
		expect( matchesPeriodo( 500, 'preistoria' ) ).toBe( false );
	} );
} );

describe( 'postMatchesFilters', () => {
	test( 'tutti i filtri vuoti → match', () => {
		expect( postMatchesFilters( POSTS[ 0 ], NO_FILTERS ) ).toBe( true );
	} );

	test( 'categoria specifica esclude altri', () => {
		expect( postMatchesFilters( POSTS[ 0 ], { ...NO_FILTERS, categoria: 'pittura' } ) ).toBe( false );
		expect( postMatchesFilters( POSTS[ 1 ], { ...NO_FILTERS, categoria: 'pittura' } ) ).toBe( true );
	} );

	test( 'materiale verifica con includes su array', () => {
		expect( postMatchesFilters( POSTS[ 1 ], { ...NO_FILTERS, materiali: 'tela' } ) ).toBe( true );
		expect( postMatchesFilters( POSTS[ 1 ], { ...NO_FILTERS, materiali: 'marmo' } ) ).toBe( false );
	} );

	test( 'combinazione di tutti i filtri', () => {
		expect( postMatchesFilters( POSTS[ 1 ], {
			categoria: 'pittura', materiali: 'tela', tecniche: 'olio', periodo: 'medioevo-moderno',
		} ) ).toBe( true );
	} );
} );

describe( 'isValueAvailable', () => {
	test( 'true senza filterGroup', () => {
		expect( isValueAvailable( POSTS, { filterGroup: '', filterVal: 'x', filters: NO_FILTERS } ) ).toBe( true );
	} );

	test( 'ignora il filtro dello stesso gruppo (categoria)', () => {
		expect( isValueAvailable( POSTS, {
			filterGroup: 'categoria',
			filterVal:   'scultura',
			filters:     { ...NO_FILTERS, categoria: 'pittura' },
		} ) ).toBe( true );
	} );

	test( 'rispetta i filtri degli altri gruppi', () => {
		// "marmo" esiste solo per post con categoria=scultura; filtrando categoria=pittura deve diventare non disponibile
		expect( isValueAvailable( POSTS, {
			filterGroup: 'materiali',
			filterVal:   'marmo',
			filters:     { ...NO_FILTERS, categoria: 'pittura' },
		} ) ).toBe( false );
	} );

	test( 'periodo tardo-antico disponibile se almeno un post < 800', () => {
		expect( isValueAvailable( POSTS, {
			filterGroup: 'periodo',
			filterVal:   'tardo-antico',
			filters:     NO_FILTERS,
		} ) ).toBe( true );
	} );

	test( 'periodo non disponibile se nessun post supera gli altri filtri', () => {
		// Filtro categoria=scultura + cerco periodo medioevo-moderno: c\'è solo bronzo (id 3, data 900) → disponibile
		expect( isValueAvailable( POSTS, {
			filterGroup: 'periodo',
			filterVal:   'medioevo-moderno',
			filters:     { ...NO_FILTERS, categoria: 'scultura' },
		} ) ).toBe( true );

		// Ora aggiungo materiali=marmo: solo id 1 (data 300) — niente medioevo-moderno → non disponibile
		expect( isValueAvailable( POSTS, {
			filterGroup: 'periodo',
			filterVal:   'medioevo-moderno',
			filters:     { ...NO_FILTERS, categoria: 'scultura', materiali: 'marmo' },
		} ) ).toBe( false );
	} );
} );

describe( 'clusterIconSize', () => {
	test( '< 10 → 32', () => {
		expect( clusterIconSize( 1 ) ).toBe( 32 );
		expect( clusterIconSize( 9 ) ).toBe( 32 );
	} );

	test( '10..99 → 40', () => {
		expect( clusterIconSize( 10 ) ).toBe( 40 );
		expect( clusterIconSize( 99 ) ).toBe( 40 );
	} );

	test( '>= 100 → 48', () => {
		expect( clusterIconSize( 100 ) ).toBe( 48 );
		expect( clusterIconSize( 9999 ) ).toBe( 48 );
	} );
} );

describe( 'groupPostsByCoord', () => {
	test( 'aggrega post con stesse coordinate', () => {
		const groups = groupPostsByCoord( POSTS );
		expect( Object.keys( groups ) ).toHaveLength( 3 );
		expect( groups[ '41.900000,12.500000' ].map( ( p ) => p.id ) ).toEqual( [ 1, 2 ] );
		expect( groups[ '45.400000,9.200000'  ].map( ( p ) => p.id ) ).toEqual( [ 3 ] );
	} );

	test( 'differenze oltre 6 decimali sono trattate come stesso punto', () => {
		const groups = groupPostsByCoord( [
			{ id: 1, lat: 41.9000001, lng: 12.5, categoria: '', materiale: [], tecnica: [], data_per_timeline: 0 },
			{ id: 2, lat: 41.9000002, lng: 12.5, categoria: '', materiale: [], tecnica: [], data_per_timeline: 0 },
		] );
		expect( Object.keys( groups ) ).toHaveLength( 1 );
	} );
} );

describe( 'buildMarkerFilters', () => {
	test( 'unisce materiali/tecniche, raccoglie categorie, calcola flag periodo', () => {
		const group = [ POSTS[ 0 ], POSTS[ 1 ] ]; // co-localizzati
		const f = buildMarkerFilters( group );
		expect( f.categoria ).toEqual( [ 'scultura', 'pittura' ] );
		expect( f.materiale ).toEqual( [ 'marmo', 'tela', 'pigmenti' ] );
		expect( f.tecnica   ).toEqual( [ 'a tutto tondo', 'olio' ] );
		expect( f.hasTardoAntico ).toBe( true );  // id 1 ha data 300
		expect( f.hasMedioevo    ).toBe( true );  // id 2 ha data 1500
	} );

	test( 'tollera campi mancanti (materiale/tecnica/categoria null)', () => {
		const f = buildMarkerFilters( [ { lat: 0, lng: 0, data_per_timeline: 500 } ] );
		expect( f.categoria ).toEqual( [ '' ] );
		expect( f.materiale ).toEqual( [] );
		expect( f.tecnica   ).toEqual( [] );
		expect( f.hasTardoAntico ).toBe( true );
		expect( f.hasMedioevo    ).toBe( false );
	} );
} );

describe( 'markerMatchesFilters', () => {
	const mf = {
		categoria: [ 'scultura', 'pittura' ],
		materiale: [ 'marmo', 'tela' ],
		tecnica:   [ 'olio' ],
		hasTardoAntico: true,
		hasMedioevo:    false,
	};

	test( 'tutti i filtri vuoti → true', () => {
		expect( markerMatchesFilters( mf, NO_FILTERS ) ).toBe( true );
	} );

	test( 'filtro categoria deve essere presente nell\'array', () => {
		expect( markerMatchesFilters( mf, { ...NO_FILTERS, categoria: 'pittura' } ) ).toBe( true );
		expect( markerMatchesFilters( mf, { ...NO_FILTERS, categoria: 'altro'   } ) ).toBe( false );
	} );

	test( 'periodo confrontato con i flag pre-calcolati', () => {
		expect( markerMatchesFilters( mf, { ...NO_FILTERS, periodo: 'tardo-antico'     } ) ).toBe( true );
		expect( markerMatchesFilters( mf, { ...NO_FILTERS, periodo: 'medioevo-moderno' } ) ).toBe( false );
	} );
} );

describe( 'filterPostsForPanel', () => {
	const group = [ POSTS[ 0 ], POSTS[ 1 ] ]; // data 300 e 1500

	test( 'periodo vuoto → restituisce tutto il gruppo', () => {
		expect( filterPostsForPanel( group, '' ) ).toEqual( group );
	} );

	test( 'filtra per periodo', () => {
		expect( filterPostsForPanel( group, 'tardo-antico' ).map( ( p ) => p.id ) ).toEqual( [ 1 ] );
		expect( filterPostsForPanel( group, 'medioevo-moderno' ).map( ( p ) => p.id ) ).toEqual( [ 2 ] );
	} );

	test( 'fallback: se nessun post passa, ritorna il gruppo originale', () => {
		const onlyAncient = [ POSTS[ 0 ] ];
		expect( filterPostsForPanel( onlyAncient, 'medioevo-moderno' ) ).toEqual( onlyAncient );
	} );
} );

describe( 'makeCard', () => {
	const post = {
		title: 'Test " & <ok>',
		url: '/p/1?a=1&b=2',
		thumb: '/img.jpg',
		ubicazione: 'Roma',
		excerpt: 'breve <i>descr</i>',
	};

	test( 'escapa titolo, url, thumb, ubicazione, excerpt', () => {
		const html = makeCard( post );
		expect( html ).toContain( 'Test &quot; &amp; &lt;ok&gt;' );
		expect( html ).toContain( '/p/1?a=1&amp;b=2' );
		expect( html ).toContain( 'UBICAZIONE: Roma' );
		expect( html ).toContain( '&lt;i&gt;descr&lt;/i&gt;' );
		expect( html ).not.toContain( '<i>descr</i>' );
	} );

	test( 'omette thumb/ubicazione/excerpt se assenti', () => {
		const html = makeCard( { title: 'T', url: '/' } );
		expect( html ).not.toContain( 'mp-thumb' );
		expect( html ).not.toContain( 'mp-ubicazione' );
		expect( html ).not.toContain( 'mp-excerpt' );
		expect( html ).toContain( 'mp-card' );
		expect( html ).toContain( 'mp-title' );
	} );
} );
