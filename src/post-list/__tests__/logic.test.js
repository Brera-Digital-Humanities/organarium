import {
	postMatchesFilters,
	filterAndSortPosts,
	isValueAvailable,
	cardOrder,
	isCardVisible,
	countFilteredPosts,
} from '../logic';

const POSTS = [
	{ id: 1, sort_key:  100, categoria: 'scultura', materiale: [ 'marmo' ],            tecnica: [ 'a tutto tondo' ] },
	{ id: 2, sort_key:  500, categoria: 'pittura',  materiale: [ 'tela', 'pigmenti' ], tecnica: [ 'olio' ] },
	{ id: 3, sort_key:  900, categoria: 'scultura', materiale: [ 'bronzo' ],           tecnica: [ 'fusione' ] },
	{ id: 4, sort_key: 1500, categoria: 'pittura',  materiale: [ 'tavola' ],           tecnica: [ 'tempera' ] },
];

const NO_FILTERS = { categoria: 'all', materiali: '', tecniche: '' };

describe( 'postMatchesFilters', () => {
	test( 'tutti i filtri vuoti → match', () => {
		expect( postMatchesFilters( POSTS[ 0 ], NO_FILTERS ) ).toBe( true );
	} );

	test( 'esclude categoria non coincidente', () => {
		expect( postMatchesFilters( POSTS[ 0 ], { ...NO_FILTERS, categoria: 'pittura' } ) ).toBe( false );
	} );

	test( 'materiale è verificato con includes', () => {
		expect( postMatchesFilters( POSTS[ 1 ], { ...NO_FILTERS, materiali: 'tela'  } ) ).toBe( true );
		expect( postMatchesFilters( POSTS[ 1 ], { ...NO_FILTERS, materiali: 'marmo' } ) ).toBe( false );
	} );

	test( 'combinazione categoria + materiali + tecniche', () => {
		expect( postMatchesFilters( POSTS[ 1 ], {
			categoria: 'pittura', materiali: 'tela', tecniche: 'olio',
		} ) ).toBe( true );
	} );
} );

describe( 'filterAndSortPosts', () => {
	test( 'ordina ascendente per sort_key', () => {
		const out = filterAndSortPosts( POSTS, { filters: NO_FILTERS, sortAsc: true } );
		expect( out.map( ( p ) => p.id ) ).toEqual( [ 1, 2, 3, 4 ] );
	} );

	test( 'ordina discendente per sort_key', () => {
		const out = filterAndSortPosts( POSTS, { filters: NO_FILTERS, sortAsc: false } );
		expect( out.map( ( p ) => p.id ) ).toEqual( [ 4, 3, 2, 1 ] );
	} );

	test( 'applica filtri prima dell\'ordinamento', () => {
		const out = filterAndSortPosts( POSTS, {
			filters: { ...NO_FILTERS, categoria: 'scultura' },
			sortAsc: true,
		} );
		expect( out.map( ( p ) => p.id ) ).toEqual( [ 1, 3 ] );
	} );

	test( 'sort_key mancante è trattato come 0', () => {
		const posts = [
			{ id: 9, categoria: 'x', materiale: [], tecnica: [] },
			{ id: 8, sort_key: 5, categoria: 'x', materiale: [], tecnica: [] },
		];
		const out = filterAndSortPosts( posts, { filters: NO_FILTERS, sortAsc: true } );
		expect( out.map( ( p ) => p.id ) ).toEqual( [ 9, 8 ] );
	} );
} );

describe( 'isValueAvailable', () => {
	test( 'true senza filterGroup', () => {
		expect( isValueAvailable( POSTS, { filterGroup: '', filterVal: 'x', filters: NO_FILTERS } ) ).toBe( true );
	} );

	test( 'ignora il filtro del proprio gruppo', () => {
		expect( isValueAvailable( POSTS, {
			filterGroup: 'categoria',
			filterVal:   'scultura',
			filters:     { ...NO_FILTERS, categoria: 'pittura' },
		} ) ).toBe( true );
	} );

	test( 'rispetta i filtri degli altri gruppi', () => {
		expect( isValueAvailable( POSTS, {
			filterGroup: 'materiali',
			filterVal:   'marmo',
			filters:     { ...NO_FILTERS, categoria: 'pittura' },
		} ) ).toBe( false );
	} );

	test( 'false se valore non compare in nessun post compatibile', () => {
		expect( isValueAvailable( POSTS, {
			filterGroup: 'tecniche',
			filterVal:   'inesistente',
			filters:     NO_FILTERS,
		} ) ).toBe( false );
	} );
} );

describe( 'cardOrder', () => {
	const filtered = [ POSTS[ 1 ], POSTS[ 2 ], POSTS[ 0 ] ];

	test( 'restituisce indice 1-based del post nella lista filtrata', () => {
		expect( cardOrder( filtered, POSTS[ 1 ] ) ).toBe( 1 );
		expect( cardOrder( filtered, POSTS[ 0 ] ) ).toBe( 3 );
	} );

	test( '9999 se il post non è nella lista filtrata', () => {
		expect( cardOrder( filtered, POSTS[ 3 ] ) ).toBe( 9999 );
	} );

	test( '9999 se post mancante', () => {
		expect( cardOrder( filtered, null ) ).toBe( 9999 );
		expect( cardOrder( filtered, undefined ) ).toBe( 9999 );
	} );
} );

describe( 'isCardVisible', () => {
	const filtered = [ POSTS[ 0 ], POSTS[ 1 ], POSTS[ 2 ], POSTS[ 3 ] ];

	test( 'true se il post è entro i primi visibleCount', () => {
		expect( isCardVisible( filtered, POSTS[ 0 ], 2 ) ).toBe( true );
		expect( isCardVisible( filtered, POSTS[ 1 ], 2 ) ).toBe( true );
	} );

	test( 'false se il post supera la soglia visibleCount', () => {
		expect( isCardVisible( filtered, POSTS[ 2 ], 2 ) ).toBe( false );
		expect( isCardVisible( filtered, POSTS[ 3 ], 2 ) ).toBe( false );
	} );

	test( 'false se il post non è nella lista filtrata', () => {
		expect( isCardVisible( filtered, { id: 99 }, 10 ) ).toBe( false );
	} );

	test( 'false se post mancante', () => {
		expect( isCardVisible( filtered, null, 10 ) ).toBe( false );
	} );
} );

describe( 'countFilteredPosts', () => {
	test( 'conta tutti se nessun filtro', () => {
		expect( countFilteredPosts( POSTS, NO_FILTERS ) ).toBe( 4 );
	} );

	test( 'conta solo i compatibili', () => {
		expect( countFilteredPosts( POSTS, { ...NO_FILTERS, categoria: 'pittura' } ) ).toBe( 2 );
	} );

	test( '0 se nessun match', () => {
		expect( countFilteredPosts( POSTS, { ...NO_FILTERS, categoria: 'fotografia' } ) ).toBe( 0 );
	} );
} );
