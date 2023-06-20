import { FieldConfigProperty, PanelPlugin } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import { VariablePanel } from './components';
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

    builder.addSelect({
      path: 'variable',
      name: 'Select Variable to Display',
      settings: {
        options: variables.map((vr) => ({
          label: vr.name,
          value: vr.name,
        })),
      },
    });

    return builder;
  });
