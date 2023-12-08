import { css, cx } from '@emotion/css';
import { EventBus, PanelData } from '@grafana/data';
import { Alert, Button, useStyles2, useTheme2 } from '@grafana/ui';
import React, { useMemo } from 'react';

import { ALL_VALUE, ALL_VALUE_PARAMETER, TEST_IDS } from '../../constants';
import { useRuntimeVariables, useStatus } from '../../hooks';
import { PanelOptions } from '../../types';
import { isVariableWithOptions, updateVariableOptions } from '../../utils';
import { getStyles } from './ButtonView.styles';

/**
 * Properties
 */
interface Props {
  /**
   * Options
   */
  options?: PanelOptions;

  /**
   * Event Bus
   */
  eventBus: EventBus;

  /**
   * Data
   */
  data: PanelData;
}

/**
 * Button View
 */
export const ButtonView: React.FC<Props> = ({
  data,
  options: { variable: variableName, padding = 0, status, name, emptyValue = false, persistent = false } = {},
  eventBus,
}) => {
  /**
   * Styles and Theme
   */
  const styles = useStyles2(getStyles);
  const theme = useTheme2();

  /**
   * Runtime Variables
   */
  const { variable } = useRuntimeVariables(eventBus, variableName || '');

  /**
   * Current values
   */
  const values = useMemo(() => {
    if (isVariableWithOptions(variable)) {
      return variable?.options.filter((option) => option.selected).map((option) => option.value);
    }
    return [];
  }, [variable]);

  /**
   * Status
   */
  const getStatus = useStatus({ data, name, status });

  /**
   * No variable selected
   */
  if (!variable) {
    return (
      <Alert severity="info" title="Variable" data-testid={TEST_IDS.buttonView.noVariableMessage}>
        Variable is not selected.
      </Alert>
    );
  }

  /**
   * Check options
   */
  const options = isVariableWithOptions(variable) && variable.options.length;
  if (!options) {
    return (
      <Alert severity="info" title="Variable" data-testid={TEST_IDS.buttonView.noOptionsMessage}>
        Options are not available.
      </Alert>
    );
  }

  return (
    <div
      className={cx(
        styles.root,
        css`
          padding: ${padding}px;
        `
      )}
      data-testid={TEST_IDS.buttonView.root}
    >
      {variable.options.map((option) => {
        const value = option.value === ALL_VALUE_PARAMETER ? ALL_VALUE : option.value;
        const status = getStatus(value);
        const backgroundColor = option.selected
          ? status.exist
            ? status.color
            : theme.colors.background.secondary
          : theme.colors.background.primary;

        return (
          <Button
            key={value}
            variant="secondary"
            fill="outline"
            style={{
              borderColor: status.exist ? status.color : '',
              backgroundColor: backgroundColor,
              color: theme.colors.getContrastText(backgroundColor),
            }}
            onClick={() => {
              let value: string | string[] = option.value;

              /**
               * Calc all selected values if multi value
               */
              if (variable.multi) {
                value = option.selected ? values?.filter((value) => value !== option.value) : [...values, option.value];
              }

              updateVariableOptions({
                previousValues: values,
                variable,
                emptyValueEnabled: emptyValue,
                persistentEnabled: persistent,
                value,
              });
            }}
            data-testid={TEST_IDS.buttonView.item(value)}
          >
            {option.text.toString()}
          </Button>
        );
      })}
    </div>
  );
};
