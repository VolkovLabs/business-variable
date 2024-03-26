import { act, renderHook } from '@testing-library/react';

import { useLocalStorage } from './useLocalStorage';
import { useSavedState } from './useSavedState';

/**
 * Mock hook
 */
jest.mock('./useLocalStorage', () => ({
  useLocalStorage: jest.fn(),
}));

describe('Use Saved State', () => {
  it('Should get initial value from model', async () => {
    jest.mocked(useLocalStorage).mockImplementation(() => ({
      get: jest.fn(() => Promise.resolve(111)),
      update: jest.fn(),
    }));

    const { result } = await act(async () => renderHook(() => useSavedState({ key: 'abc', initialValue: 123 })));

    expect(result.current[0]).toEqual(111);
  });

  it('Should merge initial value if object', async () => {
    const getValue = jest.fn(() =>
      Promise.resolve({
        a: 'saved',
      })
    );
    jest.mocked(useLocalStorage).mockImplementation(() => ({
      get: getValue,
      update: jest.fn(),
    }));

    const { result } = await act(async () =>
      renderHook(() =>
        useSavedState({
          key: 'abc',
          initialValue: {
            a: 'initial',
            b: 'initial',
          },
          version: 0,
          getStateForSave: ({ a }) => ({ a }),
        })
      )
    );

    expect(result.current[0]).toEqual({
      a: 'saved',
      b: 'initial',
    });
  });

  it('Should save value in model', async () => {
    const update = jest.fn();
    jest.mocked(useLocalStorage).mockImplementation(() => ({
      get: jest.fn(() => Promise.resolve(111)),
      update,
    }));

    const { result } = await act(async () => renderHook(() => useSavedState({ key: 'abc', initialValue: 123 })));

    await act(async () => result.current[1](123));

    expect(update).toHaveBeenCalledWith(123);
  });

  it('Should save value by function', async () => {
    const update = jest.fn();
    jest.mocked(useLocalStorage).mockImplementation(() => ({
      get: jest.fn(() => Promise.resolve(null)),
      update,
    }));

    const { result } = await act(async () =>
      renderHook(() =>
        useSavedState({
          key: 'abc',
          initialValue: {
            a: 'hello',
            b: 'hello',
          },
        })
      )
    );

    await act(async () =>
      result.current[1]((value) => ({
        ...value,
        b: 'bye',
      }))
    );

    expect(update).toHaveBeenCalledWith({
      a: 'hello',
      b: 'bye',
    });
  });
});
