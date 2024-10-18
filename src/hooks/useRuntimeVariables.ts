import { EventBus } from '@grafana/data';
import { getTemplateSrv, RefreshEvent } from '@grafana/runtime';
import { sceneGraph, SceneObject } from '@grafana/scenes';
import { useCallback, useEffect, useState } from 'react';

import { RuntimeVariable } from '../types';
import { getVariablesCompatibility, getVariablesMap } from '../utils';

/**
 * Runtime Variables
 * @param eventBus
 * @param variableName
 */
export const useRuntimeVariables = (eventBus: EventBus, variableName: string) => {
  const [variables, setVariables] = useState<Record<string, RuntimeVariable>>({});
  const [variable, setVariable] = useState<RuntimeVariable>();

  useEffect(() => {
    let variables: Record<string, RuntimeVariable>;
    /**
     * Check scene grafana context
     */
    if (window && window.hasOwnProperty('__grafanaSceneContext')) {
      /**
       * Get scene context
       */
      const sceneContext = window.__grafanaSceneContext;

      /**
       * Get scene Variables
       */
      variables = getVariablesMap(
        getVariablesCompatibility(sceneGraph.getVariables(sceneContext as SceneObject), true)
      );
    } else {
      variables = getVariablesMap(getTemplateSrv().getVariables());
    }
    setVariables(variables);
    /**
     * Update variable on Refresh
     */
    const subscriber = eventBus.getStream(RefreshEvent).subscribe(() => {
      let variables: Record<string, RuntimeVariable>;
      if (window && window.hasOwnProperty('__grafanaSceneContext')) {
        const sceneContext = window.__grafanaSceneContext;
        variables = getVariablesMap(
          getVariablesCompatibility(sceneGraph.getVariables(sceneContext as SceneObject), true)
        );
      } else {
        variables = getVariablesMap(getTemplateSrv().getVariables());
      }
      setVariables(variables);
    });

    return () => {
      subscriber.unsubscribe();
    };
  }, [eventBus]);

  const getVariable = useCallback(
    (variableName: string) => {
      return variables[variableName] || undefined;
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
