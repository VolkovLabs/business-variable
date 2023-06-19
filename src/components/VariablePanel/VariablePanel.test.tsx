import React from 'react';
import { VariableWithMultiSupport } from '@grafana/data';
import { getTemplateSrv, locationService } from '@grafana/runtime';
import { Table } from '@grafana/ui';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { TestIds } from '../../constants';
import { RuntimeVariable } from '../../types';
import { VariablePanel } from './VariablePanel';

/**
 * Test Ids that are used only in tests
 */
const InTestIds = {
  table: 'table',
  link: 'link',
};

/**
 * Mock @grafana/runtime
 */
jest.mock('@grafana/runtime', () => ({
  ...jest.requireActual('@grafana/runtime'),
  locationService: {
    partial: jest.fn(),
    getSearch: jest.fn(() => new URLSearchParams()),
    getSearchObject: jest.fn(() => ({})),
  },
  getTemplateSrv: jest.fn(() => ({
    getVariables: jest.fn(() => []),
  })),
}));

/**
 * Mock @grafana/ui
 */
jest.mock('@grafana/ui', () => ({
  ...jest.requireActual('@grafana/ui'),
  Table: jest.fn(({ data }: React.ComponentProps<typeof Table>) => {
    const row = data.fields[0];
    const values = row.values.toArray();
    const rows = values.map((value) =>
      row.getLinks?.({ calculatedValue: row.display?.(value) }).map((link) => ({
        ...link,
        value,
      }))
    );

    return (
      <div data-testid={InTestIds.table}>
        {rows?.map((links = [], row) => (
          <div key={row}>
            {links.map((link, index) => (
              <button
                key={index}
                onClick={(e) => {
                  if (link.onClick) {
                    link.onClick({
                      ...link,
                      target: {
                        innerText: link.value,
                      },
                    });
                  }
                }}
                data-testid={InTestIds.link}
              >
                {link.value}
              </button>
            ))}
          </div>
        ))}
      </div>
    );
  }),
}));

/**
 * Panel
 */
describe('Panel', () => {
  beforeEach(() => {
    jest.mocked(locationService).partial.mockClear();
  });

  const eventBus = {
    getStream: jest.fn(() => ({
      subscribe: jest.fn(() => ({
        unsubscribe: jest.fn(),
      })),
    })),
  };

  /**
   * Get Tested Component
   */
  const getComponent = ({ options = { name: 'data' }, ...restProps }: any) => {
    return <VariablePanel width={100} height={100} eventBus={eventBus} {...restProps} options={options} />;
  };

  it('Should find component', async () => {
    render(getComponent({}));
    expect(screen.getByTestId(TestIds.panel.root)).toBeInTheDocument();
  });

  it('Should show info message if no variables', async () => {
    render(getComponent({}));
    expect(screen.getByTestId(TestIds.panel.infoMessage)).toBeInTheDocument();
  });

  /**
   * Single variable
   */
  it('Should render table for single variable', () => {
    const runtimeVariables: Array<Pick<RuntimeVariable, 'id' | 'options' | 'name' | 'label'>> = [
      {
        id: 'single',
        options: [
          { text: 'value1', value: 'value1' },
          { text: 'value2', value: 'value2' },
        ],
        name: 'single',
        label: 'Single',
      },
    ];
    jest.mocked(getTemplateSrv).mockImplementation(
      () =>
        ({
          getVariables: jest.fn(() => runtimeVariables),
        } as any)
    );
    jest.mocked(locationService).partial.mockImplementation(() => {});

    render(getComponent({ options: { variable: 'single' } }));

    const table = screen.getByTestId(InTestIds.table);
    expect(table).toBeInTheDocument();
    expect(within(table).getByText('value1')).toBeInTheDocument();

    fireEvent.click(within(table).getByText('value1'));

    expect(locationService.partial).toHaveBeenCalledWith({ 'var-single': 'value1' }, true);
  });

  /**
   * Multi select
   */
  describe('Multi', () => {
    it('Should render table for multi variable', () => {
      const runtimeVariables: Array<Pick<VariableWithMultiSupport, 'id' | 'options' | 'name' | 'label' | 'multi'>> = [
        {
          id: 'multi',
          options: [
            { text: 'value1', value: 'value1', selected: true },
            { text: 'value2', value: 'value2', selected: false },
          ],
          name: 'multi',
          label: 'Multi',
          multi: true,
        },
      ];
      jest.mocked(getTemplateSrv).mockImplementation(
        () =>
          ({
            getVariables: jest.fn(() => runtimeVariables),
          } as any)
      );
      jest.mocked(locationService).partial.mockImplementation(() => {});
      jest.mocked(locationService).getSearch.mockImplementation(() => new URLSearchParams());

      render(getComponent({ options: { variable: 'multi' } }));

      const table = screen.getByTestId(InTestIds.table);
      expect(table).toBeInTheDocument();
      expect(within(table).getByText('value1')).toBeInTheDocument();

      fireEvent.click(within(table).getByText('value1'));

      expect(locationService.partial).toHaveBeenCalledWith({ 'var-multi': 'value1' }, true);
    });

    it('Should render table if __all option selected', () => {
      const runtimeVariables: Array<
        Pick<VariableWithMultiSupport, 'id' | 'options' | 'name' | 'label' | 'multi' | 'includeAll'>
      > = [
        {
          id: 'multi',
          options: [{ text: 'all', value: '__all', selected: true }],
          name: 'multi',
          label: 'Multi',
          multi: true,
          includeAll: true,
        },
      ];
      jest.mocked(getTemplateSrv).mockImplementation(
        () =>
          ({
            getVariables: jest.fn(() => runtimeVariables),
          } as any)
      );
      jest.mocked(locationService).partial.mockImplementation(() => {});
      jest.mocked(locationService).getSearch.mockImplementation(() => new URLSearchParams());

      render(getComponent({ options: { variable: 'multi' } }));

      const table = screen.getByTestId(InTestIds.table);
      expect(table).toBeInTheDocument();
      expect(within(table).getByText('all')).toBeInTheDocument();

      fireEvent.click(within(table).getByText('all'));

      expect(locationService.partial).toHaveBeenCalledWith({ 'var-multi': 'all' }, true);
    });
  });
});
