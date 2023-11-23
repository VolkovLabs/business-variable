import { toDataFrame } from '@grafana/data';
import { renderHook } from '@testing-library/react';

import { useStatus } from './useStatus';

describe('Use Status', () => {
  const statusDataFrame = toDataFrame({
    fields: [
      {
        name: 'name',
        values: ['device1', 'device2', 'deviceWithoutLastValue'],
      },
      {
        name: 'last',
        values: [70, 81],
        display: (value: number) => ({ color: value > 80 ? 'red' : 'green' }),
      },
    ],
  });

  it('Should return status', () => {
    const { result } = renderHook(() =>
      useStatus({
        data: {
          series: [statusDataFrame],
        } as any,
        name: 'name',
        status: 'last',
      })
    );

    expect(result.current('device1')).toEqual({
      exist: true,
      value: 70,
      color: 'green',
    });
  });

  it('Should return empty status', () => {
    const { result } = renderHook(() =>
      useStatus({
        data: {
          series: [statusDataFrame],
        } as any,
        name: 'name',
        status: 'last',
      })
    );

    expect(result.current('hello')).toEqual({
      exist: false,
    });
  });

  it('Should use fallbacks if no options ', () => {
    const { result } = renderHook(() =>
      useStatus({
        data: {
          series: [statusDataFrame],
        } as any,
      })
    );

    expect(result.current('device1')).toEqual({
      exist: true,
      value: 70,
      color: 'green',
    });
  });

  it('Should return empty status if no value found ', () => {
    const { result } = renderHook(() =>
      useStatus({
        data: {
          series: [statusDataFrame],
        } as any,
        name: 'name',
        status: 'last',
      })
    );

    expect(result.current('deviceWithoutLastValue')).toEqual({
      exist: false,
    });
  });

  it('Should return empty color', () => {
    const { result } = renderHook(() =>
      useStatus({
        data: {
          series: [
            toDataFrame({
              fields: [
                {
                  name: 'name',
                  values: ['device1', 'device2'],
                },
                {
                  name: 'last',
                  values: [70, 81],
                  display: () => ({}),
                },
              ],
            }),
          ],
        } as any,
        name: 'name',
        status: 'last',
      })
    );

    expect(result.current('device1')).toEqual({
      exist: true,
      value: 70,
      color: '',
    });
  });
});
