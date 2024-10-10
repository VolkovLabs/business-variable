import { EventBus } from '@grafana/data';
import { getTemplateSrv, RefreshEvent } from '@grafana/runtime';
import { useCallback, useEffect, useState } from 'react';

import { RuntimeVariable } from '../types';
import { getVariablesMap } from '../utils';

/**
 * Runtime Variables
 * @param eventBus
 * @param variableName
 */
export const useRuntimeVariables = (eventBus: EventBus, variableName: string) => {
  const [variables, setVariables] = useState<Record<string, RuntimeVariable>>({});
  const [variable, setVariable] = useState<RuntimeVariable>();
  useEffect(() => {
    setVariables(getVariablesMap(getTemplateSrv().getVariables()));

    /**
     * Update variable on Refresh
     */
    const subscriber = eventBus.getStream(RefreshEvent).subscribe(() => {
      setVariables(getVariablesMap(getTemplateSrv().getVariables()));
    });

    return () => {
      subscriber.unsubscribe();
    };
  }, [eventBus]);

  const getVariable = useCallback(
    (variableName: string) => {
      const currentVariable = variables[variableName] || undefined;
      // if (currentVariable && isVariableWithOptions(currentVariable) && currentVariable.includeAll) {
      //   const hasVariableAllOption = currentVariable?.options.some((option) => option.value === ALL_VALUE_PARAMETER);
      //   if (!hasVariableAllOption) {
      //     return {
      //       ...currentVariable,
      //       options: [
      //         {
      //           text: ALL_VALUE,
      //           value: ALL_VALUE_PARAMETER,
      //           selected: Array.isArray(currentVariable?.current.value)
      //             ? currentVariable?.current.value.includes(ALL_VALUE_PARAMETER)
      //             : currentVariable?.current.value === ALL_VALUE_PARAMETER,
      //         },
      //         ...currentVariable.options,
      //       ],
      //     };
      //   }
      // }
      return currentVariable;
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
