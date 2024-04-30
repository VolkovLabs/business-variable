import { act, fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { ALL_VALUE, ALL_VALUE_PARAMETER, TEST_IDS } from '../../constants';
import { usePersistentStorage, useRuntimeVariables, useSlider } from '../../hooks';
import { VariableType } from '../../types';
import { SliderView } from './SliderView';

/**
 * Properties
 */
type Props = React.ComponentProps<typeof SliderView>;

/**
 * Persistent Storage Mock
 */
const persistentStorageMock = {
  remove: jest.fn(),
};

/**
 * Mock hooks
 */
jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  useRuntimeVariables: jest.fn(() => ({
    variable: null,
  })),
  useSlider: jest.fn(() => ({
    sliderValue: '',
    minIndex: '',
    currentValue: '',
    setSliderValue: jest.fn(),
    setCurrentIndex: jest.fn(),
  })),
  usePersistentStorage: jest.fn(() => persistentStorageMock),
}));

/**
 * Mock utils
 */
jest.mock('../../utils/variable', () => ({
  ...jest.requireActual('../../utils/variable'),
  selectVariableValues: jest.fn(),
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
            persistent: true,
            showLabel: false,
          } as any,
        })
      );

      expect(selectors.field()).toBeInTheDocument();
      expect(selectors.field()).toHaveTextContent('');
      expect(selectors.slider()).toBeInTheDocument();
    });
  });

  describe('Persisten Storage', () => {
    const options = [
      {
        text: 'device1',
        value: 'device1',
        selected: true,
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

    it('Should call usePersistentStorage with variable name', async () => {
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
          } as any,
        })
      );

      expect(usePersistentStorage).toHaveBeenCalledWith('');
      expect(usePersistentStorage).toHaveBeenCalledWith('device');
      expect(usePersistentStorage).toHaveBeenCalledWith('device');
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

    it('Should update variable value', async () => {
      const setCurrentIndex = jest.fn();

      jest.mocked(useSlider).mockImplementationOnce(
        () =>
          ({
            sliderValue: 1,
            minIndex: '1',
            currentValue: 'device1',
            setCurrentIndex: setCurrentIndex,
            setSliderValue: jest.fn(),
          }) as any
      );

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

      expect(persistentStorageMock.remove).toHaveBeenCalled();

      expect(setCurrentIndex).toHaveBeenCalled();
      expect(setCurrentIndex).toHaveBeenCalledWith(3);
    });

    it('Should not update variable value if value less then minIndex', async () => {
      const setCurrentIndex = jest.fn();

      jest.mocked(useSlider).mockImplementationOnce(
        () =>
          ({
            sliderValue: 1,
            minIndex: '1',
            currentValue: 'device1',
            setCurrentIndex: setCurrentIndex,
            setSliderValue: jest.fn(),
          }) as any
      );

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

      await act(() => fireEvent.change(selectors.slider(), { target: { value: 0 } }));

      expect(setCurrentIndex).not.toHaveBeenCalled();
    });
  });
});
