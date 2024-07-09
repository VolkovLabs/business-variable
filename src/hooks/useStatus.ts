import { FieldType, PanelData } from '@grafana/data';
import { useCallback, useMemo } from 'react';

import { Status, StatusStyleMode, StatusStyleOptions } from '../types';
import { getActiveThresholdStyle } from '../utils';

/**
 * Use Status
 */
export const useStatus = ({ data, name, status }: { data: PanelData; name?: string; status?: string }) => {
  /**
   * Variable values from data source
   */
  const namesArray = useMemo(
    () =>
      data.series
        .map((series) =>
          series.fields.find((field) => field.type === FieldType.string && (!name || field.name === name))
        )
        .find((field) => field?.values)?.values,
    [data.series, name]
  );

  /**
   * Status values from data source
   */
  const statusArray = useMemo(
    () =>
      data.series
        .map((series) =>
          series.fields.find((field) => field.type === FieldType.number && (!status || field.name === status))
        )
        .find((field) => field?.values),
    [data.series, status]
  );

  return useCallback(
    (value: unknown): Status => {
      const index = namesArray?.findIndex((name) => name === value);

      const exist = index !== undefined && index >= 0;

      if (exist) {
        const lastValue = statusArray?.values[index];
        const displayValue = statusArray?.display?.(lastValue);

        if (lastValue === undefined || displayValue === undefined) {
          return {
            exist: false,
          };
        }

        let image;

        /**
         * Find image for value
         */
        if (statusArray?.config.custom?.thresholdsStyle?.mode === StatusStyleMode.IMAGE) {
          const { thresholds } = statusArray?.config.custom?.thresholdsStyle as StatusStyleOptions;

          /**
           * Find active threshold
           */
          const activeThreshold = getActiveThresholdStyle(lastValue, thresholds);

          /**
           * Set image url
           */
          image = activeThreshold?.image;
        }

        return {
          exist,
          value: lastValue,
          color: displayValue.color || '',
          mode: statusArray?.config.custom?.thresholdsStyle?.mode || StatusStyleMode.COLOR,
          image,
        };
      }

      return {
        exist,
      };
    },
    [namesArray, statusArray]
  );
};
