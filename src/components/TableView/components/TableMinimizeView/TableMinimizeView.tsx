import { EventBus } from '@grafana/data';
import { IconButton, useTheme2 } from '@grafana/ui';
import { OptionsVariable } from 'components/OptionsVariable';
import React from 'react';
import { PanelOptions, RuntimeVariable, VariableType } from 'types';

import { TEST_IDS } from '../../../../constants';
import { getStyles } from './TableMinimizeView.styles';

interface MinimizeViewProps {
  /**
   * Panel Event Bus
   */
  panelEventBus: EventBus;

  /**
   * Open drawer
   */
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;

  /**
   * Panel Options
   */
  options: PanelOptions;

  /**
   * Panel Options
   */
  runtimeVariable: RuntimeVariable | undefined;
}

export const TableMinimizeView = ({ runtimeVariable, options, setIsDrawerOpen, panelEventBus }: MinimizeViewProps) => {
  /**
   * Styles and Theme
   */
  const theme = useTheme2();
  const styles = getStyles(theme);

  return (
    !!runtimeVariable &&
    (runtimeVariable.type === VariableType.QUERY || runtimeVariable.type === VariableType.CUSTOM) && (
      <div className={styles.minimizeTableView}>
        {!options.isMinimizeViewShowCustomIcon && (
          <IconButton
            className={styles.openDrawerButton}
            name={options.minimizeViewNativeIcon}
            aria-label="Open tree view"
            onClick={() => setIsDrawerOpen(true)}
            size="xl"
            data-testid={TEST_IDS.tableMinimizeView.buttonOpenDrawer}
          />
        )}

        {options.isMinimizeViewShowCustomIcon &&
          options.minimizeViewCustomIcon &&
          !!options.minimizeViewCustomIcon.length && (
            <img
              src={options.minimizeViewCustomIcon}
              alt="Open tree view"
              className={styles.openDrawerButtonCustomIcon}
              onClick={() => setIsDrawerOpen(true)}
              data-testid={TEST_IDS.tableMinimizeView.buttonOpenDrawerCustomIcon}
            />
          )}

        <OptionsVariable
          variable={runtimeVariable}
          emptyValue={false}
          persistent={false}
          customValue={false}
          panelEventBus={panelEventBus}
          maxVisibleValues={2}
        />
      </div>
    )
  );
};
