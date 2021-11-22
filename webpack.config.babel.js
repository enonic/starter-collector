/* eslint-disable no-console */
import {
	ESBuildMinifyPlugin,
	ESBuildPlugin
} from 'esbuild-loader';
import path from 'path';
//import {print} from 'q-i';
//import TerserPlugin from 'terser-webpack-plugin';

import webpack from 'webpack';


//──────────────────────────────────────────────────────────────────────────────
// Common
//──────────────────────────────────────────────────────────────────────────────
const MODE = 'development';
//const MODE = 'production';

const minimize = MODE === 'production';
//const minimize = true;
//const minimize = false;

const STATS = {
	colors: true,
	hash: false,
	modules: false,
	moduleTrace: false,
	timings: false,
	version: false
};

const WEBPACK_CONFIG = [];

//──────────────────────────────────────────────────────────────────────────────
// Enonic XP server-side ECMAScript
//──────────────────────────────────────────────────────────────────────────────
const SRC_DIR = 'src/main/resources';
const DST_DIR = 'build/resources/main';

const SS_EXTERNALS = [
	'/lib/cache', // lib-explorer
	/^\/lib\/http-client.*$/,

	'/lib/util',
	/^\/lib\/util\//,

	/^\/lib\/xp\//
];

const SS_ALIAS = {
	'@enonic/js-utils': path.resolve(__dirname, './node_modules/@enonic/js-utils/dist/cjs/index.js')
	//myGlobal: path.resolve(__dirname, 'src/main/resources/global')
};

if (MODE === 'production') {
	SS_EXTERNALS.push(/^\/lib\/explorer/);
	SS_EXTERNALS.push(/^\/lib\/explorer\/.*/);
} else {
	SS_ALIAS['/lib/explorer'] = path.resolve(__dirname, '../lib-explorer/src/main/resources/lib/explorer/');
}

const SERVER_SIDE_ECMASCRIPT_CONFIG = {
	context: path.resolve(__dirname, SRC_DIR),
	devtool: false, // Don't waste time generating sourceMaps
	entry: {
		'main' : './main.es',
		'tasks/collect/collect' : './tasks/collect/collect.es'
	},
	externals: SS_EXTERNALS,
	mode: MODE,
	module: {
		rules: [{
			exclude: [ // It takes time to transpile, if you know they don't need transpilation to run in Enonic you may list them here:
				/node_modules[\\/]core-js/, // will cause errors if they are transpiled by Babel
				/node_modules[\\/]webpack[\\/]buildin/ // will cause errors if they are transpiled by Babel
			],
			test: /\.(es6?|tsx?|js)$/, // Will need js for node module depenencies
			use: [{
				loader: 'babel-loader',
				options: {
					babelrc: false, // The .babelrc file should only be used to transpile config files.
					comments: false,
					compact: false,
					minified: false,
					plugins: [
						'@babel/plugin-transform-arrow-functions',
						'@babel/plugin-proposal-class-properties',
						'@babel/plugin-proposal-export-default-from', // export v from 'mod'; // I think it adds a default export
						'@babel/plugin-proposal-export-namespace-from', // export * as ns from 'mod';
						'@babel/plugin-proposal-object-rest-spread',
						'@babel/plugin-syntax-dynamic-import', // Allow parsing of import()
						'@babel/plugin-syntax-throw-expressions',
						'@babel/plugin-transform-block-scoped-functions',
						'@babel/plugin-transform-block-scoping',
						'@babel/plugin-transform-classes', // tasks/syncSite/Progress.es
						'@babel/plugin-transform-computed-properties',
						'@babel/plugin-transform-destructuring',
						'@babel/plugin-transform-duplicate-keys',
						'@babel/plugin-transform-for-of',
						'@babel/plugin-transform-function-name',
						'@babel/plugin-transform-instanceof',
						'@babel/plugin-transform-literals',
						'@babel/plugin-transform-new-target',
						'@babel/plugin-transform-member-expression-literals',
						'@babel/plugin-transform-modules-commonjs', // transforms ECMAScript modules to CommonJS
						'@babel/plugin-transform-object-assign', // Not used locally, perhaps in node_modules?
						'@babel/plugin-transform-object-super',
						'@babel/plugin-transform-parameters',
						'@babel/plugin-transform-property-literals',
						'@babel/plugin-transform-property-mutators',
						'@babel/plugin-transform-reserved-words',
						'@babel/plugin-transform-shorthand-properties',
						'@babel/plugin-transform-spread',
						'@babel/plugin-transform-sticky-regex',
						'@babel/plugin-transform-template-literals',
						'@babel/plugin-transform-typeof-symbol',
						'@babel/plugin-transform-unicode-escapes', // This plugin is included in @babel/preset-env
						'@babel/plugin-transform-unicode-regex',
						'array-includes'
					], // plugins
					presets: [
						//'@babel/preset-typescript', // Why did I ever add this???
						[
							'@babel/preset-env',
							{
								corejs: 3, // Needed when useBuiltIns: usage

								// Enables all transformation plugins and as a result,
								// your code is fully compiled to ES5
								forceAllTransforms: true,

								targets: {
									esmodules: false, // Enonic XP doesn't support ECMAScript Modules

									// https://node.green/
									node: '0.10.48'
									//node: '5.12.0'

								},

								//useBuiltIns: false // no polyfills are added automatically
								useBuiltIns: 'entry' // replaces direct imports of core-js to imports of only the specific modules required for a target environment
								//useBuiltIns: 'usage' // polyfills will be added automatically when the usage of some feature is unsupported in target environment
							}
						]
					] // presets
				} // options
			}] // use
		}] // rules
	}, // modules
	optimization: {
		minimize,
		/*minimizer: MODE === 'production' ? [
		] : []*/
	},
	output: {
		filename: '[name].js',
		libraryTarget: 'commonjs',
		path: path.join(__dirname, DST_DIR)
	},
	performance: {
		hints: false
	},
	plugins: [
		/*new webpack.ProvidePlugin({
			global: '@enonic/global-polyfill'
		})*/
	],
	resolve: {
		alias: SS_ALIAS,
		extensions: [
			//'mjs',
			//'jsx',
			//'esm',
			'es',
			//'es6',
			'js',
			'json'
		].map(ext => `.${ext}`)
	},
	stats: STATS
};
WEBPACK_CONFIG.push(SERVER_SIDE_ECMASCRIPT_CONFIG);

