import { EventBusSrv, PanelProps } from '@grafana/data';
import React, { useRef } from 'react';

import { useChangeTabTitle, useDashboardRedirect, usePersistentValues, useResetVariable } from '../../hooks';
import { DisplayMode, PanelOptions } from '../../types';
import { ButtonView } from '../ButtonView';
import { MinimizeView } from '../MinimizeView';
import { SliderView } from '../SliderView';
import { TableView } from '../TableView';

/**
 * Properties
 */
type Props = PanelProps<PanelOptions>;

/**
 * Panel
 */
export const VariablePanel: React.FC<Props> = ({ options, eventBus, replaceVariables, ...restProps }) => {
  /**
   * Panel scoped event bus
   */
  const panelEventBus = useRef(new EventBusSrv());

  /**
   * Dashboard Redirect
   */
  useDashboardRedirect({ eventBus, variableName: options.dashboardVariable });

  /**
   * Advanced behavior. Change Browser tab name
   */
  useChangeTabTitle({
    eventBus,
    replaceVariables,
    browserTabNamePattern: options.browserTabNamePattern,
  });

  /**
   * Persistent Values
   */
  usePersistentValues({
    eventBus,
    variableName: options.variable,
    enabled: options.persistent,
    panelEventBus: panelEventBus.current,
  });

  /**
   * Reset variable
   */
  useResetVariable({ eventBus, panelEventBus: panelEventBus.current, variableName: options.resetVariable });

  /**
   * Minimize View
   */
  if (options.displayMode === DisplayMode.MINIMIZE) {
    return <MinimizeView options={options} eventBus={eventBus} panelEventBus={panelEventBus.current} {...restProps} />;
  }

  /**
   * Button View
   */
  if (options.displayMode === DisplayMode.BUTTON) {
    return <ButtonView options={options} eventBus={eventBus} panelEventBus={panelEventBus.current} {...restProps} />;
  }

  /**
   * Slider View
   */
  if (options.displayMode === DisplayMode.SLIDER) {
    return (
      <SliderView
        replaceVariables={replaceVariables}
        options={options}
        eventBus={eventBus}
        panelEventBus={panelEventBus.current}
        {...restProps}
      />
    );
  }

  /**
   * Table View
   */
  return (
    <TableView
      replaceVariables={replaceVariables}
      options={options}
      eventBus={eventBus}
      panelEventBus={panelEventBus.current}
      {...restProps}
    />
  );
};
