import React from 'react';
import { css } from '@emotion/css';
import { EventBus } from '@grafana/data';
import { Alert, InlineField } from '@grafana/ui';
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
export const MinimizeView: React.FC<Props> = ({
  options: { variable: variableName, padding = 0, emptyValue = false } = {},
  eventBus,
  width,
}) => {
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

  /**
   * Label and Select Width
   */
  const labelWidth = 10;
  const labelWidthPx = labelWidth * 8;
  const maxWidth = width - labelWidthPx - padding * 2;

  return (
    <div
      className={css`
        padding: ${padding}px;
      `}
      data-testid={TestIds.minimizeView.root}
    >
      <InlineField grow label={variable.label || variable.name} labelWidth={labelWidth}>
        <>
          {(variable.type === VariableType.QUERY || variable.type === VariableType.CUSTOM) && (
            <div style={{ maxWidth }}>
              <OptionsVariable variable={variable} emptyValue={emptyValue} />
            </div>
          )}
          {variable.type === VariableType.TEXTBOX && <TextVariable variable={variable} />}
        </>
      </InlineField>
    </div>
  );
};
