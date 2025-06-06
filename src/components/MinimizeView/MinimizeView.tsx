import { css } from '@emotion/css';
import { EventBus } from '@grafana/data';
import { Alert, InlineField, useStyles2 } from '@grafana/ui';
import React, { useMemo } from 'react';

import { NO_VARIABLE_DEFAULT_MESSAGE, TEST_IDS } from '../../constants';
import { useRuntimeVariables } from '../../hooks';
import { MinimizeOutputFormat, PanelOptions, VariableType } from '../../types';
import { DateSelector } from '../DateSelector';
import { DateTimeSelector } from '../DateTimeSelector';
import { OptionsVariable } from '../OptionsVariable';
import { TextVariable } from '../TextVariable';
import { getStyles } from './MinimizeView.styles';

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

  /**
   * Panel Event Bus
   */
  panelEventBus: EventBus;

  /**
   * Time zone of the current dashboard
   */
  timeZone: string;
}

/**
 * Minimize View
 */
export const MinimizeView: React.FC<Props> = ({
  options: {
    variable: variableName,
    padding = 0,
    emptyValue = false,
    persistent = false,
    customValue = false,
    showLabel = false,
    labelWidth,
    maxVisibleValues,
    minimizeOutputFormat = MinimizeOutputFormat.TEXT,
    isUseLocalTime = false,
    alertCustomMessage = '',
  } = {},
  timeZone,
  eventBus,
  panelEventBus,
}) => {
  /**
   * Runtime Variables
   */
  const { variable } = useRuntimeVariables(eventBus, variableName || '');

  /**
   * Date Time Selector view
   */
  const isUseDateTimeSelector = useMemo(
    () =>
      minimizeOutputFormat === MinimizeOutputFormat.DATETIME || minimizeOutputFormat === MinimizeOutputFormat.TIMESTAMP,
    [minimizeOutputFormat]
  );

  /**
   * Date only Selector view
   */
  const isUseDateSelector = useMemo(() => minimizeOutputFormat === MinimizeOutputFormat.DATE, [minimizeOutputFormat]);

  /**
   * Styles
   */
  const styles = useStyles2(getStyles);

  /**
   * No variable selected
   */
  if (!variable) {
    return (
      <Alert severity="info" title="Variable" data-testid={TEST_IDS.minimizeView.noVariableMessage}>
        {alertCustomMessage || NO_VARIABLE_DEFAULT_MESSAGE}
      </Alert>
    );
  }

  return (
    <div
      className={css`
        padding: ${padding}px;
      `}
      data-testid={TEST_IDS.minimizeView.root}
    >
      <InlineField
        className={styles.field}
        grow={true}
        shrink={true}
        label={showLabel && (variable.label || variable.name)}
        labelWidth={labelWidth}
      >
        <>
          {(variable.type === VariableType.QUERY || variable.type === VariableType.CUSTOM) && (
            <OptionsVariable
              variable={variable}
              emptyValue={emptyValue}
              persistent={persistent}
              customValue={customValue}
              panelEventBus={panelEventBus}
              maxVisibleValues={maxVisibleValues}
            />
          )}
          {variable.type === VariableType.TEXTBOX && isUseDateSelector && (
            <DateSelector
              variable={variable}
              persistent={persistent}
              panelEventBus={panelEventBus}
              isUseLocalTime={isUseLocalTime}
            />
          )}
          {variable.type === VariableType.TEXTBOX && isUseDateTimeSelector && (
            <DateTimeSelector
              variable={variable}
              persistent={persistent}
              panelEventBus={panelEventBus}
              timeZone={timeZone}
              isUseLocalTime={isUseLocalTime}
              minimizeOutputFormat={minimizeOutputFormat}
            />
          )}
          {variable.type === VariableType.TEXTBOX && !isUseDateTimeSelector && !isUseDateSelector && (
            <TextVariable variable={variable} panelEventBus={panelEventBus} />
          )}
        </>
      </InlineField>
    </div>
  );
};
