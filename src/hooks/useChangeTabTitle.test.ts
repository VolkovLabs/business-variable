import { act, renderHook } from '@testing-library/react';

import { VariableType } from '../types';
import { useChangeTabTitle } from './useChangeTabTitle';
import { useRuntimeVariables } from './useRuntimeVariables';

/**
 * Mock use runtime variables
 */
jest.mock('./useRuntimeVariables', () => ({
  useRuntimeVariables: jest.fn(() => ({
    variable: null,
  })),
}));

describe('useChangeTabTitle', () => {
  beforeEach(() => {
    document.title = '';
  });

  it('Should not set document title if mode disabled', async () => {
    const replaceVariables = jest.fn();

    await act(async () =>
      renderHook(() =>
        useChangeTabTitle({
          eventBus: {} as any,
          replaceVariables: replaceVariables,
          browserTabNamePattern: '',
        })
      )
    );

    expect(replaceVariables).not.toHaveBeenCalled();
    expect(document.title).toEqual('');
  });

  it('Should set document title', () => {
    const replaceVariables = jest.fn((str) => {
      if (str.includes('${__dashboard.title}')) {
        return 'Test Dashboard Name';
      }
      return str;
    });

    /**
     * Mock runtime variables
     */
    jest.mocked(useRuntimeVariables).mockReturnValue({
      variable: {
        name: 'device',
        multi: true,
        includeAll: true,
        type: VariableType.CUSTOM,
        current: {
          text: 'device 2',
          value: 'device 2',
        },
      },
    } as any);

    expect(document.title).toEqual('');

    renderHook(() =>
      useChangeTabTitle({
        eventBus: {} as any,
        replaceVariables: replaceVariables,
        browserTabNamePattern: '${device} ${__dashboard.title}',
      })
    );

    expect(replaceVariables).toHaveBeenCalledTimes(1);
    expect(replaceVariables).toHaveBeenCalledWith('${device} ${__dashboard.title}');

    expect(document.title).toEqual('Test Dashboard Name');
  });
});
