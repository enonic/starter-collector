import type {
	CollectorComponentRef,
	CollectorProps
} from '/lib/explorer/types/index.d';
import type {CollectorConfig} from '../../..'


import * as React from 'react';
import {Form} from 'semantic-ui-react';
import {useCollectorState} from './useCollectorState'


export const CollectorForm = React.forwardRef(
	(
		{
			collectorConfig,
			//explorer,
			setCollectorConfig,
			setCollectorConfigErrorCount
		} :CollectorProps<CollectorConfig>,
		ref :CollectorComponentRef<CollectorConfig>
	) => {
		const {
			url,
			urlError,
			urlOnBlur,
			urlOnChange
		} = useCollectorState({
			collectorConfig,
			ref,
			setCollectorConfig,
			setCollectorConfigErrorCount
		});
		return <Form>
			<Form.Input
				error={urlError}
				fluid
				label='Url'
				onBlur={urlOnBlur}
				onChange={urlOnChange}
				required
				value={url}
			/>
		</Form>;
	} // component
); // forwardRef
