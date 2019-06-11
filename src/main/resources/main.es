import {register, unregister} from '/lib/explorer/collector';


register({
	appName: app.name,
	configAssetPath: 'js/react/Collector.esm.js',
	displayName: 'Change me in src/main/resources/main.es'
});


__.disposer(() => {
	unregister({
		appName: app.name
	});
});
