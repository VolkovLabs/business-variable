import { act, fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '../../constants';
import { getDateInLocalTimeFormat, selectVariableValues } from '../../utils';
import { DateSelector } from './DateSelector';

/**
 * Mock utils
 */
jest.mock('../../utils', () => ({
  selectVariableValues: jest.fn(),
  getDateInLocalTimeFormat: jest.fn(),
}));

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
  usePersistentStorage: jest.fn(() => persistentStorageMock),
}));

/**
 * Properties
 */
type Props = React.ComponentProps<typeof DateSelector>;

/**
 * Date Selector
 */
describe('Date Time Selector', () => {
  const defaultVariable = {
    label: 'dateTimeTS',
    current: {
      value: '2025-01-21',
    },
  };

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.datePicker);
  const selectors = getSelectors(screen);

  /**
   * Get Tested Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <DateSelector variable={defaultVariable} panelEventBus={{} as any} {...(props as any)} />;
  };

  beforeEach(() => {
    jest.mocked(selectVariableValues).mockClear();
    jest.mocked(getDateInLocalTimeFormat).mockClear();
  });

  it('Should apply initial variable value from variable', () => {
    render(
      getComponent({
        variable: defaultVariable as any,
      })
    );

    expect(selectors.root()).toBeVisible();
    expect(selectors.root()).toHaveValue('2025-01-21');
  });

  it('Should apply initial variable value from variable if value is empty', () => {
    const variable = {
      label: 'dateTimeTS',
      current: {
        value: '',
      },
    } as any;

    render(
      getComponent({
        variable: variable,
      })
    );

    expect(selectors.root()).toBeVisible();
    expect(selectors.root()).toHaveValue('');
  });

  it('Should update variable value from string', async () => {
    render(
      getComponent({
        variable: defaultVariable as any,
        persistent: true,
      })
    );

    expect(selectors.root()).toBeVisible();
    expect(selectors.root()).toHaveValue('2025-01-21');

    /**
     * Change Date
     */
    const date = new Date('2024-07-31 12:30:30');
    await act(() => fireEvent.change(selectors.root(), { target: { value: date.toISOString() } }));

    expect(selectVariableValues).toHaveBeenCalledWith({
      values: ['2024-07-31'],
      runtimeVariable: defaultVariable,
      panelEventBus: {},
    });

    expect(persistentStorageMock.remove).toHaveBeenCalled();
  });

  it('Should update variable value', async () => {
    render(
      getComponent({
        variable: defaultVariable as any,
        persistent: true,
      })
    );

    expect(selectors.root()).toBeVisible();
    expect(selectors.root()).toHaveValue('2025-01-21');

    /**
     * Change Date
     */
    const date = '2009-09-09';
    await act(() => fireEvent.change(selectors.root(), { target: { value: date } }));

    expect(selectVariableValues).toHaveBeenCalledWith({
      values: ['2009-09-09'],
      runtimeVariable: defaultVariable,
      panelEventBus: {},
    });

    expect(persistentStorageMock.remove).toHaveBeenCalled();
  });

  it('Should update variable value in local time', async () => {
    render(
      getComponent({
        variable: defaultVariable as any,
        persistent: true,
        isUseLocalTime: true,
      })
    );

    expect(selectors.root()).toBeVisible();
    expect(selectors.root()).toHaveValue('2025-01-21');

    /**
     * Change Date
     */
    const date = '2009-09-09';
    await act(() => fireEvent.change(selectors.root(), { target: { value: date } }));

    const checkDate = new Date(date);
    expect(getDateInLocalTimeFormat).toHaveBeenCalledWith(checkDate);
  });
});
