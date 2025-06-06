import { css, cx } from '@emotion/css';
import { EventBus, PanelData } from '@grafana/data';
import { Alert, Button, IconButton, InlineLabel, useStyles2, useTheme2 } from '@grafana/ui';
import React, { useMemo } from 'react';

import {
  ALL_VALUE,
  ALL_VALUE_PARAMETER,
  NO_VARIABLE_DEFAULT_MESSAGE,
  OPTIONS_NOT_AVAILABLE_MESSAGE,
  TEST_IDS,
} from '../../constants';
import { usePersistentStorage, useRuntimeVariables, useStatus } from '../../hooks';
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

  /**
   * Panel Event Bus
   */
  panelEventBus: EventBus;

  /**
   * Current height of the panel in pixels
   */
  height: number;
}

/**
 * Button View
 */
export const ButtonView: React.FC<Props> = ({
  data,
  options: {
    variable: variableName,
    padding = 0,
    status,
    name,
    emptyValue = false,
    persistent = false,
    showLabel = false,
    showResetButton = false,
    alertCustomMessage = '',
  } = {},
  eventBus,
  panelEventBus,
  height,
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
   * Persistent storage
   */
  const persistentStorage = usePersistentStorage(variableName ?? '');

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
        {alertCustomMessage || NO_VARIABLE_DEFAULT_MESSAGE}
      </Alert>
    );
  }

  /**
   * Check options
   */
  const options = isVariableWithOptions(variable) && variable.options.length;

  /**
   * No options alert message
   */
  if (!options) {
    return (
      <Alert severity="info" title="Variable" data-testid={TEST_IDS.buttonView.noOptionsMessage}>
        {OPTIONS_NOT_AVAILABLE_MESSAGE}
      </Alert>
    );
  }

  /**
   * Reset Variable
   */
  const resetVariable = (value: string | string[]) => {
    updateVariableOptions({
      previousValues: values,
      variable,
      emptyValueEnabled: emptyValue,
      value,
      panelEventBus,
    });
  };

  return (
    <div
      className={cx(
        styles.root,
        css`
          padding: ${padding}px;
          height: ${height}px;
          overflow-y: auto;
        `
      )}
      data-testid={TEST_IDS.buttonView.root}
    >
      {showResetButton && (
        <IconButton
          name="times"
          tooltip="Reset Variable"
          className={styles.resetButton}
          onClick={() => {
            const selectedValue = Array.isArray(variable.current.value)
              ? variable.current.value[0]
              : variable.current.value;

            const isAllSelected = selectedValue === ALL_VALUE_PARAMETER;

            /**
             * Variable with All option
             * Check if "All" option already selected
             */
            if (variable.includeAll && !isAllSelected) {
              /**
               * Reset to Initial first value (All)
               */
              resetVariable([...values, variable.options[0].value]);

              return;
            }

            /**
             * Variable with Multi Select option without All
             */
            if (variable.multi) {
              const isOnlyFirstSelected = variable.current.value.length === 1 && variable.options[0].selected;

              /**
               * Reset to Initial first value
               * Check if only first option already selected
               */
              if (!isOnlyFirstSelected) {
                resetVariable(variable.options[0].value);
              }

              return;
            }

            /**
             * Reset to Initial first value for default cases
             */
            resetVariable(variable.options[0].value);
          }}
          aria-label="Reset Variable"
          data-testid={TEST_IDS.buttonView.resetVariable}
        />
      )}
      {showLabel && (
        <InlineLabel data-testid={TEST_IDS.buttonView.label} className={styles.label} width="auto" transparent={true}>
          {variable.label || variable.name}
        </InlineLabel>
      )}
      {variable.options.map((option) => {
        const value = option.value === ALL_VALUE_PARAMETER ? ALL_VALUE : option.value;
        const status = getStatus(value);
        const backgroundColor = option.selected
          ? status.exist
            ? status.color
            : theme.colors.border.weak
          : theme.colors.background.primary;

        return (
          <Button
            key={value}
            variant="secondary"
            fill="outline"
            className={css`
              background-color: ${backgroundColor};
              margin: ${theme.spacing(0.25)};
              color: ${theme.colors.getContrastText(backgroundColor)};
              border-color: ${status.exist ? status.color : ''};
            `}
            onClick={() => {
              let value: string | string[] = option.value;

              /**
               * Calc all selected values if multi value
               */
              if (variable.multi) {
                value = option.selected ? values?.filter((value) => value !== option.value) : [...values, option.value];
              }

              /**
               * Clear saved values on override by user
               */
              if (persistent) {
                persistentStorage.remove();
              }

              updateVariableOptions({
                previousValues: values,
                variable,
                emptyValueEnabled: emptyValue,
                value,
                panelEventBus,
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
