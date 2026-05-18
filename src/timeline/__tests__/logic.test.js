import {
	filterAndSortPosts,
	isValueAvailable,
	isPillInvisible,
	markerPercent,
	formatCenturyLabel,
	scrubberJumpIndex,
} from '../logic';

const POSTS = [
	{ id: 1, sort_key: -300, categoria: 'scultura', materiale: [ 'marmo' ],            tecnica: [ 'a tutto tondo' ] },
	{ id: 2, sort_key:   50, categoria: 'pittura',  materiale: [ 'tela', 'pigmenti' ], tecnica: [ 'olio' ] },
	{ id: 3, sort_key:  150, categoria: 'scultura', materiale: [ 'bronzo' ],           tecnica: [ 'fusione' ] },
	{ id: 4, sort_key:  900, categoria: 'pittura',  materiale: [ 'tavola' ],           tecnica: [ 'tempera' ] },
];

const NO_FILTERS = { categoria: 'all', materiali: '', tecniche: '' };

describe( 'filterAndSortPosts', () => {
	test( 'filtra per intervallo di secolo [min, max) e ordina ascendente', () => {
		const out = filterAndSortPosts( POSTS, {
			activeCenturyMin: 0,
			activeCenturyMax: 200,
			filters: NO_FILTERS,
			sortAsc: true,
		} );
		expect( out.map( ( p ) => p.id ) ).toEqual( [ 2, 3 ] );
	} );

	test( 'ordina discendente quando sortAsc è false', () => {
		const out = filterAndSortPosts( POSTS, {
			activeCenturyMin: -1000,
			activeCenturyMax: 1000,
			filters: NO_FILTERS,
			sortAsc: false,
		} );
		expect( out.map( ( p ) => p.id ) ).toEqual( [ 4, 3, 2, 1 ] );
	} );

	test( 'max è esclusivo: post con sort_key === max non incluso', () => {
		const out = filterAndSortPosts( POSTS, {
			activeCenturyMin: 0,
			activeCenturyMax: 150,
			filters: NO_FILTERS,
			sortAsc: true,
		} );
		expect( out.map( ( p ) => p.id ) ).toEqual( [ 2 ] );
	} );

	test( 'combina filtri categoria + materiali (substring nell\'array)', () => {
		const out = filterAndSortPosts( POSTS, {
			activeCenturyMin: -1000,
			activeCenturyMax: 1000,
			filters: { categoria: 'pittura', materiali: 'tela', tecniche: '' },
			sortAsc: true,
		} );
		expect( out.map( ( p ) => p.id ) ).toEqual( [ 2 ] );
	} );

	test( 'sort_key mancante è trattato come 0', () => {
		const posts = [ { id: 9, categoria: 'x', materiale: [], tecnica: [] } ];
		const out = filterAndSortPosts( posts, {
			activeCenturyMin: 0,
			activeCenturyMax: 1,
			filters: NO_FILTERS,
			sortAsc: true,
		} );
		expect( out ).toHaveLength( 1 );
	} );
} );

describe( 'isValueAvailable', () => {
	test( 'true se il valore esiste nel secolo, ignorando il filtro dello stesso gruppo', () => {
		// "scultura" è esclusa dal filtro categoria ma deve restare disponibile
		const ok = isValueAvailable( POSTS, {
			filterGroup: 'categoria',
			filterVal:   'scultura',
			filters:     { categoria: 'pittura', materiali: '', tecniche: '' },
			activeCenturyMin: -1000,
			activeCenturyMax:  1000,
		} );
		expect( ok ).toBe( true );
	} );

	test( 'false se nessun post nel secolo attivo soddisfa filterVal', () => {
		const ok = isValueAvailable( POSTS, {
			filterGroup: 'categoria',
			filterVal:   'scultura',
			filters:     NO_FILTERS,
			activeCenturyMin: 800,
			activeCenturyMax: 1000,
		} );
		expect( ok ).toBe( false );
	} );

	test( 'rispetta i filtri degli altri gruppi', () => {
		// filterGroup=materiali, ma cerco "marmo" e ho già filtrato categoria=pittura
		const ok = isValueAvailable( POSTS, {
			filterGroup: 'materiali',
			filterVal:   'marmo',
			filters:     { categoria: 'pittura', materiali: '', tecniche: '' },
			activeCenturyMin: -1000,
			activeCenturyMax:  1000,
		} );
		expect( ok ).toBe( false );
	} );

	test( 'true di default senza filterGroup', () => {
		expect( isValueAvailable( POSTS, { filterGroup: '', filterVal: 'x', filters: NO_FILTERS, activeCenturyMin: 0, activeCenturyMax: 1 } ) ).toBe( true );
	} );
} );

