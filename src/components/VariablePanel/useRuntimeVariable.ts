import { useState, useEffect } from 'react';
import { TypedVariableModel, EventBus } from '@grafana/data';
import { getTemplateSrv, RefreshEvent } from '@grafana/runtime';
import { RuntimeVariable } from '../../types';

/**
 * Get Runtime Variable
 * @param variables
 * @param variableName
 */
const getRuntimeVariable = (variables: TypedVariableModel[], variableName: string) => {
  return variables.find((dv) => variableName === dv.name) as RuntimeVariable | undefined;
};

/**
 * Use Runtime Variable
 * @param variableName
 * @param eventBus
 */
export const useRuntimeVariable = (variableName: string, eventBus: EventBus) => {
  const [variable, setVariable] = useState<RuntimeVariable>();

  useEffect(() => {
    setVariable(getRuntimeVariable(getTemplateSrv().getVariables(), variableName));

    /**
     * Update variable on Refresh
     */
    const subscriber = eventBus.getStream(RefreshEvent).subscribe(() => {
      setVariable(getRuntimeVariable(getTemplateSrv().getVariables(), variableName));
    });

    return () => {
      subscriber.unsubscribe();
    };
  }, [eventBus, variableName]);

  return variable;
};
