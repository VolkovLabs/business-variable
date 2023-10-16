import { TypedVariableModel } from '@grafana/data';
import { locationService } from '@grafana/runtime';
import { AllValue, AllValueParameter, NoValueParameter } from '../constants';
import {
  CustomVariableModel,
  QueryVariableModel,
  RuntimeVariable,
  RuntimeVariableWithOptions,
  VariableType,
} from '../types';

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
        if (values.some((value) => value === AllValueParameter)) {
          setVariableValue(name, AllValue);
          return;
        }

        if (values.some((value) => value === NoValueParameter)) {
          setVariableValue(name, '');
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
            ...runtimeVariable.options
              .filter((option) => option.selected)
              .map((option) => (option.value === AllValueParameter ? option.text : option.value))
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
      let value = values[0];

      if (value === AllValueParameter) {
        value = AllValue;
      } else if (value === NoValueParameter) {
        value = '';
      }

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
 * Get Runtime Variable
 * @param variable
 */
export const getRuntimeVariable = (variable: TypedVariableModel): RuntimeVariable | undefined => {
  if (variable.type === VariableType.TEXTBOX) {
    return variable;
  }
  if (variable.type === VariableType.CUSTOM || variable.type === VariableType.QUERY) {
    const runtimeVariable = {
      ...variable,
      type: VariableType.CUSTOM,
      optionIndexByName: variable.options.reduce((acc, option, index) => {
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
