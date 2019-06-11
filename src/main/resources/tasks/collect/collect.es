import {
	COLLECTION_REPO_PREFIX,
	REPO_JOURNALS,
	PRINCIPAL_EXPLORER_WRITE
} from '/lib/explorer/model/2/constants';
import {create} from '/lib/explorer/node/create';
import {connect} from '/lib/explorer/repo/connect';
import {maybeCreate as maybeCreateRepoAndBranch} from '/lib/explorer/repo/maybeCreate';
import {currentTimeMillis} from '/lib/explorer/time/currentTimeMillis';
import {journal as journalType} from '/lib/explorer/nodeTypes/journal';
import {get as getTask} from '/lib/explorer/task/get';
import {modify as modifyTask} from '/lib/explorer/task/modify';
import {progress} from '/lib/explorer/task/progress';


export function run({name, configJson}) {
	// TODO
} // function run
