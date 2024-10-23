import { act, renderHook } from '@testing-library/react';
import { VariableType } from 'types';

import { ALL_VALUE, ALL_VALUE_PARAMETER } from '../constants';
import { getRuntimeVariable } from '../utils';
import { useSlider } from './useSlider';

describe('Use Slider', () => {
  it('Should work if no variable', () => {
    const { result } = renderHook(() => useSlider());

    expect(result.current).toEqual(expect.any(Object));
  });

  describe('min', () => {
    it('Should start from 1 if includeAll enabled', () => {
      const variable = getRuntimeVariable({
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
      } as any);

      const { result } = renderHook(() => useSlider(variable as any));

      expect(result.current.min).toEqual(1);
    });

    it('Should start from 0 if includeAll disabled', () => {
      const variable = getRuntimeVariable({
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
      } as any);

      const { result } = renderHook(() => useSlider(variable as any));

      expect(result.current.min).toEqual(0);
    });
  });

  it('Should update slider value when variable changes', () => {
    const variable = getRuntimeVariable({
      options: [
        { selected: false, text: ALL_VALUE, value: ALL_VALUE_PARAMETER },
        { selected: false, text: 'Option 1', value: 'option1' },
        { selected: true, text: 'Option 2', value: 'option2' },
        { selected: false, text: 'Option 3', value: 'option3' },
      ],
      type: VariableType.QUERY,
      includeAll: true,
      current: {
        value: 'option2',
      },
    } as any);

    const { result, rerender } = renderHook((props: any) => useSlider(props), {
      initialProps: variable,
    });

    expect(result.current.value).toEqual(2);

    /**
     * Re-render with updated variable value
     */
    rerender(
      getRuntimeVariable({
        ...variable,
        current: {
          value: 'option1',
        },
        options: [
          { selected: true, text: 'Option 1' },
          { selected: false, text: 'Option 2' },
          { selected: false, text: 'Option 3' },
        ],
      } as any)
    );

    expect(result.current.value).toEqual(0);
  });

  it('Should return value if variable value is array', () => {
    const variable = getRuntimeVariable({
      options: [
        { selected: false, text: ALL_VALUE, value: ALL_VALUE_PARAMETER },
        { selected: false, text: 'Option 1', value: 'option1' },
        { selected: true, text: 'Option 2', value: 'option2' },
        { selected: false, text: 'Option 3', value: 'option3' },
      ],
      type: VariableType.QUERY,
      includeAll: true,
      current: {
        value: ['option2'],
      },
    } as any);

    const { result } = renderHook(() => useSlider(variable as any));

    expect(result.current.value).toEqual(2);
  });

  it('Should return text for value', async () => {
    const variable = getRuntimeVariable({
      options: [
        { selected: false, text: 'Option 1', value: 'option1' },
        { selected: true, text: 'Option 2', value: 'option2' },
        { selected: false, text: 'Option 3', value: 'option3' },
      ],
      type: VariableType.QUERY,
      current: {
        value: ['option2'],
      },
    } as any);

    const { result, rerender } = renderHook(() => useSlider(variable as any));

    expect(result.current.value).toEqual(1);
    expect(result.current.text).toEqual('Option 2');

    /**
     * Change value
     */
    await act(async () => result.current.setValue(2));

    /**
     * Re-render hook
     */
    rerender(variable);

    /**
     * Check updated result
     */
    expect(result.current.value).toEqual(2);
    expect(result.current.text).toEqual('Option 3');
  });

  describe('marks', () => {
    it('Should return marks with text', () => {
      const variable = getRuntimeVariable({
        type: VariableType.QUERY,
        includeAll: true,
        current: {
          value: '',
        },
        options: [
          { text: ALL_VALUE, value: ALL_VALUE_PARAMETER },
          { text: 'Option 0', value: 'option0' },
          { text: 'Option 1', value: 'option1' },
          { text: 'Option 2', value: 'option2' },
        ],
      } as any);

      const { result } = renderHook(() => useSlider(variable as any));

      expect(result.current.marks).toEqual({
        1: 'Option 0',
        3: 'Option 2',
      });
    });
  });

  it('Should return result in no options without errors', async () => {
    const variable = getRuntimeVariable({
      options: [],
      type: VariableType.QUERY,
      includeAll: true,
      current: {
        value: ['option2'],
      },
    } as any);

    const { result } = renderHook(() => useSlider(variable as any));

    expect(result.current.min).toEqual(1);
    expect(result.current.max).toEqual(0);
    expect(result.current.marks).toEqual('');
    expect(result.current.variableValue).toEqual('option2');
  });
});
