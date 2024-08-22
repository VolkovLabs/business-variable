import { PanelModel } from '@grafana/data';
import semver from 'semver';

import { DisplayMode, FavoritesStorage, PanelOptions } from './types';

/**
 * Outdated Panel Options
 */
interface OutdatedPanelOptions extends Omit<PanelOptions, 'favorites'> {
  /**
   * Favorites
   *
   * Changed since v3.3.0
   */
  favorites: boolean;
}

/**
 * Get Migrated Options
 * @param panel
 */
export const getMigratedOptions = (panel: PanelModel<OutdatedPanelOptions & PanelOptions>): PanelOptions => {
  const { ...normalizedOptions } = panel.options as never as PanelOptions;

  /**
   * Enable label for minimize view
   */
  if (panel.options.displayMode === DisplayMode.MINIMIZE && panel.options.showLabel === undefined) {
    normalizedOptions.showLabel = true;
  }

  /**
   * Normalize Favorites
   */
  if (typeof panel.options.favorites !== 'object') {
    normalizedOptions.favorites = {
      enabled: panel.options.favorites,
      storage: FavoritesStorage.BROWSER,
      datasource: '',
      getQuery: {},
      addQuery: {},
      deleteQuery: {},
    };
  }

  /**
   * Normalize favorites before 3.4.0
   */

  if (panel.pluginVersion && semver.lt(panel.pluginVersion, '3.4.0')) {
    const json = window.localStorage.getItem('favorites');
    if (json) {
      window.localStorage.setItem('volkovlabs.variable.panel.favorites', json);
    }
  }

  return normalizedOptions;
};
