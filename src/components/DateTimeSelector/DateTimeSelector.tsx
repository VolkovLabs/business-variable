import { DateTime, dateTime, EventBus } from '@grafana/data';
import { DateTimePicker } from '@grafana/ui';
import React, { useCallback, useMemo } from 'react';

import { TEST_IDS } from '../../constants';
import { usePersistentStorage } from '../../hooks';
import { DateTimeFormat, TextBoxVariable } from '../../types';
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
   * Time Zone
   *
   * @type {string}
   */
  timeZone: string;

  /**
   * Is Transform to UTC or use local
   *
   * @type {boolean}
   */
  isUseLocalTime: boolean;

  /**
   * Save the result of date time picker
   *
   * @type {DateTimeFormat}
   */
  dateTimeFormat: DateTimeFormat;
}

/**
 * Date Time selector
 * @param props
 */
export const DateTimeSelector: React.FC<Props> = ({
  variable,
  persistent,
  panelEventBus,
  isUseLocalTime,
  dateTimeFormat,
  timeZone,
}) => {
  /**
   * Persistent storage
   */
  const persistentStorage = usePersistentStorage(variable.name);

  const value = useMemo(() => {
    if (!variable.current.value) {
      return '';
    }
    const value = !isNaN(Number(variable.current.value))
      ? Number(variable.current.value)
      : variable.current.value.toString();
    return value;
  }, [variable]);

  /**
   * On Change
   */
  const onChange = useCallback(
    (dateTime?: DateTime) => {
      /**
       * Clear saved values on override by user
       */
      if (dateTime) {
        if (persistent) {
          persistentStorage.remove();
        }

        let value = '';

        if (dateTimeFormat === DateTimeFormat.ISO_STRING) {
          value = dateTime.toISOString(isUseLocalTime);
        } else {
          value = dateTime.valueOf().toString();
        }
        selectVariableValues({ values: [value], runtimeVariable: variable, panelEventBus });
      }
    },
    [dateTimeFormat, isUseLocalTime, panelEventBus, persistent, persistentStorage, variable]
  );

  return (
    <DateTimePicker
      onChange={onChange}
      timeZone={timeZone}
      date={dateTime(value)}
      data-testid={TEST_IDS.dateTimePicker.root}
    />
  );
};
