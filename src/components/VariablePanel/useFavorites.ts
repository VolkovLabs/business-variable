import { useState, useCallback, useEffect, useMemo } from 'react';

type Favorites = Record<string, string[]>;

/**
 * Favorites Model
 */
const useFavoritesModel = () => {
  const get = useCallback(async () => {
    const json = window.localStorage.getItem('favorites');
    return JSON.parse(json || '{}');
  }, []);

  const update = useCallback(async (data: Favorites) => {
    window.localStorage.setItem('favorites', JSON.stringify(data));
    return data;
  }, []);

  return useMemo(
    () => ({
      get,
      update,
    }),
    [get, update]
  );
};

/**
 * Favorites
 */
export const useFavorites = () => {
  const [data, setData] = useState<Favorites>({});
  const model = useFavoritesModel();

  /**
   * Get Favorties Data
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

      const result = await model.update({
        ...data,
        [name]: data[name] ? data[name].concat([value]) : [value],
      });
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

      const result = await model.update({
        ...data,
        [name]: data[name] ? data[name].filter((item) => item !== value) : [],
      });
      setData(result);
    },
    [data, model]
  );

  const isAdded = useCallback(
    (name: string | undefined, value: string) => {
      if (!name || !data[name]) {
        return false;
      }

      const items = data[name];

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
