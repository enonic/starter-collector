import type {CollectorConfig} from '../../index.d'


//@ts-ignore
import {request as httpClientRequest} from '/lib/http-client';
//import {toStr} from '@enonic/js-utils';

import {Collector} from '/lib/explorer';


export function run({
	collectionId,
	collectorId,
	configJson,
	language
}) {
	const collector = new Collector<CollectorConfig>({
		collectionId, collectorId, configJson, language
	});
	if (!collector.config.url) {
		throw new Error('Config is missing required parameter url!');
	}
	collector.start();

	const {url} = collector.config;
	try {
		const res = httpClientRequest({
			url
		}); //log.info(toStr({res}));
		if (res.status != 200) {
			throw new Error(`Status: ${res.status}!`);
		}
		//const htmlStr = res.body; //log.info(toStr({htmlStr}));
		const title = res.body.match(/<title>([^<]*?)<\/title>/i)[1]; //log.info(toStr({title}));

		const text = res.body
			.match(/<body>([\s\S]*?)<\/body>/i)[1]
			.replace(/<.*?>/g, ' ')
			.replace(/[\n\r]/g, ' ')
			.replace(/\s{2,}/g, ' ')
			.trim();
		//log.info(toStr({text}));

		const documentToPersist :CollectorConfig & {_id ?:string} = {
			title,
			text,
			url
		};

		const documentsRes = collector.queryDocuments({
			count: 1,
			query: {
				boolean: {
					must: {
						term: {
							field: 'url',
							value: documentToPersist.url
						}
					}
				}
			}
		});

		if (documentsRes.total > 1) {
			throw new Error(`Multiple documents found with url:${documentToPersist.url}! url is supposed to be unique!`);
		} else if (documentsRes.total === 1) {
			// Provide which document node to update (rather than creating a new document node)
			documentToPersist._id = documentsRes.hits[0].id;
		}

		collector.persistDocument(documentToPersist, {
			documentTypeName: 'starter_explorer_collector_document_type'
		});
		collector.addSuccess({
			uri: url
		});
	} catch (e) {
		collector.addError({
			uri: url,
			message: e.message
		});
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
