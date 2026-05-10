<?php
// This file is generated. Do not modify it manually.
return array(
	'acf-field' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'ttf-child/acf-field',
		'title' => 'Campo ACF',
		'category' => 'theme',
		'icon' => 'tag',
		'description' => 'Visualizza un campo ACF con label e variante grafica. Se il valore è vuoto il blocco non emette alcun markup.',
		'supports' => array(
			'html' => false
		),
		'attributes' => array(
			'fieldKey' => array(
				'type' => 'string',
				'default' => ''
			),
			'label' => array(
				'type' => 'string',
				'default' => ''
			),
			'variant' => array(
				'type' => 'string',
				'default' => 'standard'
			)
		),
		'textdomain' => 'acf-field',
		'editorScript' => 'file:./index.js',
		'style' => 'file:./style-index.css',
		'render' => 'file:./render.php'
	),
	'featured-zoom' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'ttf-child/featured-zoom',
		'title' => 'Featured Image Zoom',
		'category' => 'media',
		'icon' => 'search',
		'description' => 'Immagine in evidenza con controlli zoom.',
		'supports' => array(
			'html' => false,
			'align' => array(
				'wide',
				'full'
			),
			'interactivity' => true
		),
		'textdomain' => 'featured-zoom',
		'editorScript' => 'file:./index.js',
		'viewScriptModule' => 'file:./view.js',
		'style' => 'file:./style-index.css',
		'render' => 'file:./render.php'
	),
	'mappa-interattiva' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'ttf-child/mappa-interattiva',
		'title' => 'Mappa Interattiva',
		'category' => 'theme',
		'icon' => 'location',
		'description' => 'Mappa interattiva Leaflet con pin geolocalizzati degli articoli.',
		'supports' => array(
			'html' => false,
			'align' => array(
				'wide',
				'full'
			),
			'interactivity' => true
		),
		'attributes' => array(
			'postSource' => array(
				'type' => 'string',
				'default' => 'all'
			),
			'selectedCategory' => array(
				'type' => 'number',
				'default' => 0
			),
			'mapHeight' => array(
				'type' => 'number',
				'default' => 520
			),
			'mapStyle' => array(
				'type' => 'string',
				'default' => 'natural'
			)
		),
		'textdomain' => 'jerus-organo',
		'editorScript' => 'file:./index.js',
		'viewScriptModule' => 'file:./view.js',
		'style' => 'file:./style-index.css',
		'render' => 'file:./render.php'
	),
	'post-list' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'ttf-child/post-list',
		'title' => 'Post List',
		'category' => 'theme',
		'icon' => 'list-view',
		'description' => 'Lista post con filtri ACF e caricamento infinito.',
		'supports' => array(
			'html' => false,
			'interactivity' => true
		),
		'attributes' => array(
			'postSource' => array(
				'type' => 'string',
				'default' => 'all'
			),
			'selectedCategories' => array(
				'type' => 'array',
				'items' => array(
					'type' => 'number'
				),
				'default' => array(
					
				)
			),
			'showFilters' => array(
				'type' => 'boolean',
				'default' => true
			),
			'imageRatio' => array(
				'type' => 'string',
				'default' => '4/3'
			)
		),
		'textdomain' => 'post-list',
		'editorScript' => 'file:./index.js',
		'viewScriptModule' => 'file:./view.js',
		'style' => 'file:./style-index.css',
		'render' => 'file:./render.php'
	),
	'timeline' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'ttf-child/timeline',
		'title' => 'Timeline 3D',
		'category' => 'theme',
		'icon' => 'calendar',
		'description' => 'Timeline tridimensionale sfogliabile con filtri ACF.',
		'supports' => array(
			'html' => false,
			'interactivity' => true
		),
		'attributes' => array(
			'postSource' => array(
				'type' => 'string',
				'default' => 'all'
			),
			'allowedViews' => array(
				'type' => 'string',
				'default' => 'both'
			),
			'selectedCategory' => array(
				'type' => 'number',
				'default' => 0
			),
			'showScrubber' => array(
				'type' => 'boolean',
				'default' => true
			)
		),
		'textdomain' => 'timeline',
		'editorScript' => 'file:./index.js',
		'viewScriptModule' => 'file:./view.js',
		'style' => 'file:./style-index.css',
		'render' => 'file:./render.php'
	)
);
