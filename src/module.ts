import { Field, FieldConfigProperty, FieldType, identityOverrideProcessor, PanelPlugin } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';

import {
  DatasourceEditor,
  DatasourcePayloadEditor,
  GroupsEditor,
  StatusStyleEditor,
  VariablePanel,
} from './components';
import {
  ALLOW_CUSTOM_VALUE_OPTIONS,
  ALLOW_EMPTY_VALUE_OPTIONS,
  ALWAYS_VISIBLE_FILTER_OPTIONS,
  AUTO_SCROLL_OPTIONS,
  COLLAPSED_BY_DEFAULT_OPTIONS,
  DISPLAY_MODE_OPTIONS,
  FAVORITES_ENABLED_OPTIONS,
  FAVORITES_STORAGE_OPTIONS,
  FILTER_OPTIONS,
  GROUP_SELECTION_OPTIONS,
  HEADER_OPTIONS,
  PERSISTENT_OPTIONS,
  ROW_COUNT_OPTIONS,
  SELECTED_GROUP_OPTIONS,
  SHOW_LABEL_OPTIONS,
  SHOW_NAME_OPTIONS,
  SHOW_RESET_BUTTON_OPTIONS,
  STATUS_SORT_OPTIONS,
  STICKY_OPTIONS,
  TABS_ORDER_OPTIONS,
} from './constants';
import { getMigratedOptions } from './migration';
import { DisplayMode, FavoritesStorage, PanelOptions, StatusStyleMode } from './types';

/**
 * Panel Plugin
 */
