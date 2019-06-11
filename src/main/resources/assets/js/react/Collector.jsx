import {getIn} from 'formik';
import {Input} from '@enonic/semantic-ui-react-formik-functional/dist/index.cjs';
import {Form, Header} from 'semantic-ui-react';


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
