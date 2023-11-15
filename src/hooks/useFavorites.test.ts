import { act, renderHook, RenderHookResult, waitFor } from '@testing-library/react';

import { useFavorites } from './useFavorites';

/**
 * Local Storage
 */
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};

/**
 * Favorites
 */
describe('Use Favorites', () => {
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });

  /**
   * Render Hook without errors
   * @param hook
   */
  const renderHookWithoutErrors = async <T>(hook: () => T): Promise<RenderHookResult<T, {}>> => {
    const result = await renderHook(() => hook());

    await new Promise((resolve) => setTimeout(resolve));
    return result;
  };

  it('Should load initial data', async () => {
    jest.mocked(window.localStorage.getItem).mockImplementation(() =>
      JSON.stringify({
        device: ['device1', 'device2'],
      })
    );

    const { result } = await act(() => renderHookWithoutErrors(() => useFavorites()));

    await waitFor(() => expect(result.current.isAdded('device', 'device1')).toBeTruthy());
    await waitFor(() => expect(result.current.isAdded('country', 'USA')).not.toBeTruthy());
    await waitFor(() => expect(result.current.isAdded(undefined, 'USA')).not.toBeTruthy());
  });

  it('Should work without initial data', async () => {
    jest.mocked(window.localStorage.getItem).mockImplementation(() => null);

    const { result } = await act(() => renderHookWithoutErrors(() => useFavorites()));

    await waitFor(() => expect(result.current.isAdded('device', 'device1')).not.toBeTruthy());
  });

  it('Should add to favorites', async () => {
    jest.mocked(window.localStorage.getItem).mockImplementation(() =>
      JSON.stringify({
        device: ['device1'],
      })
    );

    const { result } = await act(() => renderHookWithoutErrors(() => useFavorites()));

    /**
     * Add to already existing list
     */
    result.current.add('device', 'device2');

    await waitFor(() => expect(result.current.isAdded('device', 'device2')).toBeTruthy());

    /**
     * Add to not existing list
     */
    result.current.add('country', 'USA');

    await waitFor(() => expect(result.current.isAdded('country', 'USA')).toBeTruthy());

    /**
     * Add with unspecified name
     */
    result.current.add(undefined, 'USA');

    await waitFor(() => expect(result.current.isAdded(undefined, 'USA')).not.toBeTruthy());
  });

  it('Should remove from favorites', async () => {
    jest.mocked(window.localStorage.getItem).mockImplementation(() =>
      JSON.stringify({
        device: ['device1'],
      })
    );

    const { result } = await act(() => renderHookWithoutErrors(() => useFavorites()));

    /**
     * Remove from already existing list
     */
    result.current.remove('device', 'device1');

    await waitFor(() => expect(result.current.isAdded('device', 'device2')).not.toBeTruthy());

    /**
     * Remove from not existing list
     */
    result.current.remove('country', 'USA');

    await waitFor(() => expect(result.current.isAdded('country', 'USA')).not.toBeTruthy());

    /**
     * Remove with unspecified name
     */
    result.current.remove(undefined, 'USA');

    await waitFor(() => expect(result.current.isAdded(undefined, 'USA')).not.toBeTruthy());
  });
});
