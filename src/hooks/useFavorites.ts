import { InterpolateFunction, isDataFrame, LoadingState } from '@grafana/data';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { FavoritesConfig, FavoritesStorage } from '../types';
import { useDatasourceRequest } from './useDatasourceRequest';

/**
 * Favorites type
 */
type FavoritesData = {
  itemIdsMap: Record<string, unknown>;
  itemsMap: Record<string, unknown[]>;
};

/**
 * Favorite Operation Event
 */
interface FavoriteOperationEvent {
  /**
   * Name
   *
   * @type {string}
   */
  name: string;

  /**
   * Value
   *
   * @type {unknown}
   */
  value: unknown;
}

type FavoritesStorageModel = (params: { config: FavoritesConfig; replaceVariables: InterpolateFunction }) => {
  get: () => Promise<FavoritesData>;
  add: (data: FavoritesData, event: FavoriteOperationEvent) => Promise<FavoritesData>;
  remove: (data: FavoritesData, event: FavoriteOperationEvent) => Promise<FavoritesData>;
};

/**
 * Favorites Browser Storage Model
 */
const useFavoritesBrowserStorageModel: FavoritesStorageModel = () => {
  const storageKey = 'volkovlabs.variable.panel.favorites';

  const get = useCallback(async () => {
    const json = window.localStorage.getItem(storageKey);

    return {
      itemsMap: JSON.parse(json || '{}'),
      itemIdsMap: {},
    };
  }, []);

  /**
   * Add
   */
  const add = useCallback(async (data: FavoritesData, item: { value: unknown; name: string }) => {
    const updatedData = {
      ...data.itemsMap,
      [item.name]: data.itemsMap[item.name] ? data.itemsMap[item.name].concat([item.value]) : [item.value],
    };
    window.localStorage.setItem(storageKey, JSON.stringify(updatedData));

    return {
      ...data,
      itemsMap: updatedData,
    };
  }, []);

  /**
   * Remove
   */
  const remove = useCallback(async (data: FavoritesData, item: { value: unknown; name: string }) => {
    const updatedData = {
      ...data.itemsMap,
      [item.name]: data.itemsMap[item.name] ? data.itemsMap[item.name].filter((value) => value !== item.value) : [],
    };
    window.localStorage.setItem(storageKey, JSON.stringify(updatedData));

    return {
      ...data,
      itemsMap: updatedData,
    };
  }, []);

  return useMemo(
    () => ({
      get,
      add,
      remove,
    }),
    [get, add, remove]
  );
};

/**
 * Favorites Data Source Storage Model
 */
const useFavoritesDatasourceStorageModel: FavoritesStorageModel = ({ config, replaceVariables }) => {
  const datasourceRequest = useDatasourceRequest();

  const get = useCallback(async () => {
    const response = await datasourceRequest({
      query: config.getQuery,
      datasource: config.datasource,
      replaceVariables,
      payload: {},
    });

    const data: FavoritesData = {
      itemIdsMap: {},
      itemsMap: {},
    };

    const frame = response.data?.[0];

    if (isDataFrame(frame)) {
      const idField = frame.fields.find((field) => field.name === 'id');
      const variableField = frame.fields.find((field) => field.name === 'variable');
      const valueField = frame.fields.find((field) => field.name === 'value');

      /**
       * Invalid data frame
       */
      if (!idField || !variableField || !valueField) {
        return data;
      }

      /**
       * Convert data frame to favorites data
       */
      for (let rowIndex = 0; rowIndex < frame.length; rowIndex += 1) {
        const id: unknown = idField.values[rowIndex];
        const variable: string = variableField.values[rowIndex];
        const value: string = valueField.values[rowIndex];

        /**
         * No data for variable
         */
        if (!data.itemsMap[variable]) {
          data.itemsMap[variable] = [];
        }

        data.itemsMap[variable].push(value);
        data.itemIdsMap[value] = id;
      }
    }

    return data;
  }, [config.datasource, config.getQuery, datasourceRequest, replaceVariables]);

  /**
   * Add
   */
  const add = useCallback(
    async (data: FavoritesData, item: FavoriteOperationEvent) => {
      const response = await datasourceRequest({
        query: config.addQuery,
        datasource: config.datasource,
        replaceVariables,
        payload: {
          variable: item.name,
          value: item.value,
        },
      });

      /**
       * Query Error
       */
      if (response.state === LoadingState.Error) {
        throw response.errors;
      }

      return get();
    },
    [config.addQuery, config.datasource, datasourceRequest, get, replaceVariables]
  );

  /**
   * Remove
   */
  const remove = useCallback(
    async (data: FavoritesData, item: FavoriteOperationEvent) => {
      const response = await datasourceRequest({
        query: config.deleteQuery,
        datasource: config.datasource,
        replaceVariables,
        payload: {
          id: data.itemIdsMap[item.value as string],
          variable: item.name,
          value: item.value,
        },
      });

      /**
       * Query Error
       */
      if (response.state === LoadingState.Error) {
        throw response.errors;
      }

      return get();
    },
    [config.datasource, config.deleteQuery, datasourceRequest, get, replaceVariables]
  );

  return useMemo(
    () => ({
      get,
      add,
      remove,
    }),
    [get, add, remove]
  );
};

