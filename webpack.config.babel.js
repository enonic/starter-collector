/* eslint-disable no-console */
import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import {webpackEsmAssets} from '@enonic/webpack-esm-assets';
import {webpackServerSideJs} from '@enonic/webpack-server-side-js';

const MODE = 'development';
//const MODE = 'production';

const WEBPACK_CONFIG = [
	webpackServerSideJs({
		__dirname,
		externals: [
			/^\/lib\/http-client.*$/,

			'/lib/util',
			/^\/lib\/util\//,

			/^\/lib\/xp\//,
			//^\/lib\/xp\/admin.*$/,
			//^\/lib\/xp\/auth.*$/,
			//^\/lib\/xp\/common.*$/,
			//^\/lib\/xp\/context.*$/,
			//^\/lib\/xp\/node.*$/,
			//^\/lib\/xp\/task.*$/,
			//^\/lib\/xp\/repo.*$/,
			//^\/lib\/xp\/value.*$/
		],
		serverSideFiles: [
			'src/main/resources/main',
			'src/main/resources/tasks/collect/collect'
		],
		mode: MODE,
		optimization: {
			minimizer: [
				new TerserPlugin({
					terserOptions: {
						compress: {},
						mangle: true // Note `mangle.properties` is `false` by default.
					}
				})
			]
		},
		resolveAlias: {
			//'/lib/util': path.resolve(__dirname, '../lib-util/src/main/resources/lib/util'),
			'/lib/explorer/collector': path.resolve(__dirname, '../lib-explorer-collector/src/main/resources/lib/explorer/collector/'),
			'/lib/explorer': path.resolve(__dirname, '../lib-explorer/src/main/resources/lib/explorer/')
		}
	}),
	webpackEsmAssets({
		__dirname,
		assetFiles: [
			'src/main/resources/assets/js/react/Collector.jsx'
		],
		mode: MODE
	})
];

//console.log(`WEBPACK_CONFIG:${JSON.stringify(WEBPACK_CONFIG, null, 4)}`);
//process.exit();

export { WEBPACK_CONFIG as default };
