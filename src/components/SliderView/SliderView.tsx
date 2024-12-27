import { css, cx } from '@emotion/css';
import { EventBus, PanelProps } from '@grafana/data';
import { Alert, InlineField, useStyles2 } from '@grafana/ui';
import { Slider } from '@volkovlabs/components';
import React from 'react';

import { TEST_IDS } from '../../constants';
import { useRuntimeVariables, useSlider } from '../../hooks';
import { PanelOptions } from '../../types';
import { isVariableWithOptions, updateVariableOptions } from '../../utils';
import { getStyles } from './SliderView.styles';

/**
 * Properties
 */
interface Props extends PanelProps {
  /**
   * Options
   */
  options: PanelOptions;

  /**
   * Event Bus
   */
  eventBus: EventBus;

  /**
   * Panel Event Bus
   */
  panelEventBus: EventBus;
}

/**
 * Slider View
 */
export const SliderView: React.FC<Props> = ({
  width,
  options: { variable: variableName, padding = 0, showLabel = false, labelWidth },
  eventBus,
  panelEventBus,
}) => {
  /**
   * Runtime Variables
   */
  const { variable } = useRuntimeVariables(eventBus, variableName || '');

  /**
   * Use Slider hook
   */
  const slider = useSlider(isVariableWithOptions(variable) ? variable : undefined);

  /**
   * Styles and Theme
   */
  const styles = useStyles2(getStyles, slider.text, width);

  /**
   * No variable selected
   */
  if (!variable) {
    return (
      <Alert severity="info" title="Variable" data-testid={TEST_IDS.sliderView.noVariableMessage}>
        Variable is not selected. Constant, Data Source, Interval, AD hoc filters, variable types are not currently
        supported.
      </Alert>
    );
  }

  /**
   * Check if variable can be used with slider view
   */
  if ((isVariableWithOptions(variable) && variable.multi) || !isVariableWithOptions(variable)) {
    return (
      <Alert severity="info" title="Variable" data-testid={TEST_IDS.sliderView.noOptionsMessage}>
        View is not supported for the selected variable. Multiple values not supported. Variable without options not
        supported.
      </Alert>
    );
  }

  /**
   * Check if variable can be used with slider view
   */
  if (!variable.options.length) {
    return (
      <Alert severity="info" title="Variable" data-testid={TEST_IDS.sliderView.noAvailableOptionsMessage}>
        No Variable Options.
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
      data-testid={TEST_IDS.sliderView.root}
    >
      <InlineField
        label={showLabel && (variable.label || variable.name)}
        className={styles.field}
        grow
        labelWidth={labelWidth}
        data-testid={TEST_IDS.sliderView.field}
      >
        <div className={styles.slider}>
          <Slider
            data-testid={TEST_IDS.sliderView.slider}
            included={true}
            max={slider.max}
            min={slider.min}
            orientation="horizontal"
            onChange={(value) => {
              slider.setValue(value);
            }}
            onAfterChange={(value = slider.value) => {
              const currentSelectedValue = variable.options[value].value;

              updateVariableOptions({
                previousValues: [slider.variableValue],
                value: currentSelectedValue,
                variable,
                emptyValueEnabled: false,
                panelEventBus,
              });
            }}
            marks={slider.marks}
            value={slider.value}
            inputWidth={0}
          />
        </div>
      </InlineField>
    </div>
  );
};