//──────────────────────────────────────────────────────────────────────────────
// Client-side ECMAScript
//──────────────────────────────────────────────────────────────────────────────
const ES_BUILD_TARGET = 'es2015';
//const ES_BUILD_TARGET = 'esnext';

const SRC_ASSETS_DIR = 'src/main/resources/assets';
const DST_ASSETS_DIR = 'build/resources/main/assets';

const CLIENT_SIDE_ES_CONFIG = {
	context: path.join(__dirname, SRC_ASSETS_DIR, 'js', 'react'),
	devtool: false, // Don't waste time generating sourceMaps
	entry: {
		'Collector': './Collector.jsx'
	},
	externals: {
		react: 'React',
		'react-dom': 'ReactDOM'
	},
	mode: MODE,
	module: {
		rules: [{
			exclude: [ // It takes time to transpile, if you know they don't need transpilation to run in Enonic you may list them here:
				/node_modules[\\/]core-js/, // will cause errors if they are transpiled by Babel
				/node_modules[\\/]webpack[\\/]buildin/ // will cause errors if they are transpiled by Babel
			],
			test: /\.jsx$/,
			loader: 'esbuild-loader',
			options: {
				loader: 'jsx', // Remove this if you're not using JSX
				target: ES_BUILD_TARGET
			}
		}]
	}, // module
	optimization: {
		minimize,
		minimizer: MODE === 'development'
			? []
			: [
				new ESBuildMinifyPlugin({
					target: ES_BUILD_TARGET
				})
			]
	},
	output: {
		filename: '[name].esm.js',
		library: 'Lib[name]',
		libraryTarget: 'var', // variable defined in root scope
		path: path.join(__dirname, DST_ASSETS_DIR, 'js', 'react')
	},
	performance: {
		hints: false
	},
	plugins: [
		/*new webpack.ProvidePlugin({
			Buffer: ['buffer', 'Buffer']
		}),*/
		new ESBuildPlugin()
	],
	resolve: {
		alias: {
			'semantic-ui-react-form': MODE === 'development'
				? path.resolve(__dirname, '../semantic-ui-react-form/src/index.mjs')
				: path.resolve(__dirname, './node_modules/@enonic/semantic-ui-react-form/src/index.mjs')
		},
		extensions: ['mjs', 'jsx', 'esm', 'es', 'es6', 'js', 'json'].map(ext => `.${ext}`)
	},
	stats: STATS
};
WEBPACK_CONFIG.push(CLIENT_SIDE_ES_CONFIG);

//──────────────────────────────────────────────────────────────────────────────
// Common
//──────────────────────────────────────────────────────────────────────────────
//print({WEBPACK_CONFIG}, { maxItems: Infinity });
//process.exit();

export { WEBPACK_CONFIG as default };
