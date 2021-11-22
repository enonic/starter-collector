import {
	//register,
	unregister
} from '/lib/explorer/collector';


unregister({
	appName: app.name,
	//componentPath: 'window.LibCollector.Collector',
	//configAssetPath: 'js/react/Collector.esm.js',
	collectTaskName: 'collect'//,
	//displayName: 'Starter (Change me in src/main/resources/main.es)'
});


/*__.disposer(() => {
	unregister({
		appName: app.name,
		collectTaskName: 'collect'
	});
});*/
