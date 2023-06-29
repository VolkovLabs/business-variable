import { Field, FieldConfigProperty, FieldType, PanelPlugin } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import { FieldsEditor, VariablePanel } from './components';
import { HeaderOptions, StickyOptions } from './constants';
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

    builder.addRadio({
      path: 'header',
      name: 'Header',
      settings: {
        options: HeaderOptions,
      },
      defaultValue: true,
    });

    builder.addRadio({
      path: 'sticky',
      name: 'Sticky Position',
      description: 'Variables will follow when scrolling.',
      settings: {
        options: StickyOptions,
      },
      defaultValue: false,
    });

    builder.addSelect({
      path: 'variable',
      name: 'Select Variable to Display',
      settings: {
        options: variables.map((vr) => ({
          label: vr.name,
          value: vr.name,
        })),
      },
      showIf: (config) => !config.levels?.length,
    });

    builder.addCustomEditor({
      id: 'fieldsEditor',
      path: 'levels',
      name: 'Tree View levels based on Data Source',
      editor: FieldsEditor,
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
