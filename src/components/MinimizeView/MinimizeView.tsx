import { css } from '@emotion/css';
import { EventBus } from '@grafana/data';
import { Alert, InlineField, useTheme2 } from '@grafana/ui';
import React from 'react';

import { TEST_IDS } from '../../constants';
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
  options: { variable: variableName, padding = 0, emptyValue = false, persistent = false } = {},
  eventBus,
  width,
}) => {
  /**
   * Runtime Variables
   */
  const { variable } = useRuntimeVariables(eventBus, variableName || '');

  /**
   * Styles and Theme
   */
  const theme = useTheme2();

  /**
   * No variable selected
   */
  if (!variable) {
    return (
      <Alert severity="info" title="Variable" data-testid={TEST_IDS.minimizeView.noVariableMessage}>
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
      data-testid={TEST_IDS.minimizeView.root}
    >
      <InlineField
        className={css`
          label {
            color: ${theme.colors.text.link};
            background: ${theme.colors.background.primary};
            border: 1px solid ${theme.colors.border.weak};
          }
        `}
        grow
        label={variable.label || variable.name}
        labelWidth={labelWidth}
      >
        <>
          {(variable.type === VariableType.QUERY || variable.type === VariableType.CUSTOM) && (
            <div style={{ maxWidth }}>
              <OptionsVariable variable={variable} emptyValue={emptyValue} persistent={persistent} />
            </div>
          )}
          {variable.type === VariableType.TEXTBOX && <TextVariable variable={variable} />}
        </>
      </InlineField>
    </div>
  );
};
