import React from 'react';
import { PanelProps } from '@grafana/data';
import { DisplayMode, PanelOptions } from '../../types';
import { ButtonView } from '../ButtonView';
import { MinimizeView } from '../MinimizeView';
import { TableView } from '../TableView';
import { useDashboardRedirect } from '../../hooks';

/**
 * Properties
 */
interface Props extends PanelProps<PanelOptions> {}

/**
 * Panel
 */
export const VariablePanel: React.FC<Props> = ({ options, eventBus, ...restProps }) => {
  /**
   * Dashboard Redirect
   */
  useDashboardRedirect({ eventBus, variableName: options.dashboardVariable });

  /**
   * Minimize View
   */
  if (options.displayMode === DisplayMode.MINIMIZE) {
    return <MinimizeView options={options} eventBus={eventBus} {...restProps} />;
  }

  /**
   * Button View
   */
  if (options.displayMode === DisplayMode.BUTTON) {
    return <ButtonView options={options} eventBus={eventBus} {...restProps} />;
  }

  /**
   * Table View
   */
  return <TableView options={options} eventBus={eventBus} {...restProps} />;
};
