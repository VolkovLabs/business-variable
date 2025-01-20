import { act, fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '../../constants';
import { MinimizeOutputFormat } from '../../types';
import { selectVariableValues } from '../../utils';
import { DateTimeSelector } from './DateTimeSelector';

/**
 * Mock utils
 */
jest.mock('../../utils', () => ({
  selectVariableValues: jest.fn(),
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
type Props = React.ComponentProps<typeof DateTimeSelector>;

/**
 * Date Time Selector
 */
describe('Date Time Selector', () => {
  const defaultVariable = {
    label: 'dateTimeTS',
    current: {
      value: '1717080480000',
    },
  };

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.dateTimePicker);
  const selectors = getSelectors(screen);

  /**
   * Get Tested Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <DateTimeSelector variable={defaultVariable} panelEventBus={{} as any} {...(props as any)} />;
  };

  beforeEach(() => {
    jest.mocked(selectVariableValues).mockClear();
  });

  it('Should apply initial variable value from timestamp', () => {
    render(
      getComponent({
        variable: defaultVariable as any,
        timeZone: 'browser',
      })
    );

    expect(selectors.root()).toBeVisible();
    expect(selectors.root()).toHaveValue('Thu May 30 2024 14:48:00 GMT+0000');
  });

  it('Should apply initial variable value from isoString', () => {
    render(
      getComponent({
        variable: {
          label: 'dateTimeTS',
          current: {
            value: '2024-05-01T14:48:00.000Z',
          },
        } as any,
        timeZone: 'browser',
      })
    );

    expect(selectors.root()).toBeVisible();
    expect(selectors.root()).toHaveValue('Wed May 01 2024 14:48:00 GMT+0000');
  });

  it('Should display invalid date if value not specified', () => {
    render(
      getComponent({
        variable: {
          label: 'dateTimeTS',
          current: {
            value: '',
          },
        } as any,
        timeZone: 'browser',
      })
    );

    expect(selectors.root()).toBeVisible();
    expect(selectors.root()).toHaveValue('Invalid date');
  });

  it('Should update variable with timestamp value', async () => {
    render(
      getComponent({
        variable: defaultVariable as any,
        timeZone: 'browser',
        persistent: true,
        isUseLocalTime: true,
        minimizeOutputFormat: MinimizeOutputFormat.TIMESTAMP,
      })
    );

    expect(selectors.root()).toBeVisible();
    expect(selectors.root()).toHaveValue('Thu May 30 2024 14:48:00 GMT+0000');

    /**
     * Change Date
     */
    const date = new Date('2024-07-31 12:30:30');
    await act(() => fireEvent.change(selectors.root(), { target: { value: date.toISOString() } }));

    expect(selectVariableValues).toHaveBeenCalledWith({
      values: ['1722429030000'],
      runtimeVariable: defaultVariable,
      panelEventBus: {},
    });

    expect(persistentStorageMock.remove).toHaveBeenCalled();
  });

  it('Should update variable with isoString value', async () => {
    render(
      getComponent({
        variable: defaultVariable as any,
        timeZone: 'browser',
        persistent: true,
        isUseLocalTime: true,
        minimizeOutputFormat: MinimizeOutputFormat.DATETIME,
      })
    );

    expect(selectors.root()).toBeVisible();
    expect(selectors.root()).toHaveValue('Thu May 30 2024 14:48:00 GMT+0000');

    /**
     * Change Date
     */
    const date = new Date('2024-07-31 12:30:30');
    await act(() => fireEvent.change(selectors.root(), { target: { value: date.toISOString() } }));

    expect(selectVariableValues).toHaveBeenCalledWith({
      values: ['2024-07-31T12:30:30.000+00:00'],
      runtimeVariable: defaultVariable,
      panelEventBus: {},
    });

    expect(persistentStorageMock.remove).toHaveBeenCalled();
  });
});
