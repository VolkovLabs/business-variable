import { EventBus, SelectableValue } from '@grafana/data';
import { Select } from '@grafana/ui';
import React, { useCallback, useMemo } from 'react';

import { ALL_VALUE, ALL_VALUE_PARAMETER, TEST_IDS } from '../../constants';
import { usePersistentStorage } from '../../hooks';
import { CustomVariableModel, QueryVariableModel } from '../../types';
import { updateVariableOptions } from '../../utils';

/**
 * Properties
 */
interface Props {
  /**
   * Variable
   *
   * @type {QueryVariableModel | CustomVariableModel}
   */
  variable: QueryVariableModel | CustomVariableModel;

  /**
   * Empty Value
   *
   * @type {boolean}
   */
  emptyValue: boolean;

  /**
   * Persistent
   *
   * @type {boolean}
   */
  persistent: boolean;

  /**
   * Custom Value
   *
   * @type {boolean}
   */
  customValue: boolean;

  /**
   * Panel Event Bus
   *
   * @type {EventBus}
   */
  panelEventBus: EventBus;

  /**
   * Maximum visible values
   *
   * @type {number | undefined}
   */
  maxVisibleValues: number | undefined;
}

/**
 * Options Variable
 * @param props
 */
export const OptionsVariable: React.FC<Props> = ({
  variable,
  emptyValue,
  persistent,
  customValue,
  panelEventBus,
  maxVisibleValues,
}) => {
  /**
   * Persistent storage
   */
  const persistentStorage = usePersistentStorage(variable.name);

  /**
   * Has variable "All" option
   */
  const hasVariableAllOption = useMemo(
    () => variable.options.some((option) => option.value === ALL_VALUE_PARAMETER),
    [variable.options]
  );

  /**
   * Current values
   */
  const values = useMemo(() => {
    const value = variable.current.value;
    if (customValue) {
      return Array.isArray(value) ? value : [value];
    }

    /**
     * Set All as selected if "All" option not specified in options
     */
    if (variable.includeAll && !hasVariableAllOption) {
      const isAllSelected = Array.isArray(value) ? value.includes(ALL_VALUE_PARAMETER) : value === ALL_VALUE_PARAMETER;

      if (isAllSelected) {
        return [ALL_VALUE_PARAMETER];
      }
    }

    return variable.options.filter((option) => option.selected).map((option) => option.value);
  }, [customValue, hasVariableAllOption, variable]);

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
        panelEventBus,
      });
    },
    [emptyValue, panelEventBus, persistent, persistentStorage, values, variable]
  );

  /**
   * Options
   */
  const options = useMemo(() => {
    const options = variable.options.map((option) => {
      return {
        label: option.text,
        value: option.value,
      };
    });

    /**
     * Add options for custom entered values
     */
    if (customValue) {
      values.forEach((value) => {
        /**
         * Skip for already exist option
         */
        if (options.some((option) => option.value === value)) {
          return;
        }

        options.push({
          label: value,
          value,
        });
      });
    }

    /**
     * Add All option if it should be
     */
    if (variable.includeAll && !hasVariableAllOption) {
      options.unshift({
        label: ALL_VALUE,
        value: ALL_VALUE_PARAMETER,
      });
    }
    return options;
  }, [customValue, hasVariableAllOption, values, variable.includeAll, variable.options]);

  return (
    <Select
      aria-label={TEST_IDS.optionsVariable.root}
      onChange={onChange}
      options={options}
      isMulti={variable.multi}
      value={variable.multi ? values : values[0] || null}
      allowCustomValue={customValue}
      maxVisibleValues={maxVisibleValues}
      hideSelectedOptions={false}
      closeMenuOnSelect={!variable.multi}
      showAllSelectedWhenOpen={false}
    />
  );
};
