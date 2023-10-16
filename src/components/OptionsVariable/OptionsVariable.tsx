import React, { useCallback, useMemo } from 'react';
import { SelectableValue } from '@grafana/data';
import { Select } from '@grafana/ui';
import { TestIds } from '../../constants';
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
}

/**
 * Options Variable
 * @param props
 */
export const OptionsVariable: React.FC<Props> = ({ variable, emptyValue }) => {
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
      updateVariableOptions({
        previousValues: values,
        value: Array.isArray(value) ? value.map((option: SelectableValue) => option.value) : value.value || '',
        variable,
        emptyValueEnabled: emptyValue,
      });
    },
    [emptyValue, values, variable]
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
  }, [variable.options]);

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
