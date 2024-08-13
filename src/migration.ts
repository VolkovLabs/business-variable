import { PanelModel } from '@grafana/data';

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
export const getMigratedOptions = ({ options }: PanelModel<OutdatedPanelOptions>): PanelOptions => {
  const normalizedOptions = { ...options } as never as PanelOptions;

  /**
   * Enable label for minimize view
   */
  if (options.displayMode === DisplayMode.MINIMIZE && options.showLabel === undefined) {
    normalizedOptions.showLabel = true;
  }

  /**
   * Normalize Favorites
   */
  if (typeof options.favorites !== 'object') {
    normalizedOptions.favorites = {
      enabled: options.favorites,
      storage: FavoritesStorage.BROWSER,
      datasource: '',
      getQuery: {},
      addQuery: {},
      deleteQuery: {},
    };
  }

  return normalizedOptions;
};
