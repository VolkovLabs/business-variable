import { act, fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { ALL_VALUE, ALL_VALUE_PARAMETER, TEST_IDS } from '../../constants';
import { useRuntimeVariables, useSlider } from '../../hooks';
import { VariableType } from '../../types';
import { updateVariableOptions } from '../../utils';
import { SliderView } from './SliderView';

/**
 * Properties
 */
type Props = React.ComponentProps<typeof SliderView>;

/**
 * Mock hooks
 */
jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  useRuntimeVariables: jest.fn(() => ({
    variable: null,
  })),
  useSlider: jest.fn(() => ({
    value: 0,
    min: 1,
    max: 10,
    text: 'Device 1',
    variableValue: 'device1',
    setValue: jest.fn(),
  })),
}));

/**
 * Mock utils
 */
jest.mock('../../utils/options-variable', () => ({
  ...jest.requireActual('../../utils/options-variable'),
  updateVariableOptions: jest.fn(),
}));

describe('SliderView', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.sliderView);
  const selectors = getSelectors(screen);

  /**
   * Device Variable
   */
  const deviceVariable = {
    multi: true,
    includeAll: true,
    type: VariableType.CUSTOM,
    current: {
      text: 'device2',
    },
    options: [
      {
        text: ALL_VALUE,
        value: ALL_VALUE_PARAMETER,
        selected: false,
      },
      {
        text: 'device1',
        value: 'device1',
        selected: false,
      },
      {
        text: 'device2',
        value: 'device2',
        selected: true,
      },
    ],
  };

  /**
   * Get Components
   */
  const getComponent = (props: Partial<Props>) => {
    return <SliderView panelEventBus={{}} {...(props as any)} />;
  };

  beforeEach(() => {
    jest.mocked(useSlider).mockClear();
    jest.mocked(updateVariableOptions).mockClear();
  });

  it('Should show no variable message', () => {
    render(
      getComponent({
        options: {
          variable: '',
        } as any,
      })
    );

    expect(selectors.noVariableMessage());
  });

  it('Should call without options', () => {
    render(
      getComponent({
        options: {} as any,
      })
    );

    expect(selectors.noVariableMessage());
  });

  it('Should show no options message', () => {
    jest.mocked(useRuntimeVariables).mockImplementationOnce(
      () =>
        ({
          variable: { ...deviceVariable, options: [] },
        }) as any
    );

    render(
      getComponent({
        options: {
          variable: 'device',
        } as any,
      })
    );

    expect(selectors.noOptionsMessage());
  });

  it('Should show no available options message', () => {
    jest.mocked(useRuntimeVariables).mockImplementationOnce(
      () =>
        ({
          variable: { ...deviceVariable, options: [], type: VariableType.CUSTOM, multi: false },
        }) as any
    );

    render(
      getComponent({
        options: {
          variable: 'device',
        } as any,
      })
    );

    expect(selectors.noAvailableOptionsMessage());
  });

  describe('Display Slider', () => {
    const options = [
      {
        text: 'device1',
        value: 'device1',
        selected: true,
      },
      {
        text: 'device2',
        value: 'device2',
        selected: false,
      },
    ];
    const deviceVariable = {
      multi: false,
      includeAll: false,
      type: VariableType.CUSTOM,
      label: 'Device',
      name: 'Device',
      current: {
        text: 'device1',
      },
      options: options,
    };

    it('Should Show Slider', async () => {
      jest.mocked(useRuntimeVariables).mockImplementationOnce(
        () =>
          ({
            variable: deviceVariable,
          }) as any
      );

      render(
        getComponent({
          options: {
            variable: 'device',
            persistent: true,
            showLabel: true,
            padding: 20,
            labelWidth: 10,
          } as any,
        })
      );

      expect(selectors.field()).toBeInTheDocument();
      expect(selectors.field()).toHaveTextContent('Device');
      expect(selectors.slider()).toBeInTheDocument();

      expect(selectors.root()).toHaveStyle('padding:20px');
    });

    it('Should Show correct padding', async () => {
      jest.mocked(useRuntimeVariables).mockImplementationOnce(
        () =>
          ({
            variable: deviceVariable,
          }) as any
      );

      render(
        getComponent({
          options: {
            variable: 'device',
            persistent: true,
            showLabel: true,
            labelWidth: 10,
          } as any,
        })
      );

      expect(selectors.field()).toBeInTheDocument();
      expect(selectors.field()).toHaveTextContent('Device');
      expect(selectors.slider()).toBeInTheDocument();

      expect(selectors.root()).not.toHaveStyle('padding:20px');
      expect(selectors.root()).toHaveStyle('padding:0px');
    });

    it('Should Show Slider with name', async () => {
      const variableWithoutLabel = {
        ...deviceVariable,
        label: '',
        name: 'Device',
      };

      jest.mocked(useRuntimeVariables).mockImplementationOnce(
        () =>
          ({
            variable: variableWithoutLabel,
          }) as any
      );
      render(
        getComponent({
          options: {
            variable: 'device',
            persistent: true,
            showLabel: true,
          } as any,
        })
      );

      expect(selectors.field()).toBeInTheDocument();
      expect(selectors.field()).toHaveTextContent('Device');
      expect(selectors.slider()).toBeInTheDocument();
    });

    it('Should not display label', async () => {
      jest.mocked(useRuntimeVariables).mockImplementationOnce(
        () =>
          ({
            variable: deviceVariable,
          }) as any
      );

      render(
        getComponent({
          options: {
            variable: 'device',
            showLabel: false,
          } as any,
        })
      );

      expect(selectors.field()).toBeInTheDocument();
      expect(selectors.field()).toHaveTextContent('');
      expect(selectors.slider()).toBeInTheDocument();
    });
  });

  describe('Update value', () => {
    const options = [
      {
        text: ALL_VALUE,
        value: ALL_VALUE_PARAMETER,
        selected: false,
      },
      {
        text: 'device1',
        value: 'device1',
        selected: true,
      },
      {
        text: 'device2',
        value: 'device2',
        selected: false,
      },
      {
        text: 'device3',
        value: 'device3',
        selected: false,
      },
    ];

    const deviceVariable = {
      multi: false,
      includeAll: true,
      type: VariableType.CUSTOM,
      current: {
        text: 'device1',
      },
      options: options,
    };

    beforeEach(() => {
      jest.mocked(useRuntimeVariables).mockImplementationOnce(
        () =>
          ({
            variable: deviceVariable,
          }) as any
      );
    });

    it('Should update slider value without updating variable', async () => {
      const setValue = jest.fn();

      jest.mocked(useSlider).mockReturnValueOnce({
        value: 1,
        min: 0,
        max: 10,
        variableValue: 'device1',
        setValue,
        text: 'Device 1',
        marks: {},
      });

      render(
        getComponent({
          options: {
            variable: 'device',
            persistent: true,
          } as any,
        })
      );

      expect(selectors.field()).toBeInTheDocument();
      expect(selectors.slider()).toBeInTheDocument();

      await act(() => fireEvent.change(selectors.slider(), { target: { value: 3 } }));

      expect(setValue).toHaveBeenCalled();
      expect(setValue).toHaveBeenCalledWith(3);

      expect(updateVariableOptions).not.toHaveBeenCalled();
    });

    it('Should update variable value on blur', async () => {
      const setValue = jest.fn();

      jest.mocked(useSlider).mockReturnValueOnce({
        value: 1,
        min: 0,
        max: 10,
        variableValue: 'device1',
        setValue,
        text: 'Device 1',
        marks: {},
      });

      render(
        getComponent({
          options: {
            variable: 'device',
            persistent: true,
          } as any,
        })
      );

      expect(selectors.field()).toBeInTheDocument();
      expect(selectors.slider()).toBeInTheDocument();

      await act(() => fireEvent.change(selectors.slider(), { target: { value: 3 } }));
      await act(() => fireEvent.blur(selectors.slider(), { target: { value: 3 } }));

      expect(setValue).toHaveBeenCalled();
      expect(setValue).toHaveBeenCalledWith(3);

      /**
       * Check if variable value updated
       */
      expect(updateVariableOptions).toHaveBeenCalledWith(
        expect.objectContaining({
          value: options[3].value,
          previousValues: ['device1'],
          variable: deviceVariable,
        })
      );
    });

    it('Should not update variable value if value not changed', async () => {
      const setValue = jest.fn();

      jest.mocked(useSlider).mockReturnValueOnce({
        value: 1,
        min: 0,
        max: 10,
        variableValue: 'device1',
        setValue,
        text: 'Device 1',
        marks: {},
      });

      render(
        getComponent({
          options: {
            variable: 'device',
          } as any,
        })
      );

      expect(selectors.field()).toBeInTheDocument();
      expect(selectors.slider()).toBeInTheDocument();

      await act(() => fireEvent.change(selectors.slider(), { target: { value: 1 } }));

      expect(setValue).not.toHaveBeenCalled();
    });
  });
});