describe( 'isPillInvisible', () => {
	test( 'true se il valore non compare in alcun post del secolo', () => {
		expect( isPillInvisible( POSTS, {
			filterGroup: 'materiali',
			filterVal:   'bronzo',
			activeCenturyMin: 800,
			activeCenturyMax: 1000,
		} ) ).toBe( true );
	} );

	test( 'false se almeno un post del secolo lo contiene', () => {
		expect( isPillInvisible( POSTS, {
			filterGroup: 'materiali',
			filterVal:   'bronzo',
			activeCenturyMin: 0,
			activeCenturyMax: 200,
		} ) ).toBe( false );
	} );
} );

describe( 'markerPercent', () => {
	test( 'estremi e centro', () => {
		expect( markerPercent( 0,   0, 100 ) ).toBe( '0.00%' );
		expect( markerPercent( 50,  0, 100 ) ).toBe( '50.00%' );
		expect( markerPercent( 100, 0, 100 ) ).toBe( '100.00%' );
	} );

	test( 'clamp fuori intervallo', () => {
		expect( markerPercent( -50,  0, 100 ) ).toBe( '0.00%' );
		expect( markerPercent( 200,  0, 100 ) ).toBe( '100.00%' );
	} );

	test( 'min === max ritorna 50%', () => {
		expect( markerPercent( 42, 50, 50 ) ).toBe( '50%' );
	} );

	test( 'sort_key undefined trattato come 0', () => {
		expect( markerPercent( undefined, 0, 100 ) ).toBe( '0.00%' );
	} );
} );

describe( 'formatCenturyLabel', () => {
	test( 'anni positivi', () => {
		expect( formatCenturyLabel( 1500, 1600 ) ).toBe( '1500–1600' );
	} );

	test( 'anni negativi mostrano a.C.', () => {
		expect( formatCenturyLabel( -500, -400 ) ).toBe( '500 a.C.–-400' );
	} );
} );

describe( 'scrubberJumpIndex', () => {
	const visible = [
		{ sort_key:  0 },
		{ sort_key: 50 },
		{ sort_key: 100 },
	];

	test( 'clientX all\'estrema sinistra → primo post', () => {
		expect( scrubberJumpIndex( 0, 0, 200, visible ) ).toBe( 0 );
	} );

	test( 'clientX all\'estrema destra → ultimo post', () => {
		expect( scrubberJumpIndex( 200, 0, 200, visible ) ).toBe( 2 );
	} );

	test( 'clientX al centro → post centrale', () => {
		expect( scrubberJumpIndex( 100, 0, 200, visible ) ).toBe( 1 );
	} );

	test( 'clamp se clientX fuori dalla track', () => {
		expect( scrubberJumpIndex( -50, 0, 200, visible ) ).toBe( 0 );
		expect( scrubberJumpIndex( 999, 0, 200, visible ) ).toBe( 2 );
	} );

	test( 'lista vuota → null', () => {
		expect( scrubberJumpIndex( 50, 0, 200, [] ) ).toBe( null );
	} );

	test( 'tutti i post con stesso sort_key → 0', () => {
		expect( scrubberJumpIndex( 100, 0, 200, [ { sort_key: 5 }, { sort_key: 5 } ] ) ).toBe( 0 );
	} );
} );
