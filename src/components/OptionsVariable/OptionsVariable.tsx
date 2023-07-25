import React, { useCallback, useMemo } from 'react';
import { SelectableValue } from '@grafana/data';
import { InlineField, Select } from '@grafana/ui';
import { RuntimeVariable } from '../../types';
import { selectVariableValues } from '../../utils';

/**
 * Properties
 */
interface Props {
  variable: RuntimeVariable;
}

const AllValue = 'All';

export const OptionsVariable: React.FC<Props> = ({ variable }) => {
  /**
   * Current values
   */
  const values = useMemo(() => {
    return variable.options
      .filter((option) => option.selected)
      .map((option) => (option.value === '$__all' ? AllValue : option.value));
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
    return variable.options.map((option) => ({
      label: option.text,
      value: option.value === '$__all' ? AllValue : option.value,
    }));
  }, [variable]);

  return (
    <InlineField label={variable.label}>
      <Select
        onChange={onChange}
        options={options}
        isMulti={variable.multi}
        value={variable.multi ? values : values[0] || null}
      />
    </InlineField>
  );
};
