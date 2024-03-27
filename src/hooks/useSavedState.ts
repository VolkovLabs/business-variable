import { merge } from 'lodash';
import { Dispatch, useCallback, useEffect, useRef, useState } from 'react';

import { RecursivePartial } from '../types';
import { useLocalStorage } from './useLocalStorage';

/**
 * Get State For Save
 */
type GetStateForSave<TValue> = (value: TValue) => TValue extends object ? RecursivePartial<TValue> : TValue;

/**
 * Set Value Action
 */
type SetValueAction<TValue> = TValue | ((value: TValue) => TValue);

/**
 * Use Saved State
 */
export const useSavedState = <TValue extends object | string | number | []>({
  key,
  initialValue,
  version = 1,
  getStateForSave = (value) => value as never,
  enabled = true,
}: {
  key: string;
  initialValue: TValue;
  version?: number;
  getStateForSave?: GetStateForSave<TValue>;
  enabled?: boolean;
}): [TValue, Dispatch<SetValueAction<TValue>>, boolean] => {
  /**
   * Value
   */
  const [value, setValue] = useState(initialValue);
  const [loaded, setLoaded] = useState(false);

  /**
   * Get state for save
   */
  const getStateForSaveRef = useRef<GetStateForSave<TValue>>(getStateForSave);

  /**
   * Local Storage Model
   */
  const { get: getValue, update: saveValue } = useLocalStorage(key, version);

  /**
   * Load Initial Value
   */
  useEffect(() => {
    const getSavedValue = async () => {
      const savedValue = await getValue();

      if (savedValue) {
        if (typeof savedValue === 'object') {
          setValue((value) => merge({ ...(value as object) }, savedValue));
        } else {
          setValue(savedValue);
        }
      }
      setLoaded(true);
    };

    if (enabled) {
      getSavedValue();
    }
  }, [enabled, getValue]);

  /**
   * Update Value
   */
  const update = useCallback(
    (updated: SetValueAction<TValue>) => {
      setValue((value) => {
        const newValue = typeof updated === 'function' ? updated(value) : updated;

        if (enabled) {
          saveValue(getStateForSaveRef.current(newValue));
        }
        return newValue;
      });
    },
    [enabled, saveValue]
  );

  return [value, update, loaded];
};
