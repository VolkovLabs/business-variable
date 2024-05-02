import { useEffect, useMemo, useState } from 'react';

import { RuntimeVariable, VariableType } from '../types';

/**
 * Use Slider
 */
export const useSlider = (variable?: RuntimeVariable) => {
  /**
   * Min value
   */
  const min = useMemo(() => {
    if (variable?.type === VariableType.QUERY || variable?.type === VariableType.CUSTOM) {
      return variable?.includeAll ? 1 : 0;
    }
    return 0;
  }, [variable]);

  /**
   * Get index for the currently selected variable option
   */
  const getIndexForValue = (variable: RuntimeVariable | undefined, value: string) => {
    if (!variable) {
      return 0;
    }

    if (variable.type === VariableType.QUERY || variable.type === VariableType.CUSTOM) {
      return variable.optionIndexByName.get(value) ?? 0;
    }

    return 0;
  };

  /**
   * Get index of current selected option
   */
  const variableValue = useMemo(() => {
    if (variable?.type === VariableType.QUERY || variable?.type === VariableType.CUSTOM) {
      return Array.isArray(variable?.current.text) ? variable?.current.text[0] : variable?.current.text;
    }
    return '';
  }, [variable]);

  /**
   * State
   */
  const [value, setValue] = useState(getIndexForValue(variable, variableValue));

  /**
   * Marks for slider
   */
  const marks = useMemo(() => {
    if (variable?.type === VariableType.QUERY || variable?.type === VariableType.CUSTOM) {
      return {
        0: variable.options[variable.includeAll ? 1 : 0].text,
        100: variable.options[variable.options.length - 1].text,
      };
    }
    return '';
  }, [variable]);

  /**
   * Update the currentIndex through the dashboard
   * then updated currentIndex compare with sliderValue
   * Is used to prevent incorrect flicker behavior on the slider and update slider position
   */
  useEffect(() => {
    setValue(getIndexForValue(variable, variableValue));
  }, [variable, variableValue]);

  /**
   * Get current option text
   */
  const text = useMemo(() => {
    const optionText = variable?.options[value]?.text ?? '';
    return Array.isArray(optionText) ? optionText[0] : optionText;
  }, [value, variable?.options]);

  return {
    min,
    value,
    marks,
    setValue,
    text,
  };
};
