import { EventBus, InterpolateFunction } from '@grafana/data';
import { useEffect, useState } from 'react';

import { VARIABLE_REGEX } from '../constants';
import { useRuntimeVariables } from './useRuntimeVariables';

/**
 * useChangeTabTitle hook
 */
export const useChangeTabTitle = ({
  eventBus,
  replaceVariables,
  browserTabNamePattern,
}: {
  eventBus: EventBus;
  replaceVariables: InterpolateFunction;
  browserTabNamePattern: string;
}) => {
  /**
   * State
   */
  const [currentVariable, setCurrentVariable] = useState('');

  /**
   * Dashboard variable
   */
  const { variable } = useRuntimeVariables(eventBus, currentVariable);

  /**
   * Define variable
   * Use variable instead subscribe to refresh event to make process seamless for scenes and non-scenes variables
   */
  useEffect(() => {
    /**
     * Define variable from pattern string
     */
    const matches = [...browserTabNamePattern.matchAll(VARIABLE_REGEX)]
      .map((match) => {
        /**
         * Return name inside ${}
         */
        return match[1];
      })
      /**
       * Remove dashboard variables
       */
      .filter((variable) => !variable.startsWith('__'));

    setCurrentVariable(matches[0]);
  }, [browserTabNamePattern, setCurrentVariable]);

  /**
   * Update tab name on variable change event
   */
  useEffect(() => {
    if (variable) {
      document.title = replaceVariables(browserTabNamePattern).replace(/[{}]/g, '');
    }
  }, [browserTabNamePattern, replaceVariables, variable]);
};
