import {
  Field,
  FieldConfigProperty,
  FieldType,
  identityOverrideProcessor,
  PanelPlugin,
  TypedVariableModel,
} from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import { getAvailableIcons } from '@grafana/ui';
import { DatasourceEditor } from '@volkovlabs/components';

import { DatasourcePayloadEditor, GroupsEditor, StatusStyleEditor, VariablePanel } from './components';
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
  MINIMIZE_OUTPUT_FORMAT_OPTIONS,
  NO_VARIABLE_DEFAULT_MESSAGE,
  PERSISTENT_OPTIONS,
  PIN_TAB_OPTIONS,
  REQUEST_LATENCY_OPTIONS,
  ROW_COUNT_OPTIONS,
  SELECTED_GROUP_OPTIONS,
  SHOW_LABEL_OPTIONS,
  SHOW_NAME_OPTIONS,
  SHOW_RESET_BUTTON_OPTIONS,
  SHOW_SELECTED_OPTIONS,
  STATUS_SORT_OPTIONS,
  TABLE_MINIMIZE_OPTIONS,
  TABLE_VIEW_POSITION_OPTIONS,
  TABLE_WRAP_OPTIONS,
  TABS_ORDER_OPTIONS,
  TIME_TRANSFORMATION_OPTIONS,
  TOOLBAR_MODE_OPTIONS,
} from './constants';
import { getMigratedOptions } from './migration';
import {
  BreakOption,
  DisplayMode,
  FavoritesStorage,
  MinimizeOutputFormat,
  PanelOptions,
  RequestLatencyMode,
  StatusStyleMode,
  TableViewPosition,
  ToolbarMode,
  VariableType,
} from './types';

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
    const getCurrentVariable = (config: PanelOptions) =>
      variables.find((variable) => variable.name === config.variable);

    /**
     * Visibility
     */
    const showForMinimizeView = (config: PanelOptions) => config.displayMode === DisplayMode.MINIMIZE;
    const showForButtonView = (config: PanelOptions) => config.displayMode === DisplayMode.BUTTON;
    const showForTableView = (config: PanelOptions) => config.displayMode === DisplayMode.TABLE;
    const showForTableTabsView = (config: PanelOptions) =>
      config.displayMode === DisplayMode.TABLE && config.toolbarMode === ToolbarMode.TABS;
    const showForSliderView = (config: PanelOptions) => config.displayMode === DisplayMode.SLIDER;
    const isVariableSelected = (config: PanelOptions) => !!config.variable;
    const isFavoritesDatasourceShown = (config: PanelOptions) =>
      showForTableView(config) &&
      config.header &&
      config.favorites.enabled &&
      config.favorites.storage === FavoritesStorage.DATASOURCE;
    const isDateTimePickerMode = (config: PanelOptions, variable?: TypedVariableModel) =>
      variable &&
      variable.type === VariableType.TEXTBOX &&
      config.displayMode === DisplayMode.MINIMIZE &&
      (config.minimizeOutputFormat === MinimizeOutputFormat.DATETIME ||
        config.minimizeOutputFormat === MinimizeOutputFormat.TIMESTAMP ||
        config.minimizeOutputFormat === MinimizeOutputFormat.DATE);

    /**
     * Icon Options
     */
    const iconOptions = getAvailableIcons()
      .sort((a, b) => a.localeCompare(b))
      .map((icon) => {
        return {
          value: icon,
          label: icon,
          icon: icon,
        };
      });

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
     * Common Options
     */
    builder.addTextInput({
      path: 'alertCustomMessage',
      name: 'Custom message when variable is not selected',
      description: 'Leave empty for the default message.',
      settings: {
        placeholder: NO_VARIABLE_DEFAULT_MESSAGE,
      },
      defaultValue: '',
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
      })
      .addNumberInput({
        path: 'selectedValues.maxCount',
        name: 'Maximum number of selected values',
        description: 'Defines how many values allowed to select. 0 means no limit.',
        settings: {
          placeholder: 'no limit',
        },
        category: ['Values'],
        showIf: (config) => showForTableView(config),
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
        path: 'tableViewPosition',
        name: 'Position',
        description: 'Position and behavior',
        settings: {
          options: TABLE_VIEW_POSITION_OPTIONS,
        },
        defaultValue: TableViewPosition.NORMAL,
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
      })
      .addRadio({
        path: 'isMinimizeForTable',
        name: 'Table minimize view',
        settings: {
          options: TABLE_MINIMIZE_OPTIONS,
        },
        defaultValue: false,
        showIf: showForTableView,
      })
      .addRadio({
        path: 'wordBreak',
        name: 'Word wrap for values',
        settings: {
          options: TABLE_WRAP_OPTIONS,
        },
        defaultValue: BreakOption.NORMAL,
        showIf: showForTableView,
      })
      .addBooleanSwitch({
        path: 'isMinimizeViewShowCustomIcon',
        name: 'Show Custom Icon',
        description: 'Show custom icon for the minimize view.',
        showIf: (config) => showForTableView(config) && config.isMinimizeForTable,
        defaultValue: false,
      })
      .addSelect({
        path: 'minimizeViewNativeIcon',
        name: 'Native Icon',
        description: 'Use native icon for the minimize view.',
        showIf: (config) =>
          showForTableView(config) && config.isMinimizeForTable && !config.isMinimizeViewShowCustomIcon,
        settings: {
          options: iconOptions,
        },
        defaultValue: 'gf-movepane-right',
      })
      .addTextInput({
        path: 'minimizeViewCustomIcon',
        name: 'Custom Icon URL',
        description: 'Custom icon for the minimize view.',
        showIf: (config) =>
          showForTableView(config) && config.isMinimizeForTable && config.isMinimizeViewShowCustomIcon,
        defaultValue: '',
      })
      .addRadio({
        path: 'isPinTabsEnabled',
        name: 'Pin/Unpin functionality for tabs',
        settings: {
          options: PIN_TAB_OPTIONS,
        },
        defaultValue: false,
        showIf: showForTableTabsView,
      })
      .addRadio({
        path: 'toolbarMode',
        name: 'Toolbar mode',
        settings: {
          options: TOOLBAR_MODE_OPTIONS,
        },
        defaultValue: ToolbarMode.TABS,
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
        path: 'selectedValues.showSelected',
        name: 'Allow showing selected values',
        settings: {
          options: SHOW_SELECTED_OPTIONS,
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
        description: 'Constant, Data Source, Interval, AD hoc filters are not supported.',
        settings: {
          options: variableOptions,
        },
        category: ['Layout'],
        showIf: (config) => showForMinimizeView(config) || !config.groups?.length,
      })
      .addRadio({
        path: 'minimizeOutputFormat',
        name: 'Minimize output format',
        description: 'Set the display mode for the variable of the “Text box" type',
        settings: {
          options: MINIMIZE_OUTPUT_FORMAT_OPTIONS,
        },
        defaultValue: MinimizeOutputFormat.TEXT,
        category: ['Layout'],
        showIf: (config) => {
          const variable = getCurrentVariable(config);
          return (
            variable &&
            (variable.type === VariableType.TEXTBOX || variable.type === VariableType.CONSTANT) &&
            config.displayMode === DisplayMode.MINIMIZE
          );
        },
      })
      .addRadio({
        path: 'isUseLocalTime',
        name: 'Time Zone',
        description: 'Transform to UTC or use local time zone',
        settings: {
          options: TIME_TRANSFORMATION_OPTIONS,
        },
        defaultValue: false,
        category: ['Layout'],
        showIf: (config) => {
          const variable = getCurrentVariable(config);
          return isDateTimePickerMode(config, variable);
        },
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
        description: 'Allows to redirect to different dashboards.',
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
      })
      .addTextInput({
        path: 'browserTabNamePattern',
        name: 'Add variable to the browser tab name',
        description: 'Use ${__dashboard.title} pattern to get current dashboard title.',
        defaultValue: '',
        settings: {
          placeholder: '${variable} ${__dashboard.title}',
        },
        category: ['Advanced'],
      })
      .addRadio({
        path: 'requestLatency',
        name: 'Set request latency to refresh dashboard variables',
        defaultValue: RequestLatencyMode.LOW,
        settings: {
          options: REQUEST_LATENCY_OPTIONS,
        },
        showIf: (config) => showForTableView(config),
        category: ['Advanced'],
      });

    return builder;
  });
