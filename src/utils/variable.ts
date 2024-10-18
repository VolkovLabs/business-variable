import {
  AdHocVariableModel,
  ConstantVariableModel,
  CustomVariableModel as CoreCustomVariableModel,
  DataSourceVariableModel,
  EventBus,
  IntervalVariableModel,
  LoadingState,
  QueryVariableModel as QueryCoreVariableModel,
  TextBoxVariableModel,
  TypedVariableModel,
  VariableOption,
} from '@grafana/data';
import { locationService } from '@grafana/runtime';
import {
  AdHocFiltersVariable,
  ConstantVariable,
  CustomVariable,
  DataSourceVariable,
  IntervalVariable,
  MultiValueVariable,
  QueryVariable,
  sceneUtils,
  SceneVariables,
  TextBoxVariable,
  VariableValue,
} from '@grafana/scenes';
import { VariableHide, VariableRefresh } from '@grafana/schema';
import { ChangeEvent, MouseEvent, PointerEvent } from 'react';

import { ALL_VALUE, ALL_VALUE_PARAMETER, NO_VALUE_PARAMETER } from '../constants';
import {
  ConvertCommonProperties,
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
  if (variable.type === VariableType.TEXTBOX) {
    return variable;
  }
  if (variable.type === VariableType.CUSTOM || variable.type === VariableType.QUERY) {
    let options = variable.options;
    const hasVariableAllOption = options.length && options[0].value === ALL_VALUE_PARAMETER;
    if (options.length && variable.includeAll && !hasVariableAllOption) {
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

/**
 * Scene Variables transform to TypedModel Variable flow
 * Transform new interval scene model to old interval core model
 */
export const getIntervalsQueryFromNewIntervalModel = (intervals: string[]): string => {
  const variableQuery = Array.isArray(intervals) ? intervals.join(',') : '';
  return variableQuery;
};

/**
 * Scene Variables transform to TypedModel Variable flow
 * Transform new interval scene model to old interval core model
 */
export const sceneStateToVariableOptions = (varState: MultiValueVariable['state']): VariableOption[] => {
  return varState.options.map((option) => ({
    value: String(option.value),
    text: option.label,
    selected: Array.isArray(varState.value) ? varState.value.includes(option.value) : varState.value === option.value,
  }));
};

/**
 * Convert property from value, text
 */
export const convertCurrentProperty = (option: VariableValue) => {
  let value: string | string[];
  if (Array.isArray(option)) {
    value = option.map((item) => String(item));
  } else {
    value = String(option);
  }
  return value;
};

/**
 * Convert to Query Variable
 */
export const convertToQueryVariable = (
  commonProperties: ConvertCommonProperties,
  variable: QueryVariable,
  keepQueryOptions?: boolean
): QueryCoreVariableModel => {
  let options: VariableOption[] = [];
  if (variable.state.refresh === VariableRefresh.never || keepQueryOptions) {
    options = sceneStateToVariableOptions(variable.state);
  }
  const currentValue = {
    value: variable.state.value,
    text: variable.state.text,
  } as VariableOption | Record<string, never>;
  return {
    ...commonProperties,
    current: currentValue,
    type: VariableType.QUERY,
    options: options,
    query: variable.state.query,
    definition: variable.state.definition || '',
    datasource: variable.state.datasource,
    sort: variable.state.sort,
    refresh: variable.state.refresh,
    regex: variable.state.regex,
    allValue: variable.state.allValue,
    includeAll: variable.state?.includeAll ? variable.state?.includeAll : false,
    multi: variable.state?.isMulti ? variable.state?.isMulti : false,
    skipUrlSync: variable.state.skipUrlSync ? variable.state.skipUrlSync : false,
  };
};

/**
 * Convert to Custom Variable
 */
export const convertToCustomVariable = (
  commonProperties: ConvertCommonProperties,
  variable: CustomVariable
): CoreCustomVariableModel => {
  const currentValue = {
    value: variable.state.value,
    text: variable.state.text,
  } as VariableOption | Record<string, never>;

  return {
    ...commonProperties,
    current: currentValue,
    options: sceneStateToVariableOptions(variable.state),
    query: variable.state.query,
    type: VariableType.CUSTOM,
    multi: variable.state?.isMulti ? variable.state?.isMulti : false,
    allValue: variable.state.allValue,
    includeAll: variable.state?.includeAll ? variable.state?.includeAll : false,
  };
};

/**
 * Convert to Text box
 */
export const convertToTextBoxVariable = (
  commonProperties: ConvertCommonProperties,
  variable: TextBoxVariable
): TextBoxVariableModel => {
  const currentValue = {
    value: variable.state.value,
    text: variable.state.value,
  } as VariableOption | Record<string, never>;

  return {
    ...commonProperties,
    current: currentValue,
    type: VariableType.TEXTBOX,
    options: [
      {
        value: variable.state.value,
        text: variable.state.value,
        selected: true,
      },
    ],
    originalQuery: variable.state.value,
    query: variable.state.value,
  };
};

/**
 * Convert to Data Source Variable
 */
export const convertToDataSourceVariable = (
  commonProperties: ConvertCommonProperties,
  variable: DataSourceVariable
): DataSourceVariableModel => {
  const currentValue = {
    value: variable.state.value,
    text: variable.state.text,
  } as VariableOption | Record<string, never>;

  return {
    ...commonProperties,
    current: currentValue,
    options: [],
    type: VariableType.DATASOURCE,
    regex: variable.state.regex,
    refresh: VariableRefresh.onDashboardLoad,
    query: variable.state.pluginId,
    multi: variable.state?.isMulti ? variable.state?.isMulti : false,
    allValue: variable.state.allValue,
    includeAll: variable.state?.includeAll ? variable.state?.includeAll : false,
  };
};

/**
 * Convert to Constant Variable
 */
export const convertToConstantVariable = (
  commonProperties: ConvertCommonProperties,
  variable: ConstantVariable
): ConstantVariableModel => {
  const currentValue = {
    value: variable.state.value,
    text: variable.state.value,
  } as VariableOption | Record<string, never>;

  return {
    ...commonProperties,
    current: currentValue,
    type: VariableType.CONSTANT,
    options: [
      {
        value: String(variable.state.value),
        text: String(variable.state.value),
        selected: true,
      },
    ],
    query: String(variable.state.value),
    hide: VariableHide.hideVariable,
  };
};

/**
 * Convert to Interval Variable
 */
export const convertToIntervalVariable = (
  commonProperties: ConvertCommonProperties,
  variable: IntervalVariable
): IntervalVariableModel => {
  const currentValue = {
    value: variable.state.value,
    text: variable.state.value,
  } as VariableOption | Record<string, never>;

  const intervals = getIntervalsQueryFromNewIntervalModel(variable.state.intervals);

  return {
    ...commonProperties,
    current: currentValue,
    query: intervals,
    refresh: variable.state.refresh,
    options: variable.state.intervals.map((interval) => ({
      value: interval,
      text: interval,
      selected: interval === variable.state.value,
    })),
    type: VariableType.INTERVAL,
    auto: variable.state.autoEnabled,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    auto_min: variable.state.autoMinInterval,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    auto_count: variable.state.autoStepCount,
  };
};

/**
 * Convert to Adhoc Variable
 */
export const convertToAdhocVariable = (
  commonProperties: ConvertCommonProperties,
  variable: AdHocFiltersVariable
): AdHocVariableModel => {
  return {
    ...commonProperties,
    type: VariableType.ADHOC,
    datasource: variable.state.datasource,
    filters: variable.state.filters,
    defaultKeys: variable.state.defaultKeys,
    baseFilters: variable.state.baseFilters,
  };
};

/**
 * Converts a SceneVariables object into an array of VariableModel objects.
 * templateSrv.getVariables returns TypedVariableModel but sceneVariablesSetToVariables return persisted schema model
 * They look close to identical (differ in what is optional in some places).
 * current property not included in scene variable result
 * The way templateSrv.getVariables is used it should not matter. it is mostly used to get names of all variables (for query editors).
 * So type and name are important. Maybe some external data sources also check current value so that is also important.
 * @param set - The SceneVariables object containing the variables to convert.
 * @param keepQueryOptions - (Optional) A boolean flag indicating whether to keep the options for query variables.
 *                           This should be set to `false` when variables are saved in the dashboard model,
 *                           but should be set to `true` when variables are used in the templateSrv to keep them in sync.
 *                           If `true`, the options for query variables are kept.
 */
export function getVariablesCompatibility(set: SceneVariables, keepQueryOptions?: boolean) {
  const variables: TypedVariableModel[] = [];

  for (const variable of set.state.variables) {
    const commonProperties: ConvertCommonProperties = {
      name: variable.state.name,
      label: variable.state.label,
      skipUrlSync: Boolean(variable.state.skipUrlSync),
      hide: variable.state.hide || VariableHide.dontHide,
      global: true,
      id: variable.state.key ?? '',
      rootStateKey: variable.state.key || null,
      state: LoadingState.Done,
      error: variable.state.error,
      index: 0,
      description: variable.state.description || null,
    };

    if (sceneUtils.isQueryVariable(variable)) {
      variables.push(convertToQueryVariable(commonProperties, variable, keepQueryOptions));
    }

    if (sceneUtils.isCustomVariable(variable)) {
      variables.push(convertToCustomVariable(commonProperties, variable));
    }

    if (sceneUtils.isDataSourceVariable(variable)) {
      variables.push(convertToDataSourceVariable(commonProperties, variable));
    }

    if (sceneUtils.isTextBoxVariable(variable)) {
      variables.push(convertToTextBoxVariable(commonProperties, variable));
    }

    if (sceneUtils.isConstantVariable(variable)) {
      variables.push(convertToConstantVariable(commonProperties, variable));
    }

    if (sceneUtils.isIntervalVariable(variable)) {
      variables.push(convertToIntervalVariable(commonProperties, variable));
    }

    if (sceneUtils.isAdHocVariable(variable)) {
      variables.push(convertToAdhocVariable(commonProperties, variable));
    }
  }

  return variables;
}
