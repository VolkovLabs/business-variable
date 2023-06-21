import { useState, useEffect } from 'react';
import { TypedVariableModel } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import { RuntimeVariable } from '../../types';

/**
 * Optimized variable search
 * @param variables
 * @param variableName
 * @param previousFoundIndex
 */
const getRuntimeVariable = (variables: TypedVariableModel[], variableName: string, previousFoundIndex: number) => {
  /**
   * For better performance use index if previously was found
   */
  if (previousFoundIndex >= 0) {
    const runtimeVariable = variables[previousFoundIndex] as RuntimeVariable | undefined;

    /**
     * Verify name
     */
    if (runtimeVariable?.name === variableName) {
      return {
        index: previousFoundIndex,
        item: runtimeVariable,
      };
    }
  }

  /**
   * Find new index if no index or variable with new index
   */
  const index = variables.findIndex((dv) => variableName === dv.name);

  return {
    index,
    item: variables[index] as RuntimeVariable | undefined,
  };
};

export const useRuntimeVariable = (variableName: string) => {
  const [variable, setVariable] = useState<RuntimeVariable>();

  /**
   * Check variable updates on each frame
   */
  useEffect(() => {
    /**
     * Found index
     */
    let foundIndex = -1;

    /**
     * Variable Checker Id
     */
    let variableCheckerId: number;

    const updateVariable = () => {
      const variables = getTemplateSrv().getVariables();
      const { index, item } = getRuntimeVariable(variables, variableName, foundIndex);

      /**
       * Update Found Index
       */
      foundIndex = index;

      if (variable !== item) {
        /**
         * Update variable if changed
         */
        setVariable(item);
      }

      /**
       * Run new checker on next frame
       */
      variableCheckerId = window.requestAnimationFrame(updateVariable);
    };

    /**
     * Run checker
     */
    variableCheckerId = window.requestAnimationFrame(updateVariable);

    return () => {
      window.cancelAnimationFrame(variableCheckerId);
    };
  }, [variable, variableName]);

  return variable;
};
