import { useEffect, useMemo, useState } from 'react';

import { RuntimeVariable, VariableType } from '../types';

/**
 * Use Slider
 */
export const useSlider = (variable?: RuntimeVariable) => {
  /**
   * Get Min index. Use for minimum range value in slider
   */
  const getMinIndex = useMemo(() => {
    if (variable?.type === VariableType.QUERY || variable?.type === VariableType.CUSTOM) {
      return variable?.includeAll ? 1 : 0;
    }
    return 0;
  }, [variable]);

  /**
   * Get index for the currently selected variable option
   */
  const getValueIndex = (variable?: RuntimeVariable, getMinIndex?: number) => {
    if (!variable) {
      return 1;
    }
    const rangeIndex = variable.options.findIndex((option) => option.selected && option.text !== 'All');
    return rangeIndex !== -1 ? rangeIndex : getMinIndex;
  };

  /**
   *  Get text value for the currently selected variable option
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
  const [sliderValue, setSliderValue] = useState(getValueIndex(variable, getMinIndex));
  const [currentIndex, setCurrentIndex] = useState(getValueIndex(variable, getMinIndex));

  /**
   * Marks for slider
   */
  const marks = useMemo(() => {
    if (variable?.type === VariableType.QUERY || variable?.type === VariableType.CUSTOM) {
      if (variable.includeAll) {
        return {
          0: variable.options[1].text,
          100: variable.options[variable.options.length - 1].text,
        };
      }
    }
    return '';
  }, [variable]);

  /**
   * Update the sliderValue that is used to the position on the slider
   * Is used to prevent incorrect flicker behavior on the slider
   */
  useEffect(() => {
    if (currentIndex !== sliderValue) {
      setSliderValue(currentIndex);
    }
  }, [currentIndex, sliderValue]);

  /**
   * Update the currentIndex through the dashboard
   * then updated currentIndex compare with sliderValue
   * Is used to prevent incorrect flicker behavior on the slider and update slider position
   */
  useEffect(() => {
    const currentOptionIndex = getValueIndex(variable, getMinIndex);
    if (currentIndex !== currentOptionIndex) {
      setCurrentIndex(currentOptionIndex);
    }
  }, [currentIndex, getMinIndex, variable]);

  return {
    sliderValue,
    minIndex: getMinIndex,
    variableValue,
    marks,
    setSliderValue,
    setCurrentIndex,
  };
};
