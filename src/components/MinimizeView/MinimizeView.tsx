import React from 'react';
import { EventBus } from '@grafana/data';
import { Alert, useTheme2 } from '@grafana/ui';
import { MinimizeViewOptions } from '../../types';
import { useRuntimeVariables } from '../../hooks';
import { OptionsVariable } from '../OptionsVariable';
import { Styles } from './styles';

/**
 * Properties
 */
interface Props {
  /**
   * Options
   */
  options?: MinimizeViewOptions;

  /**
   * Event Bus
   */
  eventBus: EventBus;
}

/**
 * Minimize View
 */
export const MinimizeView: React.FC<Props> = ({ options: { variable: variableName } = {}, eventBus }) => {
  /**
   * Styles and Theme
   */
  const theme = useTheme2();
  const styles = Styles(theme);

  /**
   * Runtime Variables
   */
  const { variable } = useRuntimeVariables(eventBus, variableName || '');

  /**
   * No variable selected
   */
  if (!variable) {
    return (
      <Alert severity="info" title="Variable">
        Variable is not selected.
      </Alert>
    );
  }

  return (
    <div className={styles.root}>
      {(variable.type === 'query' || variable.type === 'custom') && <OptionsVariable variable={variable} />}
    </div>
  );
};
