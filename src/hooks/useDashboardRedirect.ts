import { useEffect } from 'react';
import { EventBus } from '@grafana/data';
import { locationService } from '@grafana/runtime';
import { useRuntimeVariables } from './useRuntimeVariables';

/**
 * Use Dashboard Redirect
 */
export const useDashboardRedirect = ({ eventBus, variableName }: { eventBus: EventBus; variableName: string }) => {
  /**
   * Dashboard ID Variable
   */
  const { variable } = useRuntimeVariables(eventBus, variableName);

  /**
   * Variable Current
   */
  const current = variable?.current;

  /**
   * Update dashboard url
   */
  useEffect(() => {
    if (current?.value) {
      const location = locationService.getLocation();
      locationService.replace(`/d/${current.value}${location.search}`);
    }
  }, [current?.value]);
};
