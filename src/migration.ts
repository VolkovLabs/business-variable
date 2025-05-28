import { DataSourceApi, PanelModel } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import semver from 'semver';

import { FAVORITES_KEY } from './constants';
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
 * Fetch datasources
 */
const fetchData = async () => {
  return await getBackendSrv().get('/api/datasources');
};

/**
 * Normalize Payload Options
 *
 * @param obj
 * @param name
 *
 */
const normalizeDatasourceOptions = (ds: DataSourceApi[], name?: string): string => {
  const currentDs = ds.find((element) => element.name === name);
  return currentDs?.uid || '';
};

/**
 * Get Migrated Options
 * @param panel
 */
export const getMigratedOptions = async (
  panel: PanelModel<OutdatedPanelOptions & PanelOptions>
): Promise<PanelOptions> => {
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
  if (!panel.pluginVersion || semver.lt(panel.pluginVersion, '3.4.0')) {
    const json = window.localStorage.getItem('favorites');
    if (json) {
      window.localStorage.setItem(FAVORITES_KEY, json);
    }
  }

  /**
   * Normalize favorites before 3.7.0
   */
  if (!panel.pluginVersion || (semver.lt(panel.pluginVersion, '3.7.0') && normalizedOptions.favorites.datasource)) {
    const dataSources: DataSourceApi[] = await fetchData();
    normalizedOptions.favorites = {
      ...normalizedOptions.favorites,
      datasource: normalizeDatasourceOptions(dataSources, normalizedOptions.favorites.datasource),
    };
  }

  /**
   * Normalize dashboard tab name properties
   */
  if (!panel.pluginVersion || semver.lt(panel.pluginVersion, '3.7.0')) {
    if (!normalizedOptions.hasOwnProperty('browserTabNamePattern')) {
      normalizedOptions.browserTabNamePattern = '';
    }
  }

  /**
   * Minimize view for table view
   */
  if (normalizedOptions.isMinimizeForTable === undefined) {
    normalizedOptions.isMinimizeForTable = false;
  }

  /**
   * Minimize view for table view
   */
  if (normalizedOptions.selectedValues === undefined) {
    normalizedOptions.selectedValues = {
      showSelected: false,
    };
  }

  return normalizedOptions;
};
