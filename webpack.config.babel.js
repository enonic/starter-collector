/* eslint-disable no-console */
import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import {webpackEsmAssets} from '@enonic/webpack-esm-assets';
import {webpackServerSideJs} from '@enonic/webpack-server-side-js';

//const MODE = 'development';
const MODE = 'production';

const SS_EXTERNALS = [
	/^\/lib\/http-client.*$/,

	'/lib/util',
	/^\/lib\/util\//,

	/^\/lib\/xp\//
];

const SS_ALIAS = {};

if (MODE === 'production') {
	SS_EXTERNALS.push(/^\/lib\/explorer\//);
} else {
	SS_ALIAS['/lib/explorer'] = path.resolve(__dirname, '../lib-explorer/src/main/resources/lib/explorer/');
}

const WEBPACK_CONFIG = [
	webpackServerSideJs({
		__dirname,
		externals: SS_EXTERNALS,
		serverSideFiles: [
			'src/main/resources/main',
			'src/main/resources/tasks/collect/collect'
		],
		mode: MODE,
		optimization: {
			minimizer: [
				new TerserPlugin(/*{
					terserOptions: {
						compress: {}
						//mangle: true // This will DESTROY exports!
					}
				}*/)
			]
		},
		resolveAlias: SS_ALIAS
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
