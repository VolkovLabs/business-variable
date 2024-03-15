import { useCallback, useMemo } from 'react';

/**
 * Local Storage Model
 */
export const useLocalStorage = (key: string) => {
  const get = useCallback(() => {
    return window.localStorage.getItem(key);
  }, [key]);

  /**
   * Update
   */
  const update = useCallback(
    <T extends string>(data: T) => {
      window.localStorage.setItem(key, data);
      return data;
    },
    [key]
  );

  /**
   * Remove
   */
  const remove = useCallback(() => {
    window.localStorage.removeItem(key);
  }, [key]);

  return useMemo(
    () => ({
      get,
      update,
      remove,
    }),
    [get, update, remove]
  );
};
