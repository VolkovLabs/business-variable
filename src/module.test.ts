import { Field, FieldType, PanelPlugin } from '@grafana/data';

import { plugin } from './module';
import { DisplayMode, FavoritesStorage, MinimizeOutputFormat, PanelOptions, VariableType } from './types';
import { createPanelOptions } from './utils';

/**
 * Test Field
 */
type TestField = Pick<Field, 'name' | 'type'>;

/**
 * Mock @grafana/runtime
 */
const variablesMock = [
  {
    name: 'textBox',
    type: VariableType.TEXTBOX,
  },
];

jest.mock('@grafana/runtime', () => ({
  ...jest.requireActual('@grafana/runtime'),
  getTemplateSrv: jest.fn(() => ({
    getVariables: jest.fn(() => variablesMock),
  })),
}));

/*
 Plugin
 */
describe('plugin', () => {
  /**
   * Builder
   */
  const builder: any = {
    addCustomEditor: jest.fn().mockImplementation(() => builder),
    addFieldNamePicker: jest.fn().mockImplementation(() => builder),
    addRadio: jest.fn().mockImplementation(() => builder),
    addSelect: jest.fn().mockImplementation(() => builder),
    addSliderInput: jest.fn().mockImplementation(() => builder),
    addTextInput: jest.fn().mockImplementation(() => builder),
    addNumberInput: jest.fn().mockImplementation(() => builder),
  };

  it('Should be instance of PanelPlugin', () => {
    expect(plugin).toBeInstanceOf(PanelPlugin);
  });

  it('Should add inputs', () => {
    /**
     * Supplier
     */
    plugin['optionsSupplier'](builder);

    /**
     * Inputs
     */
    expect(builder.addCustomEditor).toHaveBeenCalled();
    expect(builder.addFieldNamePicker).toHaveBeenCalled();
    expect(builder.addRadio).toHaveBeenCalled();
    expect(builder.addSelect).toHaveBeenCalled();
    expect(builder.addSliderInput).toHaveBeenCalled();
    expect(builder.addTextInput).toHaveBeenCalled();
    expect(builder.addNumberInput).toHaveBeenCalled();
  });

  describe('Input Visibility', () => {
    beforeEach(() => {
      builder.addFieldNamePicker.mockClear();
      builder.addSelect.mockClear();
      builder.addTextInput.mockClear();
    });

    /**
     * Add Input Implementation
     * @param config
     * @param result
     */
    const addInputImplementation = (config: Partial<PanelOptions>, result: string[]) => (input: any) => {
      if (input.showIf) {
        if (input.showIf(config)) {
          result.push(input.path);
        }
      } else {
        result.push(input.path);
      }

      return builder;
    };

    it('Should show variable name if no levels', () => {
      const shownOptionsPaths: string[] = [];

      builder.addSelect.mockImplementation(
        addInputImplementation(createPanelOptions({ groups: [], displayMode: DisplayMode.TABLE }), shownOptionsPaths)
      );
      plugin['optionsSupplier'](builder);

      expect(shownOptionsPaths).toEqual(expect.arrayContaining(['variable']));
    });

    it('Should show filter if header enabled', () => {
      const shownOptionsPaths: string[] = [];

      builder.addRadio.mockImplementation(
        addInputImplementation(createPanelOptions({ header: true, displayMode: DisplayMode.TABLE }), shownOptionsPaths)
      );
      plugin['optionsSupplier'](builder);

      expect(shownOptionsPaths).toEqual(expect.arrayContaining(['filter']));
    });

    it('Should show status fields if table view', () => {
      const shownOptionsPaths: string[] = [];

      builder.addFieldNamePicker.mockImplementation(
        addInputImplementation(createPanelOptions({ displayMode: DisplayMode.TABLE }), shownOptionsPaths)
      );
      plugin['optionsSupplier'](builder);

      expect(shownOptionsPaths).toEqual(expect.arrayContaining(['name', 'status']));
    });

    it('Should show status fields if button view', () => {
      const shownOptionsPaths: string[] = [];

      builder.addFieldNamePicker.mockImplementation(
        addInputImplementation(createPanelOptions({ displayMode: DisplayMode.BUTTON }), shownOptionsPaths)
      );
      plugin['optionsSupplier'](builder);

      expect(shownOptionsPaths).toEqual(expect.arrayContaining(['name', 'status']));
    });

    it('Should show padding field if minimize view', () => {
      const shownOptionsPaths: string[] = [];

      builder.addSliderInput.mockImplementation(
        addInputImplementation(createPanelOptions({ displayMode: DisplayMode.MINIMIZE }), shownOptionsPaths)
      );
      plugin['optionsSupplier'](builder);

      expect(shownOptionsPaths).toEqual(expect.arrayContaining(['padding']));
    });

    it('Should show padding field if button view', () => {
      const shownOptionsPaths: string[] = [];

      builder.addSliderInput.mockImplementation(
        addInputImplementation(createPanelOptions({ displayMode: DisplayMode.BUTTON }), shownOptionsPaths)
      );
      plugin['optionsSupplier'](builder);

      expect(shownOptionsPaths).toEqual(expect.arrayContaining(['padding']));
    });

    it('Should show Unique Cross Key Input if table view', () => {
      const shownOptionsPaths: string[] = [];

      builder.addTextInput.mockImplementation(
        addInputImplementation(
          createPanelOptions({ displayMode: DisplayMode.TABLE, saveSelectedGroup: true }),
          shownOptionsPaths
        )
      );
      plugin['optionsSupplier'](builder);

      expect(shownOptionsPaths).toEqual(expect.arrayContaining([]));
    });

    it('Should show Display Mode Input if minimized view', () => {
      const shownOptionsPaths: string[] = [];

      builder.addNumberInput.mockImplementation(
        addInputImplementation(
          createPanelOptions({ showLabel: true, displayMode: DisplayMode.MINIMIZE }),
          shownOptionsPaths
        )
      );
      plugin['optionsSupplier'](builder);

      expect(shownOptionsPaths).toEqual(expect.arrayContaining(['labelWidth']));
    });

    it('Should show variants for TextBox variable', () => {
      const shownOptionsPaths: string[] = [];

      builder.addRadio.mockImplementation(
        addInputImplementation(
          createPanelOptions({ variable: 'textBox', displayMode: DisplayMode.MINIMIZE }),
          shownOptionsPaths
        )
      );
      plugin['optionsSupplier'](builder);

      expect(shownOptionsPaths).toEqual(expect.arrayContaining(['minimizeOutputFormat']));
    });

    it('Should show Time options for DateTime picker for TextBox variable', () => {
      const shownOptionsPaths: string[] = [];

      builder.addRadio.mockImplementation(
        addInputImplementation(
          createPanelOptions({
            variable: 'textBox',
            displayMode: DisplayMode.MINIMIZE,
            minimizeOutputFormat: MinimizeOutputFormat.DATETIME,
          }),
          shownOptionsPaths
        )
      );
      plugin['optionsSupplier'](builder);

      expect(shownOptionsPaths).toEqual(expect.arrayContaining(['minimizeOutputFormat', 'isUseLocalTime']));
    });

    it('Should show options for favorites', () => {
      const shownOptionsPaths: string[] = [];

      builder.addCustomEditor.mockImplementation(
        addInputImplementation(
          createPanelOptions({
            header: true,
            displayMode: DisplayMode.TABLE,
            favorites: {
              enabled: true,
              storage: FavoritesStorage.DATASOURCE,
              addQuery: {},
              getQuery: {},
              deleteQuery: {},
              datasource: 'Static',
            },
          }),
          shownOptionsPaths
        )
      );
      plugin['optionsSupplier'](builder);

      expect(shownOptionsPaths).toEqual(
        expect.arrayContaining([
          'favorites.datasource',
          'favorites.getQuery',
          'favorites.addQuery',
          'favorites.deleteQuery',
        ])
      );
    });
  });

  describe('Settings', () => {
    const addFieldNameImplementation =
      (optionPath: string, allFields: TestField[], shownFields: TestField[]) => (input: any) => {
        if (optionPath === input.path) {
          const fields = allFields.filter(input.settings.filter);
          shownFields.push(...fields);
        }

        return builder;
      };

    it('Should return only string fields for name', () => {
      const fields: TestField[] = [
        { name: 'string', type: FieldType.string },
        { name: 'number', type: FieldType.number },
      ];
      const shownFields: TestField[] = [];

      builder.addFieldNamePicker.mockImplementation(addFieldNameImplementation('name', fields, shownFields));
      plugin['optionsSupplier'](builder);

      expect(shownFields).toEqual([{ name: 'string', type: FieldType.string }]);
    });

    it('Should return only number fields for status', () => {
      const fields: TestField[] = [
        { name: 'string', type: FieldType.string },
        { name: 'number', type: FieldType.number },
      ];
      const shownFields: TestField[] = [];

      builder.addFieldNamePicker.mockImplementation(addFieldNameImplementation('status', fields, shownFields));
      plugin['optionsSupplier'](builder);

      expect(shownFields).toEqual([{ name: 'number', type: FieldType.number }]);
    });
  });
});
