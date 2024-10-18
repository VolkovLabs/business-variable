import { useEffect, useMemo, useState } from 'react';

import { RuntimeVariableWithOptions } from '../types';

/**
 * Use Slider
 */
export const useSlider = (variable?: RuntimeVariableWithOptions) => {
  /**
   * Options
   */
  const options = useMemo(() => {
    return !variable?.options ? [] : variable.options;
  }, [variable?.options]);

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
      return options.length >= 1 ? options.length - 1 : 0;
    }

    return 0;
  }, [options.length, variable]);

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
      return Array.isArray(variable?.current.value) ? variable?.current.value[0] : variable?.current.value;
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
    if (variable && options.length > 0) {
      return {
        [min]: options[min].text,
        [max]: options[max].text,
      };
    }
    return '';
  }, [max, min, options, variable]);

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
    return variable?.options[value]?.text ?? '';
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
