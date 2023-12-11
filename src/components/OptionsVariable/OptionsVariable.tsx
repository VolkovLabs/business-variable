import { SelectableValue } from '@grafana/data';
import { Select } from '@grafana/ui';
import React, { useCallback, useMemo } from 'react';

import { TEST_IDS } from '../../constants';
import { usePersistentStorage } from '../../hooks';
import { CustomVariableModel, QueryVariableModel } from '../../types';
import { updateVariableOptions } from '../../utils';

/**
 * Properties
 */
interface Props {
  /**
   * Variable
   */
  variable: QueryVariableModel | CustomVariableModel;

  /**
   * Empty Value
   */
  emptyValue: boolean;

  /**
   * Persistent
   */
  persistent: boolean;
}

/**
 * Options Variable
 * @param props
 */
export const OptionsVariable: React.FC<Props> = ({ variable, emptyValue, persistent }) => {
  /**
   * Persistent storage
   */
  const persistentStorage = usePersistentStorage(variable.name);

  /**
   * Current values
   */
  const values = useMemo(() => {
    return variable.options.filter((option) => option.selected).map((option) => option.value);
  }, [variable]);

  /**
   * On Change
   */
  const onChange = useCallback(
    (value: Array<SelectableValue<string>> | SelectableValue<string>) => {
      /**
       * Clear saved values on override by user
       */
      if (persistent) {
        persistentStorage.remove();
      }

      updateVariableOptions({
        previousValues: values,
        value: Array.isArray(value) ? value.map((option: SelectableValue) => option.value) : value.value || '',
        variable,
        emptyValueEnabled: emptyValue,
      });
    },
    [emptyValue, persistent, persistentStorage, values, variable]
  );

  /**
   * Options
   */
  const options = useMemo(() => {
    return variable.options.map((option) => {
      return {
        label: option.text,
        value: option.value,
        ariaLabel: TEST_IDS.optionsVariable.option(option.value),
      };
    });
  }, [variable.options]);

  return (
    <Select
      aria-label={TEST_IDS.optionsVariable.root}
      onChange={onChange}
      options={options}
      isMulti={variable.multi}
      value={variable.multi ? values : values[0] || null}
    />
  );
};
