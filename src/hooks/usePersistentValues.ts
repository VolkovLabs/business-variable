import { EventBus } from '@grafana/data';
import { locationService } from '@grafana/runtime';
import { useEffect } from 'react';

import { ALL_VALUE_PARAMETER } from '../constants';
import { isVariableWithOptions, setVariableValue } from '../utils';
import { useRuntimeVariables } from './useRuntimeVariables';

/**
 * Use Persistent Values
 */
export const usePersistentValues = ({
  eventBus,
  variableName,
  enabled,
}: {
  eventBus: EventBus;
  variableName: string;
  enabled: boolean;
}) => {
  /**
   * Variable
   */
  const { variable } = useRuntimeVariables(eventBus, variableName);

  /**
   * Restore selected values before if available
   */
  useEffect(() => {
    if (enabled && variable && isVariableWithOptions(variable) && variable.multi) {
      /**
       * All Selected values for variable
       */
      const selectedValues = locationService
        .getSearch()
        .getAll(`var-${variable.name}`)
        .filter((s) => s.toLowerCase().indexOf('all') !== 0);

      const variableValues = Array.isArray(variable.current.value) ? variable.current.value : [variable.current.value];

      /**
       * Find values which are available to select
       */
      const valuesNotInState = selectedValues.filter(
        (value) => !variableValues.includes(value) && variable.options.some((option) => option.value === value)
      );

      if (valuesNotInState.length) {
        console.log('state values', variable.name, variableValues);
        console.log(
          'restoreValues',
          variableValues.filter((value) => value !== ALL_VALUE_PARAMETER).concat(valuesNotInState)
        );
        setVariableValue(
          variable.name,
          variableValues.filter((value) => value !== ALL_VALUE_PARAMETER).concat(valuesNotInState)
        );
      }
    }
  }, [enabled, variable]);
};
