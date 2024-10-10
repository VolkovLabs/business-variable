import { EventBus, TypedVariableModel } from '@grafana/data';
import { locationService } from '@grafana/runtime';
import { ChangeEvent, MouseEvent, PointerEvent } from 'react';

import { ALL_VALUE, ALL_VALUE_PARAMETER, NO_VALUE_PARAMETER } from '../constants';
import {
  CustomVariableModel,
  QueryVariableModel,
  RuntimeVariable,
  RuntimeVariableWithOptions,
  VariableChangedEvent,
  VariableType,
} from '../types';
import { isMac } from './browser';

/**
 * Set Variable Value
 * @param name
 * @param value
 * @param eventBus
 */
export const setVariableValue = (name: string, value: unknown, eventBus: EventBus) => {
  /**
   * Update value in url
   */
  locationService.partial(
    {
      [`var-${name}`]: value,
    },
    true
  );

  /**
   * Emit variable changed event for reset
   */
  eventBus.publish(new VariableChangedEvent());
};

/**
 * Select Variable Values
 */
export const selectVariableValues = ({
  values,
  runtimeVariable,
  panelEventBus,
  isKeepSelection = false,
}: {
  values: string[];
  runtimeVariable?: RuntimeVariable;
  panelEventBus: EventBus;
  isKeepSelection?: boolean;
}) => {
  if (!runtimeVariable) {
    return;
  }

  switch (runtimeVariable.type) {
    case VariableType.CUSTOM:
    case VariableType.QUERY: {
      const { name, multi, includeAll, options } = runtimeVariable;

      /**
       * Multi update
       */
      if (multi) {
        /**
         * Check if all option already selected
         */
        if (includeAll) {
          const selectedValue = runtimeVariable.current.value;

          const isAllSelected = Array.isArray(selectedValue)
            ? selectedValue.some((value) => value === ALL_VALUE_PARAMETER)
            : selectedValue === ALL_VALUE_PARAMETER;

          /**
           * Deselect values while all option was active and should keep selection
           */
          if (isAllSelected && isKeepSelection) {
            /**
             * Create values map to exclude
             */
            const excludeValuesMap = new Map<string, boolean>();

            values.forEach((value) => {
              excludeValuesMap.set(value, true);
            });

            /**
             * Filter all and excluded values
             */
            const valuesToSelect = [];

            for (const option of options) {
              /**
               * Skip all value
               */
              if (option.value === ALL_VALUE_PARAMETER) {
                continue;
              }
              /**
               * Value should be deselected, so skip
               */
              if (excludeValuesMap.has(option.value)) {
                continue;
              }

              valuesToSelect.push(option.value);
            }

            setVariableValue(name, valuesToSelect, panelEventBus);

            return;
          }
        }

        /**
         * All value selected
         */
        if (values.some((value) => value === ALL_VALUE_PARAMETER)) {
          setVariableValue(name, ALL_VALUE, panelEventBus);
          return;
        }

        /**
         * No value selected
         */
        if (values.some((value) => value === NO_VALUE_PARAMETER)) {
          setVariableValue(name, '', panelEventBus);
          return;
        }

        /**
         * All Selected values for variable
         */
        const selectedValues = locationService
          .getSearch()
          .getAll(`var-${name}`)
          .filter((s) => {
            if (s === ALL_VALUE_PARAMETER) {
              return false;
            }
            return s.toLowerCase().indexOf('all') !== 0;
          });

        /**
         * Values selected, but not defined in the URL
         */
        if (selectedValues.length === 0 && !locationService.getSearchObject()[`var-${name}`]) {
          const selectedValue = runtimeVariable.current.value;
          const selectedArray = Array.isArray(selectedValue) ? selectedValue : [selectedValue];

          selectedValues.push(...selectedArray.filter((value) => value !== ALL_VALUE_PARAMETER));
        }

        /**
         * Get Already Selected Values
         */
        const alreadySelectedValues = values.filter((value) => selectedValues.includes(value));

        /**
         * Deselect values
         */
        if (alreadySelectedValues.length === values.length) {
          setVariableValue(
            name,
            selectedValues.filter((value) => !alreadySelectedValues.includes(value)),
            panelEventBus
          );
          return;
        }

        const uniqueValues = [...new Set(values.concat(selectedValues)).values()];

        setVariableValue(name, uniqueValues, panelEventBus);
        return;
      }

      /**
       * Single Value
       */
      let value = values[0];

      if (value === ALL_VALUE_PARAMETER) {
        value = ALL_VALUE;
      } else if (value === NO_VALUE_PARAMETER) {
        value = '';
      }

      setVariableValue(name, value, panelEventBus);
      return;
    }
    case VariableType.TEXTBOX: {
      const value = values[0];
      setVariableValue(runtimeVariable.name, value, panelEventBus);
      return;
    }
    case VariableType.CONSTANT: {
      const value = values[0];
      setVariableValue(runtimeVariable.name, value, panelEventBus);
      return;
    }
    default: {
      /**
       * Unsupported variable type
       */
      return;
    }
  }
};

