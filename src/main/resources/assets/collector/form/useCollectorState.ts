import type {
	CollectorComponentRef,
	CollectorComponentAfterResetFunction,
	CollectorComponentValidateFunction
} from '/lib/explorer/types/index.d';
import type {CollectorConfig} from '../../../index.d';


import * as React from 'react';
import {useUpdateEffect} from './useUpdateEffect'


export function useCollectorState({
  collectorConfig,
	ref,
  setCollectorConfig,
	setCollectorConfigErrorCount
} :{
  collectorConfig :CollectorConfig
	ref :CollectorComponentRef<CollectorConfig>
  setCollectorConfig :(param :CollectorConfig|((prevCollectorConfig :CollectorConfig) => CollectorConfig)) => void
	setCollectorConfigErrorCount :(collectorConfigErrorCount :number) => void
}) {
  //──────────────────────────────────────────────────────────────────────────
  // Avoiding derived state by not using useState, just pointing to where in collectorConfig it can be found:
  //──────────────────────────────────────────────────────────────────────────
  const url = collectorConfig	? (collectorConfig.url || '')	: '';

  //──────────────────────────────────────────────────────────────────────────
  // State internal to the (child) Collector component:
  //──────────────────────────────────────────────────────────────────────────
  const [urlError, setUrlError] = React.useState<string>(undefined);
  const [/*urlVisited*/, setUrlVisited] = React.useState(false);

  //──────────────────────────────────────────────────────────────────────────
  // Callbacks, should only depend on props, not state
  //──────────────────────────────────────────────────────────────────────────
  const validateUrl = (urlToValidate :string) => {
    const newError = !urlToValidate ? 'Url is required!' : undefined;
    setUrlError(newError);
    return !newError;
  };

  const urlOnChange = React.useCallback((
    _event :React.ChangeEvent<HTMLInputElement>,
    {value} : {value :string}
  ) => {
    setCollectorConfig(prevCollectorConfig => ({
      ...prevCollectorConfig,
      url: value
    }));
    validateUrl(value);
  }, [
    setCollectorConfig,
    validateUrl
  ]);

  const urlOnBlur = React.useCallback(() => {
    setUrlVisited(true);
    validateUrl(url);
  }, [
    collectorConfig,
    validateUrl,
    url
  ]);

  //──────────────────────────────────────────────────────────────────────────
  // Updates (changes, not init)
  //──────────────────────────────────────────────────────────────────────────
  useUpdateEffect(() => {
    setCollectorConfigErrorCount(urlError ? 1 : 0);
  }, [
    urlError
  ]);

  //──────────────────────────────────────────────────────────────────────────
  // Callback to be called by the (parent) Collection component
  //──────────────────────────────────────────────────────────────────────────
  const afterReset :CollectorComponentAfterResetFunction = () => {
    setUrlVisited(false);
    setUrlError(undefined);
  };

  const validate = React.useCallback<CollectorComponentValidateFunction<CollectorConfig>>(({
    url: urlToValidate
  } :CollectorConfig) => {
    const newCollectorConfigErrorCount = validateUrl(urlToValidate) ? 0 : 1;
    return !newCollectorConfigErrorCount;
  }, [
    validateUrl
  ]);

  //──────────────────────────────────────────────────────────────────────────
  // Make it possible for parent to call these functions
  //──────────────────────────────────────────────────────────────────────────
  React.useImperativeHandle(ref, () => ({
    afterReset,
    validate
  }));

  return {
    url,
    urlError,
    urlOnBlur,
    urlOnChange
  };
}
