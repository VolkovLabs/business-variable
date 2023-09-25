import { locationService } from '@grafana/runtime';
import { AllValue, AllValueParameter } from '../constants';
import { CustomVariableModel, QueryVariableModel, RuntimeVariable, VariableType } from '../types';
import { TypedVariableModel } from '@grafana/data';

/**
 * Set Variable Value
 * @param name
 * @param value
 */
const setVariableValue = (name: string, value: unknown) => {
  locationService.partial({ [`var-${name}`]: value }, true);
};

/**
 * Select Variable Values
 * @param values
 * @param runtimeVariable
 */
export const selectVariableValues = (values: string[], runtimeVariable?: RuntimeVariable) => {
  if (!runtimeVariable) {
    return;
  }

  switch (runtimeVariable.type) {
    case VariableType.CUSTOM:
    case VariableType.QUERY: {
      const { name, multi } = runtimeVariable;

      /**
       * Multi update
       */
      if (multi) {
        if (values.some((value) => value.toLowerCase() === 'all')) {
          setVariableValue(name, AllValue);
          return;
        }

        /**
         * All Selected values for variable
         */
        const searchParams = locationService
          .getSearch()
          .getAll(`var-${name}`)
          .filter((s) => s.toLowerCase().indexOf('all') !== 0);

        /**
         * Values selected, but not defined in the URL
         */
        if (searchParams.length === 0 && !locationService.getSearchObject()[`var-${name}`]) {
          searchParams.push(
            ...runtimeVariable.options.filter((option) => option.selected).map((option) => option.text)
          );
        }

        /**
         * Get Already Selected Values
         */
        const alreadySelectedValues = values.filter((value) => searchParams.includes(value));

        /**
         * Deselect values
         */
        if (alreadySelectedValues.length === values.length) {
          setVariableValue(
            name,
            searchParams.filter((value) => !alreadySelectedValues.includes(value))
          );
          return;
        }

        const uniqueValues = [...new Set(values.concat(searchParams)).values()];

        setVariableValue(name, uniqueValues);
        return;
      }

      /**
       * Single Value
       */
      const value = values[0];
      setVariableValue(name, value);
      return;
    }
    case VariableType.TEXTBOX: {
      const value = values[0];
      setVariableValue(runtimeVariable.name, value);
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
 * Get Variables Map
 */
export const getVariablesMap = (variables: TypedVariableModel[]): Record<string, RuntimeVariable> => {
  return variables.reduce((acc, variable) => {
    if (variable.type === VariableType.TEXTBOX) {
      return {
        ...acc,
        [variable.name]: variable,
      };
    }
    if (variable.type === VariableType.CUSTOM || variable.type === VariableType.QUERY) {
      return {
        ...acc,
        [variable.name]: {
          ...variable,
          optionsMap: variable.options.reduce(
            (acc, option) => ({
              ...acc,
              [option.value === AllValueParameter ? AllValue : (option.value as string)]: option,
            }),
            {}
          ),
        },
      };
    }
    return acc;
  }, {});
};
