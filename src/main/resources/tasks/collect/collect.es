import {request as httpClientRequest} from '/lib/http-client';
//import {toStr} from '/lib/util';

import {Collector} from '/lib/explorer/collector';


export function run({name, configJson}) {
	const collector = new Collector({name, configJson})
	if (!collector.config.uri) { throw new Error('Config is missing required parameter uri!'); }
	collector.start();

	const {uri} = collector.config;
	try {
		const res = httpClientRequest({
			url: uri
		}); //log.info(toStr({res}));
		if (res.status != 200) {
			throw new Error(`Status: ${res.status}!`);
		}
		const htmlStr = res.body; //log.info(toStr({htmlStr}));
		const title = res.body.match(/<title>([^<]*?)<\/title>/i)[1]; //log.info(toStr({title}));

		const text = res.body
			.match(/<body>([\s\S]*?)<\/body>/i)[1]
			.replace(/<.*?>/g, ' ')
			.replace(/[\n\r]/g, ' ')
			.replace(/\s{2,}/g, ' ')
			.trim();
		//log.info(toStr({text}));

		collector.persistDocument({
			title,
			text,
			uri
		});
	} catch (e) {
		collector.journal.addError({uri, message: e.message});
	}

	//──────────────────────────────────────────────────────────────────────────
	// 6. Delete old nodes
	//──────────────────────────────────────────────────────────────────────────
	/*deleteOldNodes({
		collectionWriteConnection: collectionConnection,
		journal,
		seenUrisObj
	});*/

	collector.stop();
} // function run
