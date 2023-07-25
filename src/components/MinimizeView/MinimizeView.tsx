import React, { useCallback, useMemo } from 'react';
import { EventBus, SelectableValue } from '@grafana/data';
import { Alert, InlineField, Select, useTheme2 } from '@grafana/ui';
import { MinimizeViewOptions } from '../../types';
import { useRuntimeVariables } from '../../hooks';
import { selectVariableValues } from '../../utils';
import { Styles } from './styles';

/**
 * Properties
 */
interface Props {
  /**
   * Options
   */
  options?: MinimizeViewOptions;

  /**
   * Event Bus
   */
  eventBus: EventBus;
}

/**
 * Minimize View
 */
export const MinimizeView: React.FC<Props> = ({ options: { variable: variableName } = {}, eventBus }) => {
  /**
   * Styles and Theme
   */
  const theme = useTheme2();
  const styles = Styles(theme);

  /**
   * Runtime Variables
   */
  const { variable } = useRuntimeVariables(eventBus, variableName || '');

  /**
   * Current values
   */
  const values = useMemo(() => {
    if (!variable?.options) {
      return [];
    }

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
          selectVariableValues(['all'], variable);
          return;
        }

        const removedValues = values.filter((value) => !updatedValues.includes(value));
        selectVariableValues(removedValues, variable);
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
    if (!variable) {
      return [];
    }
    return variable.options.map((option) => ({
      label: option.text,
      value: option.value,
    }));
  }, [variable]);

  /**
   * No variable selected
   */
  if (!variable) {
    return (
      <Alert severity="info" title="Variable">
        Variable is not selected.
      </Alert>
    );
  }

  return (
    <div className={styles.root}>
      <InlineField label={variableName}>
        <Select onChange={onChange} options={options} isMulti={variable?.multi} value={values} />
      </InlineField>
    </div>
  );
};
