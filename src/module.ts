import { Field, FieldConfigProperty, FieldType, PanelPlugin } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import { GroupsEditor, VariablePanel } from './components';
import {
  AutoScrollOptions,
  FavoritesOptions,
  FilterOptions,
  HeaderOptions,
  ShowNameOptions,
  statusSortOptions,
  StickyOptions,
} from './constants';
import { PanelOptions } from './types';

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

    builder
      .addRadio({
        path: 'sticky',
        name: 'Sticky position',
        description: 'Variables will follow when scrolling.',
        settings: {
          options: StickyOptions,
        },
        defaultValue: false,
      })
      .addRadio({
        path: 'autoScroll',
        name: 'Auto Scroll to the selected value',
        settings: {
          options: AutoScrollOptions,
        },
        defaultValue: false,
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
      })
      .addRadio({
        path: 'filter',
        name: 'Values filtering',
        settings: {
          options: FilterOptions,
        },
        defaultValue: false,
        category: ['Header'],
        showIf: (config) => config.header,
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
        showIf: (config) => config.header,
      })
      .addRadio({
        path: 'statusSort',
        name: 'Sort by status',
        description: 'Available for a single-level layout.',
        settings: {
          options: statusSortOptions,
        },
        defaultValue: false,
        category: ['Header'],
        showIf: (config) => config.header,
      });

    /**
     * Variables
     */
    builder
      .addSelect({
        path: 'variable',
        name: 'Select variable to display',
        settings: {
          options: variables.map((vr) => ({
            label: vr.name,
            value: vr.name,
          })),
        },
        category: ['Layout'],
        showIf: (config) => !config.groups?.length,
      })
      .addCustomEditor({
        id: 'groups',
        path: 'groups',
        name: 'Tree View based on data source query',
        editor: GroupsEditor,
        category: ['Layout'],
      })
      .addRadio({
        path: 'showName',
        name: 'Display variable names',
        settings: {
          options: ShowNameOptions,
        },
        defaultValue: false,
        category: ['Layout'],
        showIf: (config) => !!config.groups?.length,
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
      })
      .addFieldNamePicker({
        path: 'status',
        name: 'Field with status values. First number field will be used if not specified.',
        settings: {
          filter: (f: Field) => f.type === FieldType.number,
          noFieldsMessage: 'No number fields found',
        },
        category: ['Status'],
      });

    return builder;
  });
