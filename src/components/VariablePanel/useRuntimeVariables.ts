import { useState, useEffect, useCallback } from 'react';
import { EventBus } from '@grafana/data';
import { getTemplateSrv, RefreshEvent } from '@grafana/runtime';
import { RuntimeVariable } from '../../types';

/**
 * Use Runtime Variables
 * @param eventBus
 * @param variableName
 */
export const useRuntimeVariables = (eventBus: EventBus, variableName: string) => {
  const [variables, setVariables] = useState<RuntimeVariable[]>();
  const [variable, setVariable] = useState<RuntimeVariable>();

  useEffect(() => {
    setVariables(getTemplateSrv().getVariables() as RuntimeVariable[]);

    /**
     * Update variable on Refresh
     */
    const subscriber = eventBus.getStream(RefreshEvent).subscribe(() => {
      setVariables(getTemplateSrv().getVariables() as RuntimeVariable[]);
    });

    return () => {
      subscriber.unsubscribe();
    };
  }, [eventBus]);

  const getVariable = useCallback(
    (variableName: string) => {
      return variables?.find((dv) => variableName === dv.name) as RuntimeVariable | undefined;
    },
    [variables]
  );

  useEffect(() => {
    setVariable(getVariable(variableName));
  }, [getVariable, variableName]);

  return {
    variable,
    getVariable,
  };
};
