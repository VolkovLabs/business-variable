import React, { useCallback, useMemo } from 'react';
import { SelectableValue } from '@grafana/data';
import { Select } from '@grafana/ui';
import { AllValueParameter, TestIds } from '../../constants';
import { CustomVariableModel, QueryVariableModel } from '../../types';
import { selectVariableValues } from '../../utils';

/**
 * Properties
 */
interface Props {
  /**
   * Variable
   */
  variable: QueryVariableModel | CustomVariableModel;
}

/**
 * Options Variable
 * @param props
 */
export const OptionsVariable: React.FC<Props> = ({ variable }) => {
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
      const options = Array.isArray(value) ? value : [value];
      const updatedValues = options
        .filter((option) => option.value !== undefined)
        .map(({ value }) => value) as string[];

      /**
       * Deselect values
       */
      if (values.length > updatedValues.length) {
        /**
         * Select all
         */
        if (updatedValues.length === 0 && variable?.multi && variable.includeAll) {
          selectVariableValues([AllValueParameter], variable);
          return;
        }

        const removedValues = values.filter((value) => !updatedValues.includes(value));
        selectVariableValues(removedValues, variable);
        return;
      }

      /**
       * Selected value while All is selected
       */
      if (updatedValues.length > 1 && values.includes(AllValueParameter) && updatedValues.includes(AllValueParameter)) {
        selectVariableValues(
          updatedValues.filter((value) => value !== AllValueParameter),
          variable
        );
        return;
      }

      /**
       * Select All Value
       */
      if (
        updatedValues.length > 1 &&
        !values.includes(AllValueParameter) &&
        updatedValues.includes(AllValueParameter)
      ) {
        selectVariableValues([AllValueParameter], variable);
        return;
      }

      /**
       * Select Values
       */
      selectVariableValues(updatedValues, variable);
    },
    [values, variable]
  );

  /**
   * Options
   */
  const options = useMemo(() => {
    return variable.options.map((option) => {
      return {
        label: option.text,
        value: option.value,
        ariaLabel: TestIds.optionsVariable.option(option.value),
      };
    });
  }, [variable]);

  return (
    <Select
      aria-label={TestIds.optionsVariable.root}
      onChange={onChange}
      options={options}
      isMulti={variable.multi}
      value={variable.multi ? values : values[0] || null}
    />
  );
};