/**
 * Variable with Options
 */
export const isVariableWithOptions = (
  variable?: RuntimeVariable
): variable is CustomVariableModel | QueryVariableModel => {
  if (!variable) {
    return false;
  }

  return variable.type === VariableType.CUSTOM || variable.type === VariableType.QUERY;
};

/**
 * Get Runtime Variable
 * @param variable
 */
export const getRuntimeVariable = (variable: TypedVariableModel): RuntimeVariable | undefined => {
  if (variable.type === VariableType.TEXTBOX || variable.type === VariableType.CONSTANT) {
    return variable;
  }
  if (variable.type === VariableType.CUSTOM || variable.type === VariableType.QUERY) {
    let options = variable.options;
    const hasVariableAllOption = variable.options.some((option) => option.value === ALL_VALUE_PARAMETER);
    if (variable.includeAll && !hasVariableAllOption) {
      options = [
        {
          text: ALL_VALUE,
          value: ALL_VALUE_PARAMETER,
          selected: Array.isArray(variable?.current.value)
            ? variable?.current.value.includes(ALL_VALUE_PARAMETER)
            : variable?.current.value === ALL_VALUE_PARAMETER,
        },
        ...variable.options,
      ];
    }

    const runtimeVariable = {
      ...variable,
      options: options,
      type: VariableType.CUSTOM,
      optionIndexByName: options.reduce((acc, option, index) => {
        acc.set(option.value as string, index);
        return acc;
      }, new Map()),
      helpers: {
        getOption: (value: string) => runtimeVariable.options[runtimeVariable.optionIndexByName.get(value) as number],
      },
    } as RuntimeVariableWithOptions;

    return runtimeVariable;
  }
  return;
};

/**
 * Get Variables Map
 */
export const getVariablesMap = (variables: TypedVariableModel[]): Record<string, RuntimeVariable> => {
  return variables.reduce((acc, variable) => {
    const runtimeVariable = getRuntimeVariable(variable);
    if (runtimeVariable) {
      return {
        ...acc,
        [runtimeVariable.name]: runtimeVariable,
      };
    }
    return acc;
  }, {});
};

/**
 * Is Variable All Selected
 */
export const isVariableAllSelected = (runtimeVariable: RuntimeVariable): boolean => {
  if (isVariableWithOptions(runtimeVariable)) {
    if (Array.isArray(runtimeVariable.current.value)) {
      /**
       * Multi value
       */
      if (runtimeVariable.includeAll) {
        /**
         * Options with all option
         */
        if (!!runtimeVariable.helpers.getOption(ALL_VALUE_PARAMETER)?.selected) {
          /**
           * All option selected
           */
          return true;
        }

        /**
         * Comparing value with removed selected all option
         */
        return runtimeVariable.current.value.length === runtimeVariable.options.length - 1;
      }

      /**
       * Multi value without all option
       */
      return runtimeVariable.current.value.length === runtimeVariable.options.length;
    } else {
      /**
       * Single value
       */
      return runtimeVariable.current.value === ALL_VALUE_PARAMETER;
    }
  }

  return false;
};

/**
 * Should keep selection
 */
export const shouldKeepSelection = (event: ChangeEvent | MouseEvent): boolean => {
  const nativeEvent = event.nativeEvent as Pick<PointerEvent, 'ctrlKey' | 'metaKey'>;

  return isMac() ? nativeEvent.metaKey : nativeEvent.ctrlKey;
};
