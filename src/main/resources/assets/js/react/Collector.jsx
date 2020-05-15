import getIn from 'get-value';
import setIn from 'set-value';
import {Form} from 'semantic-ui-react';
import {
	setError,
	setSchema,
	setValue,
	setVisited,
	Form as EnonicForm,
	Input
} from 'semantic-ui-react-form';


function required(value) {
	return value ? undefined : 'Required!';
}


const SCHEMA = {
	uri: (v) => required(v)
};


export const Collector = (props) => {
	//console.debug('Collector props', props);
	const {
		context,
		dispatch,
		explorer,
		isFirstRun,
		path
	} = props;
	//console.debug('Collector context', context);

	let initialValues = getIn(context.values, path);
	//console.debug('Collector initialValues', initialValues);

	if (isFirstRun.current) {
		//console.debug('isFirstRun');
		isFirstRun.current = false;
		dispatch(setSchema({path, schema: SCHEMA}));
		// There are no changes, errors or visits yet!
		if (!initialValues) {
			initialValues = {
				uri: ''
			};
			dispatch(setValue({path, value: initialValues}));
		}
	}


	return <EnonicForm
		afterValidate={(dereffed) => {
			// console.debug('Collector afterValidate dereffed', dereffed);
			dispatch(setError({path, error: dereffed.errors}));
			dispatch(setVisited({path, value: dereffed.visited}));
		}}
		afterVisit={(dereffed) => {
			// console.debug('Collector afterVisit dereffed', dereffed);
			dispatch(setVisited({path, value: dereffed.visited}));
		}}
		initialValues={initialValues}
		onChange={(values) => {
			//console.debug('Collector onChange values', values);
			dispatch(setValue({path, value: values}));
		}}
		schema={SCHEMA}
	>
		<Form as='div'>
			<Form.Field>
				<Input
					fluid
					label='Uri'
					path='uri'
				/>
			</Form.Field>
		</Form>
	</EnonicForm>;
} // Collector
