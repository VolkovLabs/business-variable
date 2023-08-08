import React from 'react';
import { toDataFrame } from '@grafana/data';
import { fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import { AllValue, AllValueParameter, TestIds } from '../../constants';
import { useRuntimeVariables } from '../../hooks';
import { VariableType } from '../../types';
import { selectVariableValues } from '../../utils';
import { ButtonView } from './ButtonView';

/**
 * Properties
 */
type Props = React.ComponentProps<typeof ButtonView>;

/**
 * Mock hooks
 */
jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  useRuntimeVariables: jest.fn(() => ({
    variable: null,
  })),
}));

/**
 * Mock utils
 */
jest.mock('../../utils', () => ({
  ...jest.requireActual('../../utils'),
  selectVariableValues: jest.fn(),
}));

describe('ButtonView', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TestIds.buttonView);
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
        text: AllValue,
        value: AllValueParameter,
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
    return <ButtonView data={data} {...(props as any)} />;
  };

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
    jest.mocked(useRuntimeVariables).mockImplementationOnce(
      () =>
        ({
          variable: { ...deviceVariable, options: [] },
        } as any)
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
    jest.mocked(useRuntimeVariables).mockImplementationOnce(
      () =>
        ({
          variable: deviceVariable,
        } as any)
    );

    render(
      getComponent({
        options: {
          variable: 'device',
          status: 'last',
        } as any,
      })
    );

    expect(selectors.item(false, AllValue)).toBeInTheDocument();
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
    jest.mocked(useRuntimeVariables).mockImplementationOnce(
      () =>
        ({
          variable,
        } as any)
    );

    render(
      getComponent({
        options: {
          variable: 'device',
          status: 'last',
        } as any,
      })
    );

    expect(selectors.item(false, 'device1')).toBeInTheDocument();

    fireEvent.click(selectors.item(false, 'device1'));

    expect(selectVariableValues).toHaveBeenCalledWith(['device1'], variable);
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
        } as any)
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