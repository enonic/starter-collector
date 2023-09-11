/* eslint-disable no-console */
import { EsbuildPlugin } from 'esbuild-loader';
import { globSync } from 'glob';
import path from 'path';
import { print } from 'q-i';
// import TerserPlugin from 'terser-webpack-plugin';

import webpack from 'webpack';

if (process.env.LOG_LEVEL_FROM_GRADLE === 'INFO') {
	print({NODE_ENV: process.env.NODE_ENV});
}

//──────────────────────────────────────────────────────────────────────────────
// Common
//──────────────────────────────────────────────────────────────────────────────
const MODE = process.env.NODE_ENV || 'production';

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

const dict = arr => Object.assign(...arr.map(([k, v]) => ({ [k]: v })));

//──────────────────────────────────────────────────────────────────────────────
// Enonic XP server-side ECMAScript
//──────────────────────────────────────────────────────────────────────────────
const DIR_SRC = 'src/main/resources';
const DIR_SRC_ASSETS = `${DIR_SRC}/assets`;
const DIR_DST = 'build/resources/main';

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

const GLOB_EXTENSIONS_SERVER = '{ts,js}';
const FILES_SERVER = globSync(
	`${DIR_SRC}/**/*.${GLOB_EXTENSIONS_SERVER}`,
	{
		absolute: false,
		ignore: globSync(`${DIR_SRC_ASSETS}/**/*.${GLOB_EXTENSIONS_SERVER}`).concat(
			globSync(`${DIR_SRC}/**/*.d.ts`)
		)
	}
);
// print(FILES_SERVER, { maxItems: Infinity });
const ENTRY_SERVER = dict(FILES_SERVER.map(k => [
	k.replace(`${DIR_SRC}/`, '').replace(/\.[^.]*$/, ''), // name
	`.${k.replace(`${DIR_SRC}`, '')}` // source relative to context
]));
// print(ENTRY_SERVER, { maxItems: Infinity });

const SERVER_SIDE_ECMASCRIPT_CONFIG = {
	context: path.resolve(__dirname, DIR_SRC),
	devtool: false, // Don't waste time generating sourceMaps
	entry: ENTRY_SERVER,
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
						'@babel/preset-typescript',
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
		path: path.join(__dirname, DIR_DST)
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
			'ts',
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

const DST_ASSETS_DIR = 'build/resources/main/assets';

const CLIENT_SIDE_ES_CONFIG = {
	context: path.join(__dirname, DIR_SRC_ASSETS, 'js', 'react'),
	devtool: false, // Don't waste time generating sourceMaps
	entry: {
		'SampleCollector': './SampleCollector.tsx'
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
			test: /\.tsx?$/,
			loader: 'esbuild-loader',
			options: {
				loader: 'tsx',
				target: ES_BUILD_TARGET
			}
		},{
			exclude: [ // It takes time to transpile, if you know they don't need transpilation to run in Enonic you may list them here:
				/node_modules[\\/]core-js/, // will cause errors if they are transpiled by Babel
				/node_modules[\\/]webpack[\\/]buildin/ // will cause errors if they are transpiled by Babel
			],
			test: /\.jsx?$/,
			loader: 'esbuild-loader',
			options: {
				loader: 'jsx',
				target: ES_BUILD_TARGET
			}
		}]
	}, // module
	optimization: {
		minimize,
		minimizer: MODE === 'development'
			? []
			: [
				new EsbuildPlugin({
					target: ES_BUILD_TARGET
				})
			]
	},
	output: {
		filename: '[name].esm.js',
		library: '[name]',
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
		new EsbuildPlugin()
	],
	resolve: {
		extensions: [
			'tsx',
			'ts',
			'mjs',
			'jsx',
			'esm',
			'es',
			'es6',
			'js',
			'json'
		].map(ext => `.${ext}`)
	},
	stats: STATS
};
WEBPACK_CONFIG.push(CLIENT_SIDE_ES_CONFIG);

//──────────────────────────────────────────────────────────────────────────────
// Common
//──────────────────────────────────────────────────────────────────────────────
if (process.env.LOG_LEVEL_FROM_GRADLE === 'INFO') {
	print({WEBPACK_CONFIG}, { maxItems: Infinity });
}
// process.exit();

export { WEBPACK_CONFIG as default };
