import React, { useCallback, useMemo } from 'react';
import { CustomVariableModel, QueryVariableModel, SelectableValue } from '@grafana/data';
import { InlineField, Select } from '@grafana/ui';
import { AllValue, AllValueParameter, TestIds } from '../../constants';
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
    return variable.options
      .filter((option) => option.selected)
      .map((option) => (option.value === AllValueParameter ? AllValue : option.value.toString()));
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
          selectVariableValues([AllValue], variable);
          return;
        }

        const removedValues = values.filter((value) => !updatedValues.includes(value));
        selectVariableValues(removedValues, variable);
        return;
      }

      /**
       * Selected value while All is selected
       */
      if (updatedValues.length > 1 && values.includes(AllValue) && updatedValues.includes(AllValue)) {
        selectVariableValues(
          updatedValues.filter((value) => value !== AllValue),
          variable
        );
        return;
      }

      /**
       * Select All Value
       */
      if (updatedValues.length > 1 && !values.includes(AllValue) && updatedValues.includes(AllValue)) {
        selectVariableValues([AllValue], variable);
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
      const value = option.value === AllValueParameter ? AllValue : option.value.toString();
      return {
        label: option.text.toString(),
        value,
        ariaLabel: TestIds.optionsVariable.option(value),
      };
    });
  }, [variable]);

  return (
    <InlineField label={variable.label || variable.name}>
      <Select
        aria-label={TestIds.optionsVariable.root}
        onChange={onChange}
        options={options}
        isMulti={variable.multi}
        value={variable.multi ? values : values[0] || null}
      />
    </InlineField>
  );
};
