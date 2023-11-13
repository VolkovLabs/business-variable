import { useEffect } from 'react';
import { EventBus } from '@grafana/data';
import { locationService } from '@grafana/runtime';
import { useRuntimeVariables } from './useRuntimeVariables';

/**
 * Use Dashboard Redirect
 */
export const useDashboardRedirect = ({ eventBus, variableName }: { eventBus: EventBus; variableName: string }) => {
  const { variable } = useRuntimeVariables(eventBus, variableName);

  /**
   * Update dashboard url
   */
  useEffect(() => {
    if (variable?.current?.value) {
      const location = locationService.getLocation();
      locationService.replace(`/d/${variable.current.value}${location.search}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variable?.current?.value]);
};
