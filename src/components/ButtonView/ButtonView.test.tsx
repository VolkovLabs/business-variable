import { toDataFrame } from '@grafana/data';
import { fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { ALL_VALUE, ALL_VALUE_PARAMETER, TEST_IDS } from '../../constants';
import { useRuntimeVariables } from '../../hooks';
import { VariableType } from '../../types';
import { selectVariableValues } from '../../utils';
import { ButtonView } from './ButtonView';

/**
 * Properties
 */
type Props = React.ComponentProps<typeof ButtonView>;

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
  usePersistentStorage: jest.fn(() => persistentStorageMock),
}));

/**
 * Mock utils
 */
jest.mock('../../utils/variable', () => ({
  ...jest.requireActual('../../utils/variable'),
  selectVariableValues: jest.fn(),
}));

describe('ButtonView', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.buttonView);
  const selectors = getSelectors(screen);

  /**
   * Colors
   */
  const colors = {
    red: '#ff0000',
    green: '#00ff21',
  };

  /**
   * Data
   */
  const data = {
    series: [
      toDataFrame({
        fields: [
          {
            name: 'name',
            values: ['device1', 'device2', 'deviceWithoutLastValue'],
          },
          {
            name: 'last',
            values: [70, 81],
            display: (value: number) => ({ color: value > 80 ? colors.red : colors.green }),
          },
        ],
      }),
    ],
  };

  /**
   * Device Variable
   */
  const deviceVariable = {
    multi: true,
    includeAll: true,
    type: VariableType.CUSTOM,
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
        selected: false,
      },
    ],
  };

  /**
   * Get Components
   */
  const getComponent = (props: Partial<Props>) => {
    return <ButtonView data={data} panelEventBus={{}} {...(props as any)} />;
  };

  beforeEach(() => {
    jest.mocked(selectVariableValues).mockClear();
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

  it('Should work without options', () => {
    render(
      getComponent({
        options: undefined,
      })
    );

    expect(selectors.noVariableMessage());
  });

  it('Should show no options', () => {
    jest.mocked(useRuntimeVariables).mockImplementation(
      () =>
        ({
          variable: { ...deviceVariable, options: [] },
        }) as any
    );

    render(
      getComponent({
        options: {
          variable: 'device',
          status: 'last',
        } as any,
      })
    );

    expect(selectors.noOptionsMessage());
  });

  it('Should render variable options', () => {
    jest.mocked(useRuntimeVariables).mockImplementation(
      () =>
        ({
          variable: deviceVariable,
        }) as any
    );

    render(
      getComponent({
        options: {
          variable: 'device',
          status: 'last',
        } as any,
      })
    );

    expect(selectors.item(false, ALL_VALUE)).toBeInTheDocument();
    expect(selectors.item(false, 'device1')).toBeInTheDocument();
    expect(selectors.item(false, 'device2')).toBeInTheDocument();
  });

  it('Should update variable options', () => {
    const variable = {
      ...deviceVariable,
      options: deviceVariable.options.map((option) =>
        option.value === 'device1'
          ? {
              ...option,
              selected: true,
            }
          : option
      ),
    };
    jest.mocked(useRuntimeVariables).mockImplementation(
      () =>
        ({
          variable,
        }) as any
    );

    render(
      getComponent({
        options: {
          variable: 'device',
          status: 'last',
          persistent: true,
        } as any,
      })
    );

    expect(selectors.item(false, 'device1')).toBeInTheDocument();

    /**
     * Deselect item
     */
    fireEvent.click(selectors.item(false, 'device1'));

    /**
     * All should be selected
     */
    expect(selectVariableValues).toHaveBeenCalledWith({
      values: [ALL_VALUE_PARAMETER],
      runtimeVariable: variable,
      panelEventBus: expect.anything(),
    });

    /**
     * Should clear persistent values
     */
    expect(persistentStorageMock.remove).toHaveBeenCalled();
  });

  /**
   * Reset
   */
  it('Should reset variable options with All option', () => {
    const variable = {
      ...deviceVariable,
      options: deviceVariable.options.map((option) =>
        option.value === 'device1'
          ? {
              ...option,
              selected: true,
            }
          : option
      ),
      current: {
        value: ['device1'],
      },
    };
    jest.mocked(useRuntimeVariables).mockImplementationOnce(
      () =>
        ({
          variable,
        }) as any
    );

    render(
      getComponent({
        options: {
          variable: 'device',
          status: 'last',
          persistent: true,
          showResetButton: true,
        } as any,
      })
    );

    expect(selectors.item(false, 'device1')).toBeInTheDocument();
    expect(selectors.resetVariable()).toBeInTheDocument();

    /**
     * Reset variable
     */
    fireEvent.click(selectors.resetVariable());

    /**
     * All should be selected
     */
    expect(selectVariableValues).toHaveBeenCalledWith({
      panelEventBus: expect.anything(),
      runtimeVariable: variable,
      values: [ALL_VALUE_PARAMETER],
    });
  });

  it('Should reset variable options for multi variable without All option', () => {
    const variable = {
      ...deviceVariable,
      includeAll: false,
      options: [
        {
          text: 'device1',
          value: 'device1',
          selected: false,
        },
        {
          text: 'device2',
          value: 'device2',
          selected: false,
        },
        {
          text: 'device3',
          value: 'device3',
          selected: true,
        },
        {
          text: 'device4',
          value: 'device4',
          selected: false,
        },
      ],
      current: {
        value: ['device3'],
      },
    };
    jest.mocked(useRuntimeVariables).mockImplementationOnce(
      () =>
        ({
          variable,
        }) as any
    );

    render(
      getComponent({
        options: {
          variable: 'device',
          status: 'last',
          persistent: true,
          showResetButton: true,
        } as any,
      })
    );

    expect(selectors.resetVariable()).toBeInTheDocument();

    /**
     * Reset variable
     */
    fireEvent.click(selectors.resetVariable());

    /**
     * device1 should be selected
     */
    expect(selectVariableValues).toHaveBeenCalledWith({
      panelEventBus: expect.anything(),
      runtimeVariable: variable,
      values: ['device1'],
    });
  });

  it('Should reset variable options for none multi variable', () => {
    const variable = {
      ...deviceVariable,
      multi: false,
      includeAll: false,
      options: [
        {
          text: 'device1',
          value: 'device1',
          selected: false,
        },
        {
          text: 'device2',
          value: 'device2',
          selected: false,
        },
        {
          text: 'device3',
          value: 'device3',
          selected: true,
        },
        {
          text: 'device4',
          value: 'device4',
          selected: false,
        },
      ],
      current: {
        value: 'device3',
      },
    };
    jest.mocked(useRuntimeVariables).mockImplementationOnce(
      () =>
        ({
          variable,
        }) as any
    );

    render(
      getComponent({
        options: {
          variable: 'device',
          status: 'last',
          persistent: true,
          showResetButton: true,
        } as any,
      })
    );

    expect(selectors.resetVariable()).toBeInTheDocument();

    /**
     * Reset variable
     */
    fireEvent.click(selectors.resetVariable());

    /**
     * device1 should be selected
     */
    expect(selectVariableValues).toHaveBeenCalledWith({
      panelEventBus: expect.anything(),
      runtimeVariable: variable,
      values: ['device1'],
    });
  });

  /**
   * Variable label
   */
  it('Should display variable label with label property', () => {
    const variable = {
      ...deviceVariable,
      label: 'Test Label Variable',
      options: deviceVariable.options.concat([
        {
          value: 'unknownDevice',
          text: 'Unknown Device',
          selected: true,
        },
      ]),
    };
    jest.mocked(useRuntimeVariables).mockImplementationOnce(
      () =>
        ({
          variable,
        }) as any
    );

    render(
      getComponent({
        options: {
          variable: 'device',
          status: 'last',
          showLabel: true,
        } as any,
      })
    );

    expect(selectors.label()).toBeInTheDocument();
    expect(selectors.label()).toHaveTextContent('Test Label Variable');
  });

  it('Should display variable label with name property', () => {
    const variable = {
      ...deviceVariable,
      name: 'Test Name Variable',
      options: deviceVariable.options.concat([
        {
          value: 'unknownDevice',
          text: 'Unknown Device',
          selected: true,
        },
      ]),
    };
    jest.mocked(useRuntimeVariables).mockImplementationOnce(
      () =>
        ({
          variable,
        }) as any
    );

    render(
      getComponent({
        options: {
          variable: 'device',
          status: 'last',
          showLabel: true,
        } as any,
      })
    );

    expect(selectors.label()).toBeInTheDocument();
    expect(selectors.label()).toHaveTextContent('Test Name Variable');
  });

  it('Should work if no status color', () => {
    const variable = {
      ...deviceVariable,
      options: deviceVariable.options.concat([
        {
          value: 'unknownDevice',
          text: 'Unknown Device',
          selected: true,
        },
      ]),
    };
    jest.mocked(useRuntimeVariables).mockImplementationOnce(
      () =>
        ({
          variable,
        }) as any
    );

    render(
      getComponent({
        options: {
          variable: 'device',
          status: 'last',
        } as any,
      })
    );

    expect(selectors.item(false, 'unknownDevice')).toBeInTheDocument();
  });
});
