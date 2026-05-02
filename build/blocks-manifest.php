<?php
// This file is generated. Do not modify it manually.
return array(
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
			)
		),
		'textdomain' => 'timeline',
		'editorScript' => 'file:./index.js',
		'viewScriptModule' => 'file:./view.js',
		'style' => 'file:./style-index.css',
		'render' => 'file:./render.php'
	)
);
