import { useMemo } from 'react';

/**
 * Use Persistent Storage
 */
export const usePersistentStorage = (name: string) => {
  const key = `var-${name}`;

  return useMemo(
    () => ({
      save: (value: string[]) => {
        sessionStorage.setItem(key, JSON.stringify(value));
      },
      get: (): string[] => {
        const json = sessionStorage.getItem(key);
        return json ? JSON.parse(json) : [];
      },
      remove: () => sessionStorage.removeItem(key),
    }),
    [key]
  );
};
