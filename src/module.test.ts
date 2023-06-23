import { PanelPlugin } from '@grafana/data';
import { plugin } from './module';

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
  it('Should be instance of PanelPlugin', () => {
    expect(plugin).toBeInstanceOf(PanelPlugin);
  });

  it('Should add inputs', () => {
    /**
     * Builder
     */
    const builder: any = {
      addSelect: jest.fn().mockImplementation(() => builder),
      addFieldNamePicker: jest.fn().mockImplementation(() => builder),
      addCustomEditor: jest.fn().mockImplementation(() => builder),
    };

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
});
