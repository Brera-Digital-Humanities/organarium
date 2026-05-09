const defaultConfig = require('@wordpress/scripts/config/webpack.config');

// Con --experimental-modules wp-scripts esporta un array (scripts + modules);
// senza, esporta un singolo oggetto. Lo stile globale va aggiunto alla
// config "scripts" (la prima).
const configs = Array.isArray(defaultConfig) ? defaultConfig : [defaultConfig];

const [scriptsConfig, ...rest] = configs;

const withGlobalStyle = {
	...scriptsConfig,
	entry: {
		...scriptsConfig.entry(),
		'style/style': './src/style/style.scss',
	},
};

module.exports = Array.isArray(defaultConfig)
	? [withGlobalStyle, ...rest]
	: withGlobalStyle;
