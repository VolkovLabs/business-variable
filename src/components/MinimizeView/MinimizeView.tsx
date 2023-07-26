import React from 'react';
import { css } from '@emotion/css';
import { EventBus } from '@grafana/data';
import { Alert } from '@grafana/ui';
import { TestIds } from '../../constants';
import { useRuntimeVariables } from '../../hooks';
import { PanelOptions, VariableType } from '../../types';
import { OptionsVariable } from '../OptionsVariable';
import { TextVariable } from '../TextVariable';

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
   * Width
   */
  width: number;
}

/**
 * Minimize View
 */
export const MinimizeView: React.FC<Props> = ({ options: { variable: variableName, padding } = {}, eventBus }) => {
  /**
   * Runtime Variables
   */
  const { variable } = useRuntimeVariables(eventBus, variableName || '');

  /**
   * No variable selected
   */
  if (!variable) {
    return (
      <Alert severity="info" title="Variable" data-testid={TestIds.minimizeView.noVariableMessage}>
        Variable is not selected.
      </Alert>
    );
  }

  return (
    <div
      className={css`
        padding: ${padding}px;
      `}
      data-testid={TestIds.minimizeView.root}
    >
      {(variable.type === VariableType.QUERY || variable.type === VariableType.CUSTOM) && (
        <OptionsVariable variable={variable} />
      )}
      {variable.type === VariableType.TEXTBOX && <TextVariable variable={variable} />}
    </div>
  );
};
