import {
	matchesPeriodo,
	postMatchesFilters,
	isValueAvailable,
	filterAndSortPosts,
} from '../filters-logic';

const POSTS = [
	{ id: 1, sort_key: 100, categoria: 'scultura', materiale: [ 'marmo' ],            tecnica: [ 'a tutto tondo' ], data_per_timeline:  300 },
	{ id: 2, sort_key: 500, categoria: 'pittura',  materiale: [ 'tela', 'pigmenti' ], tecnica: [ 'olio' ],          data_per_timeline: 1500 },
	{ id: 3, sort_key: 900, categoria: 'scultura', materiale: [ 'bronzo' ],           tecnica: [ 'fusione' ],       data_per_timeline:  900 },
];

const NO_FILTERS         = { categoria: 'all', materiali: '', tecniche: '' };
const NO_FILTERS_PERIODO = { categoria: 'all', materiali: '', tecniche: '', periodo: '' };

describe( 'matchesPeriodo', () => {
	test( 'periodo vuoto → true', () => {
		expect( matchesPeriodo( 0, '' ) ).toBe( true );
	} );

	test( 'tardo-antico < 800 (800 escluso)', () => {
		expect( matchesPeriodo( 799, 'tardo-antico' ) ).toBe( true );
		expect( matchesPeriodo( 800, 'tardo-antico' ) ).toBe( false );
	} );

	test( 'medioevo-moderno >= 800 (800 incluso)', () => {
		expect( matchesPeriodo( 800, 'medioevo-moderno' ) ).toBe( true );
		expect( matchesPeriodo( 799, 'medioevo-moderno' ) ).toBe( false );
	} );

	test( 'periodo sconosciuto → false', () => {
		expect( matchesPeriodo( 500, 'preistoria' ) ).toBe( false );
	} );
} );

describe( 'postMatchesFilters', () => {
	test( 'ignora periodo se la chiave non è presente nei filtri', () => {
		// timeline / post-list non passano `periodo`: il post deve passare comunque
		expect( postMatchesFilters( POSTS[ 0 ], NO_FILTERS ) ).toBe( true );
	} );

	test( 'applica periodo quando è presente nei filtri', () => {
		expect( postMatchesFilters( POSTS[ 0 ], { ...NO_FILTERS_PERIODO, periodo: 'tardo-antico' } ) ).toBe( true );
		expect( postMatchesFilters( POSTS[ 1 ], { ...NO_FILTERS_PERIODO, periodo: 'tardo-antico' } ) ).toBe( false );
	} );

	test( 'periodo vuoto è equivalente ad assenza di filtro', () => {
		expect( postMatchesFilters( POSTS[ 1 ], NO_FILTERS_PERIODO ) ).toBe( true );
	} );
} );

describe( 'isValueAvailable', () => {
	test( 'extraMatch limita lo spazio di ricerca', () => {
		// Restringo ai post con sort_key >= 800: solo id 3 (scultura/bronzo)
		const ok = isValueAvailable( POSTS, {
			filterGroup: 'materiali',
			filterVal:   'marmo',
			filters:     NO_FILTERS,
			extraMatch:  ( p ) => ( p.sort_key ?? 0 ) >= 800,
		} );
		expect( ok ).toBe( false );
	} );

	test( 'gruppo periodo: cerca pill di periodo rispettando gli altri filtri', () => {
		expect( isValueAvailable( POSTS, {
			filterGroup: 'periodo',
			filterVal:   'tardo-antico',
			filters:     NO_FILTERS_PERIODO,
		} ) ).toBe( true );

		// Con categoria=pittura resta solo id 2 (data 1500) → tardo-antico non disponibile
		expect( isValueAvailable( POSTS, {
			filterGroup: 'periodo',
			filterVal:   'tardo-antico',
			filters:     { ...NO_FILTERS_PERIODO, categoria: 'pittura' },
		} ) ).toBe( false );
	} );

	test( 'senza filterGroup → true', () => {
		expect( isValueAvailable( POSTS, { filterGroup: '', filterVal: 'x', filters: NO_FILTERS } ) ).toBe( true );
	} );
} );

describe( 'filterAndSortPosts', () => {
	test( 'extraFilter combinato con filtri standard', () => {
		const out = filterAndSortPosts( POSTS, {
			filters:     NO_FILTERS,
			sortAsc:     true,
			extraFilter: ( p ) => ( p.sort_key ?? 0 ) < 700,
		} );
		expect( out.map( ( p ) => p.id ) ).toEqual( [ 1, 2 ] );
	} );

	test( 'senza extraFilter ordina e filtra normalmente', () => {
		const out = filterAndSortPosts( POSTS, { filters: NO_FILTERS, sortAsc: false } );
		expect( out.map( ( p ) => p.id ) ).toEqual( [ 3, 2, 1 ] );
	} );
} );