export const plugin = new PanelPlugin<PanelOptions>(VariablePanel)
  .setNoPadding()
  .setMigrationHandler(getMigratedOptions as never)
  .useFieldConfig({
    disableStandardOptions: [
      FieldConfigProperty.Unit,
      FieldConfigProperty.Color,
      FieldConfigProperty.Min,
      FieldConfigProperty.Max,
      FieldConfigProperty.Decimals,
      FieldConfigProperty.DisplayName,
      FieldConfigProperty.NoValue,
      FieldConfigProperty.Links,
      FieldConfigProperty.Mappings,
      'unitScale' as never,
      'fieldMinMax' as never,
    ],
    useCustomConfig: (builder) => {
      builder.addCustomEditor({
        id: 'thresholdsStyle',
        path: 'thresholdsStyle',
        name: 'Status Style',
        description: 'Show Status in Table view',
        category: ['Thresholds'],
        defaultValue: {
          mode: StatusStyleMode.COLOR,
          thresholds: [],
        },
        editor: StatusStyleEditor,
        override: StatusStyleEditor,
        process: identityOverrideProcessor,
        shouldApply: () => true,
      });
    },
  })
  .setPanelOptions((builder) => {
    /**
     * Variables
     */
    const variables = getTemplateSrv().getVariables();
    const variableOptions = variables.map((vr) => ({
      label: vr.name,
      value: vr.name,
    }));

    /**
     * Visibility
     */
    const showForMinimizeView = (config: PanelOptions) => config.displayMode === DisplayMode.MINIMIZE;
    const showForButtonView = (config: PanelOptions) => config.displayMode === DisplayMode.BUTTON;
    const showForTableView = (config: PanelOptions) => config.displayMode === DisplayMode.TABLE;
    const showForSliderView = (config: PanelOptions) => config.displayMode === DisplayMode.SLIDER;
    const isVariableSelected = (config: PanelOptions) => !!config.variable;
    const isFavoritesDatasourceShown = (config: PanelOptions) =>
      showForTableView(config) &&
      config.header &&
      config.favorites.enabled &&
      config.favorites.storage === FavoritesStorage.DATASOURCE;

    /**
     * Common Options
     */
    builder.addRadio({
      path: 'displayMode',
      name: 'Display mode',
      settings: {
        options: DISPLAY_MODE_OPTIONS,
      },
      defaultValue: DisplayMode.TABLE,
    });

    /**
     * Minimize Mode Options
     */
    builder.addSliderInput({
      path: 'padding',
      name: 'Padding',
      defaultValue: 10,
      settings: {
        min: 0,
        max: 20,
      },
      showIf: (config) => showForMinimizeView(config) || showForButtonView(config) || showForSliderView(config),
    });

    /**
     * Values
     */
    builder
      .addRadio({
        path: 'emptyValue',
        name: 'Allow empty value',
        description: 'Supports empty value for multi-choice variable.',
        defaultValue: false,
        settings: {
          options: ALLOW_EMPTY_VALUE_OPTIONS,
        },
        category: ['Values'],
        showIf: (config) => showForMinimizeView(config) || showForButtonView(config),
      })
      .addRadio({
        path: 'persistent',
        name: 'Persistent values',
        description: 'Allow to keep selected values if unavailable.',
        defaultValue: false,
        settings: {
          options: PERSISTENT_OPTIONS,
        },
        category: ['Values'],
        showIf: (config) => showForMinimizeView(config) || showForButtonView(config),
      })
      .addRadio({
        path: 'customValue',
        name: 'Allow custom values',
        description: 'Supports custom values for the variable.',
        defaultValue: false,
        settings: {
          options: ALLOW_CUSTOM_VALUE_OPTIONS,
        },
        category: ['Values'],
        showIf: (config) => showForMinimizeView(config),
      })
      .addNumberInput({
        path: 'maxVisibleValues',
        name: 'Maximum visible values',
        description: 'Supports for multi-choice variable.',
        settings: {
          placeholder: 'auto',
        },
        category: ['Values'],
        showIf: (config) => showForMinimizeView(config),
      });

    /**
     * Label
     */
    builder
      .addRadio({
        path: 'showLabel',
        name: 'Show Label',
        description: 'Display variable name',
        defaultValue: false,
        settings: {
          options: SHOW_LABEL_OPTIONS,
        },
        category: ['Label'],
        showIf: (config) => showForMinimizeView(config) || showForButtonView(config) || showForSliderView(config),
      })
      .addNumberInput({
        path: 'labelWidth',
        name: 'Label Width',
        settings: {
          placeholder: 'auto',
        },
        category: ['Label'],
        showIf: (config) => config.showLabel && (showForMinimizeView(config) || showForSliderView(config)),
      });

    /**
     * Positioning
     */
    builder
      .addRadio({
        path: 'sticky',
        name: 'Sticky position',
        description: 'Variables will follow when scrolling.',
        settings: {
          options: STICKY_OPTIONS,
        },
        defaultValue: false,
        showIf: showForTableView,
      })
      .addRadio({
        path: 'autoScroll',
        name: 'Auto scroll to the selected value',
        settings: {
          options: AUTO_SCROLL_OPTIONS,
        },
        defaultValue: false,
        showIf: showForTableView,
      });

    /**
     * Header
     */
    builder
      .addRadio({
        path: 'header',
        name: 'Header',
        settings: {
          options: HEADER_OPTIONS,
        },
        category: ['Header'],
        defaultValue: true,
        showIf: showForTableView,
      })
      .addRadio({
        path: 'filter',
        name: 'Allow values filtering',
        settings: {
          options: FILTER_OPTIONS,
        },
        defaultValue: false,
        category: ['Header'],
        showIf: (config) => showForTableView(config) && config.header,
      })
      .addRadio({
        path: 'alwaysVisibleFilter',
        name: 'Always visible filter input',
        settings: {
          options: ALWAYS_VISIBLE_FILTER_OPTIONS,
        },
        defaultValue: false,
        category: ['Header'],
        showIf: (config) => showForTableView(config) && config.header && config.filter,
      })
      .addRadio({
        path: 'favorites.enabled',
        name: 'Allow selecting favorites',
        settings: {
          options: FAVORITES_ENABLED_OPTIONS,
        },
        defaultValue: false,
        category: ['Header'],
        showIf: (config) => showForTableView(config) && config.header,
      })
      .addRadio({
        path: 'statusSort',
        name: 'Sort by status',
        settings: {
          options: STATUS_SORT_OPTIONS,
        },
        defaultValue: false,
        category: ['Header'],
        showIf: (config) => showForTableView(config) && config.header,
      })
      .addRadio({
        path: 'showTotal',
        name: 'Display total and selected values count for multi-select variables',
        settings: {
          options: ROW_COUNT_OPTIONS,
        },
        defaultValue: false,
        category: ['Header'],
        showIf: (config) => showForTableView(config) && config.header,
      });

    /**
     * Variables
     */
    builder
      .addSelect({
        path: 'variable',
        name: 'Select variable to display',
        settings: {
          options: variableOptions,
        },
        category: ['Layout'],
        showIf: (config) => showForMinimizeView(config) || !config.groups?.length,
      })
      .addCustomEditor({
        id: 'groups',
        path: 'groups',
        name: 'Tree View based on data source query',
        editor: GroupsEditor,
        category: ['Layout'],
        showIf: showForTableView,
      })
      .addRadio({
        path: 'tabsInOrder',
        name: 'Tabs order',
        settings: {
          options: TABS_ORDER_OPTIONS,
        },
        defaultValue: true,
        category: ['Layout'],
        showIf: (config) => showForTableView(config) && config.groups?.length > 1,
      })
      .addRadio({
        path: 'showName',
        name: 'Display variable names',
        settings: {
          options: SHOW_NAME_OPTIONS,
        },
        defaultValue: false,
        category: ['Layout'],
        showIf: (config) => showForTableView(config) && !!config.groups?.length,
      })
      .addRadio({
        path: 'showResetButton',
        name: 'Display reset button',
        description: 'Allows to clear selected values.',
        settings: {
          options: SHOW_RESET_BUTTON_OPTIONS,
        },
        defaultValue: false,
        category: ['Layout'],
        showIf: (config) => showForButtonView(config),
      });

    builder
      .addRadio({
        path: 'groupSelection',
        name: 'Allow multi-level selection',
        settings: {
          options: GROUP_SELECTION_OPTIONS,
        },
        defaultValue: false,
        category: ['Groups'],
        showIf: (config) => showForTableView(config) && !!config.groups?.length,
      })
      .addRadio({
        path: 'saveSelectedGroup',
        name: 'Preserve selected group',
        description: 'Saved in the browser storage for each user.',
        settings: {
          options: SELECTED_GROUP_OPTIONS,
        },
        defaultValue: false,
        category: ['Groups'],
        showIf: (config) => showForTableView(config) && config.groups?.length > 1,
      })
      .addTextInput({
        path: 'saveSelectedGroupKey',
        name: 'Selected group Id',
        description: 'Key to preserve selected group in the browser storage.',
        defaultValue: '',
        settings: {
          placeholder: 'Will be unique per panel if empty',
        },
        showIf: (config) => showForTableView(config) && config.saveSelectedGroup,
        category: ['Groups'],
      })
      .addRadio({
        path: 'showGroupTotal',
        name: 'Display selected values count per group',
        settings: {
          options: ROW_COUNT_OPTIONS,
        },
        defaultValue: false,
        category: ['Groups'],
        showIf: (config) => showForTableView(config) && config.groupSelection,
      })
      .addRadio({
        path: 'collapsedByDefault',
        name: 'Initial state',
        settings: {
          options: COLLAPSED_BY_DEFAULT_OPTIONS,
        },
        defaultValue: false,
        category: ['Groups'],
        showIf: (config) => showForTableView(config) && !!config.groups?.length,
      });

    /**
     * Status
     */
    builder
      .addFieldNamePicker({
        path: 'name',
        name: 'Field with variable values. First string field will be used if not specified.',
        settings: {
          filter: (f: Field) => f.type === FieldType.string,
          noFieldsMessage: 'No strings fields found',
        },
        category: ['Status'],
        showIf: (config) => showForTableView(config) || showForButtonView(config),
      })
      .addFieldNamePicker({
        path: 'status',
        name: 'Field with status values. First number field will be used if not specified.',
        settings: {
          filter: (f: Field) => f.type === FieldType.number,
          noFieldsMessage: 'No number fields found',
        },
        category: ['Status'],
        showIf: (config) => showForTableView(config) || showForButtonView(config),
      });

    /**
     * Favorites
     */
    builder
      .addRadio({
        path: 'favorites.storage',
        name: 'Select storage for keeping favorites data',
        defaultValue: FavoritesStorage.BROWSER,
        settings: {
          options: FAVORITES_STORAGE_OPTIONS,
        },
        category: ['Favorites'],
        showIf: (config) => showForTableView(config) && config.header && config.favorites.enabled,
      })
      .addCustomEditor({
        id: 'favorites.datasource',
        path: 'favorites.datasource',
        name: 'Select Data Source',
        showIf: isFavoritesDatasourceShown,
        editor: DatasourceEditor,
        category: ['Favorites'],
      })
      .addCustomEditor({
        id: 'favorites.getQuery',
        path: 'favorites.getQuery',
        name: 'Get items query',
        description: 'Item should contain unique `id`, `variable` and `value` fields.',
        showIf: (config) => isFavoritesDatasourceShown(config) && !!config.favorites.datasource,
        editor: DatasourcePayloadEditor,
        category: ['Favorites'],
        settings: {
          datasourceKey: 'favorites.datasource',
        },
      })
      .addCustomEditor({
        id: 'favorites.addQuery',
        path: 'favorites.addQuery',
        name: 'Add item query',
        description: 'Item to add is placed in variable `${payload}` with `variable` and `value` properties.',
        showIf: (config) => isFavoritesDatasourceShown(config) && !!config.favorites.datasource,
        editor: DatasourcePayloadEditor,
        category: ['Favorites'],
        settings: {
          datasourceKey: 'favorites.datasource',
        },
      })
      .addCustomEditor({
        id: 'favorites.deleteQuery',
        path: 'favorites.deleteQuery',
        name: 'Delete item query',
        description: 'Item to delete is placed in variable `${payload}` with `id`, `variable` and `value` properties.',
        showIf: (config) => isFavoritesDatasourceShown(config) && !!config.favorites.datasource,
        editor: DatasourcePayloadEditor,
        category: ['Favorites'],
        settings: {
          datasourceKey: 'favorites.datasource',
        },
      });

    /**
     * Advanced
     */
    builder
      .addSelect({
        path: 'dashboardVariable',
        name: 'Select variable with dashboard UID',
        description: 'Allows to redirect to different dashboards',
        settings: {
          options: variableOptions,
        },
        category: ['Advanced'],
      })
      .addSelect({
        path: 'resetVariable',
        name: 'Select dependent variable to reset',
        settings: {
          options: [],
          getOptions: async (context) => {
            return variableOptions.filter((option) => option.label !== context.options.variable);
          },
          isClearable: true,
        },
        category: ['Advanced'],
        showIf: (config) => isVariableSelected(config),
      });

    return builder;
  });
