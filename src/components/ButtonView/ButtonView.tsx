import React from 'react';
import { css, cx } from '@emotion/css';
import { EventBus, PanelData } from '@grafana/data';
import { Alert, Button, useStyles2, useTheme2 } from '@grafana/ui';
import { AllValue, AllValueParameter, TestIds } from '../../constants';
import { useRuntimeVariables, useStatus } from '../../hooks';
import { PanelOptions } from '../../types';
import { isVariableWithOptions, selectVariableValues } from '../../utils';
import { Styles } from './styles';

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
  options: { variable: variableName, padding = 0, status, name } = {},
  eventBus,
}) => {
  /**
   * Styles and Theme
   */
  const styles = useStyles2(Styles);
  const theme = useTheme2();

  /**
   * Runtime Variables
   */
  const { variable } = useRuntimeVariables(eventBus, variableName || '');

  /**
   * Status
   */
  const getStatus = useStatus({ data, name, status });

  /**
   * No variable selected
   */
  if (!variable) {
    return (
      <Alert severity="info" title="Variable" data-testid={TestIds.buttonView.noVariableMessage}>
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
      <Alert severity="info" title="Variable" data-testid={TestIds.buttonView.noOptionsMessage}>
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
      data-testid={TestIds.buttonView.root}
    >
      {variable.options.map((option) => {
        const value = option.value === AllValueParameter ? AllValue : option.value;
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
              selectVariableValues([value], variable);
            }}
            data-testid={TestIds.buttonView.item(value)}
          >
            {option.text.toString()}
          </Button>
        );
      })}
    </div>
  );
};
