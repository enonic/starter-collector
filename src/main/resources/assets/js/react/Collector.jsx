import {
	getIn,
	withFormik
} from 'formik';
import {Input} from '@enonic/semantic-ui-react-formik-functional/dist/index.cjs';
import {Form} from 'semantic-ui-react';
//import {useEffect} from 'react'; // Can lead to version mismatch
import * as Yup from 'yup';


const CollectorForm = (props) => {
	const {
		isValid, // Added by withFormik
		onChange, // Passed as a prop
		values // Added by withFormik
	} = props;
	//console.debug('CollectorForm props', props);
	//console.debug('CollectorForm values', values);
	//const {contentTypeOptions, fields, siteOptions} = explorer;


	// Call onChange every time values changes
	React.useEffect(() => {
		if (onChange) {
			onChange({
				isValid,
				values
			});
		}
	}, [values]);

	return <Form
		autoComplete='off'
		style={{
			width: '100%'
		}}
	>
		<Form.Field>
			<Input
				formik={props}
				label='Uri'
				name='uri'
				value={getIn(values, 'uri', '')}
			/>
		</Form.Field>
	</Form>
} // CollectorForm


const COLLECTOR_SCHEMA = Yup.object().shape({
	uri: Yup.string()
		.max(255, 'Too Long!')
		.required('Required')
});


const CollectorFormik = withFormik({
	mapPropsToValues: (props) => props.values,
	validationSchema: COLLECTOR_SCHEMA
})(CollectorForm);


export const Collector = (props) => {
	//console.debug('Collector props', props);
	const {explorer, onChange, values} = props;

	return <CollectorFormik
			explorer={explorer}
			onChange={onChange}
			values={values}
		/>;
} // Collector

/*
export const Collector = ({
	fields,
	formik,
	name = 'collector',
	parentPath,
	path = parentPath ? `${parentPath}.${name}` : name,
	value = getIn(formik.values, path, {}),
}) => {
	const configPath = `${path}.config`;
	return <>
	<Header as='h3' content='Change me in src/main/resources/assets/js/react/Collector.jsx' dividing/>
		<Form.Field>
			<Input
				formik={formik}
				label='Uri'
				name='uri'
				parentPath={configPath}
				value={getIn(formik.values, `${configPath}.uri`, '')}
			/>
			</Form.Field>
	</>;
} // Collector
*/
