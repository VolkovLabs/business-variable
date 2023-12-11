import { EventBus } from '@grafana/data';
import { locationService } from '@grafana/runtime';
import { useEffect } from 'react';

import { ALL_VALUE, ALL_VALUE_PARAMETER } from '../constants';
import { isVariableWithOptions, setVariableValue } from '../utils';
import { useRuntimeVariables } from './useRuntimeVariables';

/**
 * Unique values array
 * @param array
 */
const uniqueValues = <T>(array: T[]): T[] => {
  const set = new Set<T>();

  array.forEach((item) => {
    set.add(item);
  });

  return Array.from(set.values());
};

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
       * Query values for variable
       */
      const valuesInQuery = locationService
        .getSearch()
        .getAll(`var-${variable.name}`)
        .filter((s) => s.toLowerCase().indexOf('all') !== 0);

      /**
       * Selected variable values
       */
      const valuesInState = (
        Array.isArray(variable.current.value) ? variable.current.value : [variable.current.value]
      ).filter((value) => value !== ALL_VALUE_PARAMETER);

      /**
       * Unavailable Query Values
       */
      const unavailableQueryValues = valuesInQuery.filter(
        (value) => !variable.options.some((option) => option.value === value)
      );

      /**
       * Values key
       */
      const key = `var-${variable.name}`;

      /**
       * Save unavailable values and remove from url
       */
      if (unavailableQueryValues.length) {
        const json = sessionStorage.getItem(key);
        const savedUnavailableValues = json ? (JSON.parse(json) as string[]) : [];

        /**
         * Save unavailable values
         */
        sessionStorage.setItem(
          key,
          JSON.stringify(uniqueValues(savedUnavailableValues.concat(unavailableQueryValues)))
        );

        /**
         * Update variable values to remove unavailable from url
         */
        setVariableValue(variable.name, valuesInState.length ? valuesInState : [ALL_VALUE]);
      }

      const json = sessionStorage.getItem(key);
      const savedValues = json ? (JSON.parse(json) as string[]) : [];

      /**
       * Find values which are available to select
       */
      const valuesNotInState = savedValues.filter((value) => variable.options.some((option) => option.value === value));

      /**
       * Select values which were selected before and made available again
       */
      if (valuesNotInState.length) {
        /**
         * Save unavailable values
         */
        sessionStorage.setItem(key, JSON.stringify(savedValues.filter((value) => !valuesNotInState.includes(value))));

        /**
         * Update variable values with available values which were selected before
         */
        setVariableValue(variable.name, valuesInState.concat(valuesNotInState));
      }
    }
  }, [enabled, variable]);
};
