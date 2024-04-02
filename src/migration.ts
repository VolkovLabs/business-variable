import { PanelModel } from '@grafana/data';

import { DisplayMode, PanelOptions } from './types';

/**
 * Outdated Panel Options
 */
interface OutdatedPanelOptions extends PanelOptions {}

/**
 * Get Migrated Options
 * @param panel
 */
export const getMigratedOptions = (panel: PanelModel<OutdatedPanelOptions>): PanelOptions => {
  const { ...options } = panel.options;

  /**
   * Enable label for minimize view
   */
  if (options.displayMode === DisplayMode.MINIMIZE && options.showLabel === undefined) {
    options.showLabel = true;
  }

  return options as PanelOptions;
};
