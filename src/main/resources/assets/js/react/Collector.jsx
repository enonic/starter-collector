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
		dirty,
		/*explorer: {
			contentTypeOptions,
			fields,
			siteOptions
		},*/
		isValid, // Added by withFormik
		onChange, // Passed as a prop
		values // Added by withFormik
	} = props;
	//console.debug('CollectorForm props', props);
	//console.debug('CollectorForm values', values);

	// Call onChange every time values changes
	React.useEffect(() => {
		if (onChange) {
			onChange({
				dirty,
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
