import { LoadingState, toDataFrame } from '@grafana/data';
import { act, renderHook, RenderHookResult, waitFor } from '@testing-library/react';

import { FavoritesStorage } from '../types';
import { createFavoritesConfig } from '../utils';
import { useDatasourceRequest } from './useDatasourceRequest';
import { useFavorites } from './useFavorites';

/**
 * Local Storage
 */
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};

/**
 * Mock useDatasourceRequest
 */
jest.mock('./useDatasourceRequest', () => ({
  useDatasourceRequest: jest.fn(),
}));

/**
 * Favorites
 */
describe('Use Favorites', () => {
  /**
   * Render Hook without errors
   * @param hook
   */
  const renderHookWithoutErrors = async <T>(hook: () => T): Promise<RenderHookResult<T, null>> => {
    const result = await act(async () => renderHook(() => hook()));

    await new Promise((resolve) => setTimeout(resolve));
    return result;
  };

  /**
   * Replace Variables
   */
  const replaceVariables = jest.fn();

  describe('browserStorage', () => {
    /**
     * Set Mock
     */
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    /**
     * Config
     */
    const config = createFavoritesConfig({
      enabled: true,
      storage: FavoritesStorage.BROWSER,
    });

    beforeEach(() => {
      jest.mocked(window.localStorage.getItem).mockClear();
    });

    it('Should load initial data', async () => {
      jest.mocked(window.localStorage.getItem).mockImplementation(() =>
        JSON.stringify({
          device: ['device1', 'device2'],
        })
      );

      const { result } = await renderHookWithoutErrors(() =>
        useFavorites({
          config,
          replaceVariables,
        })
      );

      await waitFor(() => expect(result.current.isAdded('device', 'device1')).toBeTruthy());
      await waitFor(() => expect(result.current.isAdded('country', 'USA')).not.toBeTruthy());
      await waitFor(() => expect(result.current.isAdded(undefined, 'USA')).not.toBeTruthy());
    });

    it('Should not load initial data if disabled', async () => {
      const config = createFavoritesConfig({
        enabled: false,
      });

      await renderHookWithoutErrors(() =>
        useFavorites({
          config,
          replaceVariables,
        })
      );

      expect(localStorage.getItem).not.toHaveBeenCalled();
    });

    it('Should work without initial data', async () => {
      jest.mocked(window.localStorage.getItem).mockImplementation(() => null);

      const { result } = await renderHookWithoutErrors(() =>
        useFavorites({
          config,
          replaceVariables,
        })
      );

      await waitFor(() => expect(result.current.isAdded('device', 'device1')).not.toBeTruthy());
    });

    it('Should add to favorites', async () => {
      jest.mocked(window.localStorage.getItem).mockImplementation(() =>
        JSON.stringify({
          device: ['device1'],
        })
      );

      const { result } = await renderHookWithoutErrors(() =>
        useFavorites({
          config,
          replaceVariables,
        })
      );

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

      const { result } = await renderHookWithoutErrors(() =>
        useFavorites({
          config,
          replaceVariables,
        })
      );

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

  describe('datasourceStorage', () => {
    /**
     * Config
     */
    const config = createFavoritesConfig({
      enabled: true,
      storage: FavoritesStorage.DATASOURCE,
      datasource: 'testDatasource',
      getQuery: { name: 'get' },
      addQuery: { name: 'add' },
      deleteQuery: { name: 'delete' },
    });

    const datasourceRequestMock = jest.fn();

    beforeEach(() => {
      jest.mocked(useDatasourceRequest).mockReturnValue(datasourceRequestMock);
      datasourceRequestMock.mockReset();
    });

    it('Should load initial data', async () => {
      datasourceRequestMock.mockResolvedValue({
        data: [
          toDataFrame({
            fields: [
              {
                name: 'id',
                values: [1, 2],
              },
              {
                name: 'variable',
                values: ['device', 'device'],
              },
              {
                name: 'value',
                values: ['a', 'b'],
              },
            ],
          }),
        ],
      });

      const { result } = await renderHookWithoutErrors(() =>
        useFavorites({
          config,
          replaceVariables,
        })
      );

      expect(datasourceRequestMock).toHaveBeenCalledWith({
        query: config.getQuery,
        payload: {},
        datasource: config.datasource,
        replaceVariables,
      });

      await waitFor(() => expect(result.current.isAdded('device', 'a')).toBeTruthy());
      await waitFor(() => expect(result.current.isAdded('device', 'b')).toBeTruthy());
      await waitFor(() => expect(result.current.isAdded('device123', 'b')).not.toBeTruthy());
    });

    it('Should work if invalid initial data', async () => {
      datasourceRequestMock.mockResolvedValue({
        data: [
          toDataFrame({
            fields: [
              {
                name: 'id',
                values: [1, 2],
              },
            ],
          }),
        ],
      });

      const { result } = await renderHookWithoutErrors(() =>
        useFavorites({
          config,
          replaceVariables,
        })
      );

      expect(datasourceRequestMock).toHaveBeenCalledWith({
        query: config.getQuery,
        payload: {},
        datasource: config.datasource,
        replaceVariables,
      });

      await waitFor(() => expect(result.current.isAdded('device123', 'b')).not.toBeTruthy());
    });

    it('Should not load initial data if disabled', async () => {
      await renderHookWithoutErrors(() =>
        useFavorites({
          config: {
            ...config,
            enabled: false,
          },
          replaceVariables,
        })
      );

      expect(datasourceRequestMock).not.toHaveBeenCalled();
    });

    it('Should add to favorites', async () => {
      datasourceRequestMock.mockResolvedValue({
        data: [
          toDataFrame({
            fields: [
              {
                name: 'id',
                values: [1, 2],
              },
              {
                name: 'variable',
                values: ['device', 'device'],
              },
              {
                name: 'value',
                values: ['a', 'b'],
              },
            ],
          }),
        ],
      });

      const { result } = await renderHookWithoutErrors(() =>
        useFavorites({
          config,
          replaceVariables,
        })
      );

      /**
       * Add item
       */
      await act(async () => result.current.add('device', 'bb'));

      expect(datasourceRequestMock).toHaveBeenCalledWith({
        query: config.addQuery,
        datasource: config.datasource,
        payload: {
          variable: 'device',
          value: 'bb',
        },
        replaceVariables,
      });

      /**
       * Set query error
       */
      datasourceRequestMock.mockResolvedValue({
        state: LoadingState.Error,
      });

      /**
       * Trigger query error
       */
      const response = await act(async () => result.current.add('device', 'bb').catch(() => 'error'));

      expect(response).toEqual('error');
    });

    it('Should remove from favorites', async () => {
      datasourceRequestMock.mockResolvedValue({
        data: [
          toDataFrame({
            fields: [
              {
                name: 'id',
                values: [1, 2],
              },
              {
                name: 'variable',
                values: ['device', 'device'],
              },
              {
                name: 'value',
                values: ['a', 'b'],
              },
            ],
          }),
        ],
      });

      const { result } = await renderHookWithoutErrors(() =>
        useFavorites({
          config,
          replaceVariables,
        })
      );

      /**
       * Remove item
       */
      await act(async () => result.current.remove('device', 'a'));

      expect(datasourceRequestMock).toHaveBeenCalledWith({
        query: config.deleteQuery,
        datasource: config.datasource,
        payload: {
          id: 1,
          variable: 'device',
          value: 'a',
        },
        replaceVariables,
      });

      /**
       * Set query error
       */
      datasourceRequestMock.mockResolvedValue({
        state: LoadingState.Error,
      });

      /**
       * Trigger query error
       */
      const response = await act(async () => result.current.remove('device', 'bb').catch(() => 'error'));

      expect(response).toEqual('error');
    });
  });

  describe('unknownStorage', () => {
    /**
     * Set Mock
     */
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    /**
     * Config
     */
    const config = createFavoritesConfig({
      enabled: true,
      storage: 'unknown' as never,
    });

    beforeEach(() => {
      jest.mocked(window.localStorage.getItem).mockClear();
    });

    it('Should work', async () => {
      const { result } = await renderHookWithoutErrors(() =>
        useFavorites({
          config,
          replaceVariables,
        })
      );

      await waitFor(() => expect(result.current.isAdded('country', 'USA')).not.toBeTruthy());
    });

    it('Should work if add to favorites', async () => {
      const { result } = await renderHookWithoutErrors(() =>
        useFavorites({
          config,
          replaceVariables,
        })
      );

      await act(async () => result.current.add('device', 'device2'));

      expect(result.current.isAdded('device', 'device2')).not.toBeTruthy();
    });

    it('Should work if remove from favorites', async () => {
      const { result } = await renderHookWithoutErrors(() =>
        useFavorites({
          config,
          replaceVariables,
        })
      );

      await act(async () => result.current.remove('device', 'device1'));

      expect(result.current.isAdded('device', 'device2')).not.toBeTruthy();
    });
  });
});
