import {register, unregister} from '/lib/explorer/collector';


register({
	appName: app.name,
	configAssetPath: 'js/react/Collector.esm.js',
	componentPath: 'window.LibCollector.Collector',
	displayName: 'Starter (Change me in src/main/resources/main.es)'
});


__.disposer(() => {
	unregister({
		appName: app.name
	});
});
