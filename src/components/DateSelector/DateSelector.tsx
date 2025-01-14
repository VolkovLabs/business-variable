import { dateTimeFormat, EventBus } from '@grafana/data';
import { DatePickerWithInput } from '@grafana/ui';
import React, { useCallback, useMemo } from 'react';

import { TEST_IDS } from '../../constants';
import { usePersistentStorage } from '../../hooks';
import { TextBoxVariable } from '../../types';
import { selectVariableValues } from '../../utils';

/**
 * Properties
 */
interface Props {
  /**
   * Variable
   *
   * @type {TextBoxVariable}
   */
  variable: TextBoxVariable;

  /**
   * Persistent
   *
   * @type {boolean}
   */
  persistent: boolean;

  /**
   * Panel Event Bus
   *
   * @type {EventBus}
   */
  panelEventBus: EventBus;

  /**
   * Is Transform to UTC or use local
   *
   * @type {boolean}
   */
  isUseLocalTime: boolean;
}

/**
 * Date only selector
 * @param props
 */
export const DateSelector: React.FC<Props> = ({ variable, persistent, panelEventBus, isUseLocalTime }) => {
  /**
   * Persistent storage
   */
  const persistentStorage = usePersistentStorage(variable.name);

  const value = useMemo(() => {
    if (!variable.current.value) {
      return '';
    }
    return variable.current.value as string;
  }, [variable]);

  /**
   * On Change
   */
  const onChange = useCallback(
    (date: string | Date) => {
      /**
       * Clear saved values on override by user
       */
      if (persistent) {
        persistentStorage.remove();
      }
      const currentValue: string = dateTimeFormat(date, {
        timeZone: isUseLocalTime ? '' : 'utc',
        format: 'YYYY-MM-DD',
      });
      selectVariableValues({ values: [currentValue], runtimeVariable: variable, panelEventBus });
    },
    [isUseLocalTime, panelEventBus, persistent, persistentStorage, variable]
  );

  return <DatePickerWithInput onChange={onChange} closeOnSelect value={value} data-testid={TEST_IDS.datePicker.root} />;
};
