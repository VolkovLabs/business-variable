import { PanelPlugin, Field, FieldType } from '@grafana/data';
import { PanelOptions } from './types';
import { plugin } from './module';

/**
 * Test Field
 */
type TestField = Pick<Field, 'name' | 'type'>;

/**
 * Mock @grafana/runtime
 */
jest.mock('@grafana/runtime', () => ({
  ...jest.requireActual('@grafana/runtime'),
  getTemplateSrv: jest.fn(() => ({
    getVariables: jest.fn(() => []),
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
    addSelect: jest.fn().mockImplementation(() => builder),
    addFieldNamePicker: jest.fn().mockImplementation(() => builder),
    addCustomEditor: jest.fn().mockImplementation(() => builder),
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
    expect(builder.addSelect).toHaveBeenCalled();
    expect(builder.addFieldNamePicker).toHaveBeenCalled();
    expect(builder.addCustomEditor).toHaveBeenCalled();
  });

  describe('Input Visibility', () => {
    beforeEach(() => {
      builder.addFieldNamePicker.mockClear();
      builder.addSelect.mockClear();
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

      builder.addSelect.mockImplementation(addInputImplementation({ levels: [] }, shownOptionsPaths));

      plugin['optionsSupplier'](builder);

      expect(shownOptionsPaths).toEqual(expect.arrayContaining(['variable']));
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
