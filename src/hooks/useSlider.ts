import { useEffect, useMemo, useState } from 'react';

import { RuntimeVariableWithOptions } from '../types';

/**
 * Use Slider
 */
export const useSlider = (variable?: RuntimeVariableWithOptions) => {
  /**
   * Min value
   */
  const min = useMemo(() => {
    if (variable) {
      return variable?.includeAll ? 1 : 0;
    }

    return 0;
  }, [variable]);

  /**
   * Max value
   */
  const max = useMemo(() => {
    if (variable) {
      return variable.options.length - 1;
    }

    return 0;
  }, [variable]);

  /**
   * Get index for the currently selected variable value
   */
  const getIndexForVariableValue = (variable: RuntimeVariableWithOptions | undefined, value: string) => {
    if (variable) {
      return variable.optionIndexByName.get(value) ?? 0;
    }

    return 0;
  };

  /**
   * Current variable value
   */
  const variableValue = useMemo(() => {
    if (variable) {
      return Array.isArray(variable?.current.text) ? variable?.current.text[0] : variable?.current.text;
    }

    return '';
  }, [variable]);

  /**
   * Value
   */
  const [value, setValue] = useState(getIndexForVariableValue(variable, variableValue));

  /**
   * Marks for slider
   */
  const marks = useMemo(() => {
    if (variable) {
      return {
        0: variable.options[variable.includeAll ? 1 : 0].text,
        100: variable.options[variable.options.length - 1].text,
      };
    }
    return '';
  }, [variable]);

  /**
   * Variable value was updated somewhere so update slider value
   */
  useEffect(() => {
    setValue(getIndexForVariableValue(variable, variableValue));
  }, [variable, variableValue]);

  /**
   * Get option text for current value
   */
  const text = useMemo(() => {
    const optionText = variable?.options[value]?.text ?? '';

    return Array.isArray(optionText) ? optionText[0] : optionText;
  }, [value, variable?.options]);

  return {
    min,
    max,
    value,
    marks,
    setValue,
    text,
    variableValue,
  };
};