/**
 * Favorites Model
 */
const useFavoritesModel = ({
  config,
  replaceVariables,
}: {
  config: FavoritesConfig;
  replaceVariables: InterpolateFunction;
}) => {
  const browserStorageModel = useFavoritesBrowserStorageModel({ config, replaceVariables });
  const datasourceStorageModel = useFavoritesDatasourceStorageModel({ config, replaceVariables });

  const get = useCallback(async () => {
    switch (config.storage) {
      case FavoritesStorage.BROWSER: {
        return browserStorageModel.get();
      }
      case FavoritesStorage.DATASOURCE: {
        return datasourceStorageModel.get();
      }
      default: {
        return {
          itemsMap: {},
          itemIdsMap: {},
        };
      }
    }
  }, [browserStorageModel, config.storage, datasourceStorageModel]);

  /**
   * Add
   */
  const add = useCallback(
    async (data: FavoritesData, item: FavoriteOperationEvent) => {
      switch (config.storage) {
        case FavoritesStorage.BROWSER: {
          return browserStorageModel.add(data, item);
        }
        case FavoritesStorage.DATASOURCE: {
          return datasourceStorageModel.add(data, item);
        }
        default: {
          return data;
        }
      }
    },
    [browserStorageModel, config.storage, datasourceStorageModel]
  );

  /**
   * Remove
   */
  const remove = useCallback(
    async (data: FavoritesData, item: FavoriteOperationEvent) => {
      switch (config.storage) {
        case FavoritesStorage.BROWSER: {
          return browserStorageModel.remove(data, item);
        }
        case FavoritesStorage.DATASOURCE: {
          return datasourceStorageModel.remove(data, item);
        }
        default: {
          return data;
        }
      }
    },
    [browserStorageModel, config.storage, datasourceStorageModel]
  );

  return useMemo(
    () => ({
      get,
      add,
      remove,
    }),
    [get, add, remove]
  );
};

/**
 * Favorites
 */
export const useFavorites = ({
  config,
  replaceVariables,
}: {
  config: FavoritesConfig;
  replaceVariables: InterpolateFunction;
}) => {
  const [data, setData] = useState<FavoritesData>({
    itemsMap: {},
    itemIdsMap: {},
  });
  const model = useFavoritesModel({ config, replaceVariables });

  /**
   * Get Favorites Data
   */
  const getData = useCallback(async () => {
    const result = await model.get();
    setData(result);
  }, [model]);

  /**
   * Add to favorites
   */
  const add = useCallback(
    async (name: string | undefined, value: string) => {
      if (!name) {
        return;
      }

      const result = await model.add(data, { name, value });
      setData(result);
    },
    [data, model]
  );

  /**
   * Remove from favorites
   */
  const remove = useCallback(
    async (name: string | undefined, value: string) => {
      if (!name) {
        return;
      }

      const result = await model.remove(data, { name, value });
      setData(result);
    },
    [data, model]
  );

  /**
   * Check if already added
   */
  const isAdded = useCallback(
    (name: string | undefined, value: string) => {
      if (!name || !data.itemsMap[name]) {
        return false;
      }

      const items = data.itemsMap[name];
      return items.includes(value);
    },
    [data]
  );

  /**
   * Load Initial Data
   */
  useEffect(() => {
    getData();
  }, [getData]);

  return useMemo(
    () => ({
      add,
      remove,
      isAdded,
    }),
    [add, isAdded, remove]
  );
};
