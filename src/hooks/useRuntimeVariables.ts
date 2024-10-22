import { EventBus } from '@grafana/data';
import { useDashboardVariables } from '@volkovlabs/components';

import { SCENE_VARIABLES_REFRESH_COUNT, SCENE_VARIABLES_REFRESH_TIMEOUT } from '../constants';
import { RuntimeVariable } from '../types';
import { getVariablesMap } from '../utils';

/**
 * Runtime Variables
 * @param eventBus
 * @param variableName
 */
export const useRuntimeVariables = (eventBus: EventBus, variableName: string) => {
  const { variable, getVariable } = useDashboardVariables<RuntimeVariable, Record<string, RuntimeVariable>>({
    eventBus,
    variableName,
    toState: getVariablesMap,
    getOne: (variablesMap, variableName) => variablesMap[variableName],
    initial: {},
    refreshCheckCount: SCENE_VARIABLES_REFRESH_COUNT,
    refreshCheckInterval: SCENE_VARIABLES_REFRESH_TIMEOUT,
  });

  return {
    variable,
    getVariable,
  };
};
