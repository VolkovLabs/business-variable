import { Field, FieldConfigProperty, FieldType, PanelPlugin } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import { GroupsEditor, VariablePanel } from './components';
import {
  AutoScrollOptions,
  DisplayModeOptions,
  FavoritesOptions,
  FilterOptions,
  HeaderOptions,
  ShowNameOptions,
  StatusSortOptions,
  StickyOptions,
} from './constants';
import { DisplayMode, PanelOptions } from './types';

/**
 * Panel Plugin
 */
export const plugin = new PanelPlugin<PanelOptions>(VariablePanel)
  .setNoPadding()
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
    ],
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
    const showForTableView = (config: PanelOptions) => config.displayMode === DisplayMode.TABLE;

    /**
     * Common Options
     */
    builder.addRadio({
      path: 'displayMode',
      name: 'Display mode',
      settings: {
        options: DisplayModeOptions,
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
      showIf: showForMinimizeView,
    });

    builder
      .addRadio({
        path: 'sticky',
        name: 'Sticky position',
        description: 'Variables will follow when scrolling.',
        settings: {
          options: StickyOptions,
        },
        defaultValue: false,
        showIf: showForTableView,
      })
      .addRadio({
        path: 'autoScroll',
        name: 'Auto Scroll to the selected value',
        settings: {
          options: AutoScrollOptions,
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
          options: HeaderOptions,
        },
        category: ['Header'],
        defaultValue: true,
        showIf: showForTableView,
      })
      .addRadio({
        path: 'filter',
        name: 'Values filtering',
        settings: {
          options: FilterOptions,
        },
        defaultValue: false,
        category: ['Header'],
        showIf: (config) => showForTableView(config) && config.header,
      })
      .addRadio({
        path: 'favorites',
        name: 'Select favorites',
        description: 'Saved in the browser storage for each user.',
        settings: {
          options: FavoritesOptions,
        },
        defaultValue: false,
        category: ['Header'],
        showIf: (config) => showForTableView(config) && config.header,
      })
      .addRadio({
        path: 'statusSort',
        name: 'Sort by status',
        settings: {
          options: StatusSortOptions,
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
        path: 'showName',
        name: 'Display variable names',
        settings: {
          options: ShowNameOptions,
        },
        defaultValue: false,
        category: ['Layout'],
        showIf: (config) => showForTableView(config) && !!config.groups?.length,
      });

    builder
      .addFieldNamePicker({
        path: 'name',
        name: 'Field with variable values. First string field will be used if not specified.',
        settings: {
          filter: (f: Field) => f.type === FieldType.string,
          noFieldsMessage: 'No strings fields found',
        },
        category: ['Status'],
        showIf: showForTableView,
      })
      .addFieldNamePicker({
        path: 'status',
        name: 'Field with status values. First number field will be used if not specified.',
        settings: {
          filter: (f: Field) => f.type === FieldType.number,
          noFieldsMessage: 'No number fields found',
        },
        category: ['Status'],
        showIf: showForTableView,
      });

    return builder;
  });
