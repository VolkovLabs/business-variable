import React from 'react';
import { EventBus } from '@grafana/data';
import { Alert, useTheme2 } from '@grafana/ui';
import { TestIds } from '../../constants';
import { MinimizeViewOptions, VariableType } from '../../types';
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

  /**
   * Width
   */
  width: number;
}

/**
 * Minimize View
 */
export const MinimizeView: React.FC<Props> = ({ options: { variable: variableName } = {}, eventBus, width }) => {
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
      <Alert severity="info" title="Variable" data-testid={TestIds.minimizeView.noVariableMessage}>
        Variable is not selected.
      </Alert>
    );
  }

  return (
    <div className={styles.root} data-testid={TestIds.minimizeView.root} style={{ maxWidth: width }}>
      {(variable.type === VariableType.QUERY || variable.type === VariableType.CUSTOM) && (
        <OptionsVariable variable={variable} width={width - 16} />
      )}
    </div>
  );
};
