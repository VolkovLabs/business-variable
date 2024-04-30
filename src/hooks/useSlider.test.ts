import { renderHook } from '@testing-library/react';
import { VariableType } from 'types';

import { useSlider } from './useSlider';

describe('Use Slider', () => {
  it('Should initialize with default values', () => {
    const { result } = renderHook(() => useSlider());
    const { sliderValue, minIndex, variableValue, setSliderValue, setCurrentIndex } = result.current;

    expect(sliderValue).toBe(1);
    expect(minIndex).toBe(0);
    expect(variableValue).toBe('');
    expect(typeof setSliderValue).toBe('function');
    expect(typeof setCurrentIndex).toBe('function');
  });

  describe('minIndex', () => {
    it('Should return minIndex should be 1 for includeAll', () => {
      const variable = {
        options: [
          { selected: false, text: 'All' },
          { selected: false, text: 'Option 1' },
          { selected: true, text: 'Option 2' },
          { selected: false, text: 'Option 3' },
        ],
        type: VariableType.QUERY,
        includeAll: true,
        current: {
          text: 'Option 2',
        },
      };

      const { result } = renderHook((props: any) => useSlider(props), {
        initialProps: variable,
      });

      expect(result.current.minIndex).toBe(1);
    });

    it('Should return minIndex should be 0 for none includeAll', () => {
      const variable = {
        options: [
          { selected: false, text: 'Option 1' },
          { selected: true, text: 'Option 2' },
          { selected: false, text: 'Option 3' },
        ],
        type: VariableType.QUERY,
        includeAll: false,
        current: {
          text: 'Option 2',
        },
      };

      const { result } = renderHook((props: any) => useSlider(props), {
        initialProps: variable,
      });

      expect(result.current.minIndex).toBe(0);
    });
  });

  it('Should update slider value when variable changes', () => {
    const variable = {
      options: [
        { selected: false, text: 'Option 1' },
        { selected: true, text: 'Option 2' },
        { selected: false, text: 'Option 3' },
      ],
      type: 'QUERY',
      includeAll: true,
      current: {
        text: 'Current Value',
      },
    };

    const { result, rerender } = renderHook((props: any) => useSlider(props), {
      initialProps: variable,
    });

    expect(result.current.sliderValue).toBe(1);

    const updatedVariable = {
      ...variable,
      options: [
        { selected: true, text: 'Option 1' },
        { selected: false, text: 'Option 2' },
        { selected: false, text: 'Option 3' },
      ],
    };

    rerender(updatedVariable);

    expect(result.current.sliderValue).toBe(0);
  });

  it('Should return valueIndex if it is not -1', () => {
    const variable = {
      options: [
        { selected: false, text: 'Option 1' },
        { selected: true, text: 'Option 2' },
        { selected: false, text: 'Option 3' },
      ],
    };

    const { result } = renderHook(() => useSlider(variable as any));

    expect(result.current.sliderValue).toBe(1);
  });

  it('Should return valueIndex if rangeIndex is -1', () => {
    const variable = {
      options: [
        { selected: false, text: 'Option 1' },
        { selected: false, text: 'Option 2' },
        { selected: false, text: 'Option 3' },
      ],
    };

    const { result } = renderHook(() => useSlider(variable as any));

    expect(result.current.sliderValue).toBe(0);
  });

  it('Should return the first element of current.text if it is an array', () => {
    const variable = {
      type: VariableType.QUERY,
      current: {
        text: ['Option 3'],
      },
      options: [
        { selected: false, text: 'Option 1' },
        { selected: false, text: 'Option 2' },
        { selected: true, text: 'Option 3' },
      ],
    };

    const { result } = renderHook(() => useSlider(variable as any));

    expect(result.current.variableValue).toBe('Option 3');
  });

  it('Should return current.text if it is not an array', () => {
    const variable = {
      type: VariableType.QUERY,
      current: {
        text: 'Option 3',
      },
      options: [
        { selected: false, text: 'Option 1' },
        { selected: false, text: 'Option 2' },
        { selected: false, text: 'Option 3' },
      ],
    };

    const { result } = renderHook(() => useSlider(variable as any));

    expect(result.current.variableValue).toBe('Option 3');
  });

  describe('marks', () => {
    it('Should return marks for slider without All', () => {
      const variable = {
        type: VariableType.QUERY,
        includeAll: true,
        current: {
          text: 'Option 2',
        },
        options: [{ text: 'All' }, { text: 'Option 0' }, { text: 'Option 1' }, { text: 'Option 2' }],
      };

      const { result } = renderHook(() => useSlider(variable as any));

      expect(result.current.marks).toEqual({
        0: 'Option 0',
        100: 'Option 2',
      });
    });
  });
});
