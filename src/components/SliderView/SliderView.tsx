import { css, cx } from '@emotion/css';
import { EventBus } from '@grafana/data';
import { Alert, InlineField, useStyles2 } from '@grafana/ui';
import { Slider } from '@volkovlabs/components';
import React, { useMemo } from 'react';

import { TEST_IDS } from '../../constants';
import { usePersistentStorage, useRuntimeVariables, useSlider } from '../../hooks';
import { PanelOptions } from '../../types';
import { isVariableWithOptions, updateVariableOptions } from '../../utils';
import { getStyles } from './SliderView.styles';
/**
 * Properties
 */
interface Props {
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
 * Button View
 */
export const SliderView: React.FC<Props> = ({
  options: { variable: variableName, padding = 0, persistent = false, showLabel = false, labelWidth },
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
  const { minIndex, variableValue, marks, sliderValue, setSliderValue, setCurrentIndex } = useSlider(variable);

  /**
   * Persistent storage
   */
  const persistentStorage = usePersistentStorage(variableName || '');

  /**
   * Styles and Theme
   */
  const styles = useStyles2(getStyles, variableValue);

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
   * No variable selected
   */
  if (!variable) {
    return (
      <Alert severity="info" title="Variable" data-testid={TEST_IDS.sliderView.noVariableMessage}>
        Variable is not selected.
      </Alert>
    );
  }

  /**
   * Check options
   */
  const options = isVariableWithOptions(variable) && variable.options.length && !variable.multi;
  if (!options) {
    return (
      <Alert severity="info" title="Variable" data-testid={TEST_IDS.sliderView.noOptionsMessage}>
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
            max={variable.options.length - 1}
            min={minIndex}
            orientation="horizontal"
            onChange={(value: number) => {
              if (value >= minIndex) {
                const currentSelectedValue = variable.options[value].value;

                /**
                 * Clear saved values on override by user
                 */
                if (persistent) {
                  persistentStorage.remove();
                }

                updateVariableOptions({
                  previousValues: values,
                  value: currentSelectedValue,
                  variable,
                  emptyValueEnabled: false,
                  panelEventBus,
                });

                setCurrentIndex(value);
                setSliderValue(value);
              }
            }}
            marks={marks}
            value={sliderValue}
            inputWidth={0}
          />
        </div>
      </InlineField>
    </div>
  );
};
