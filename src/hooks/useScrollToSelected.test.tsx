import React from 'react';
import { render, screen } from '@testing-library/react';
import { TableItem } from '../types';
import { useScrollToSelected } from './useScrollToSelected';

/**
 * In Test Ids
 */
const InTestIds = {
  container: 'container',
  selectedRow: 'selected-row',
};

describe('Use Scroll To Selected', () => {
  it('Should scroll to first selected row', () => {
    const Component = ({ tableData, autoScroll }: { tableData: TableItem[]; autoScroll: boolean }) => {
      const ref = useScrollToSelected(tableData, autoScroll);

      return (
        <div ref={ref} style={{ overflow: 'scroll', height: 200 }} data-testid={InTestIds.container}>
          <table>
            <tbody>
              <tr>
                <td>
                  <input type="checkbox" />
                </td>
              </tr>
              <tr data-testid={InTestIds.selectedRow}>
                <td>
                  <input type="checkbox" defaultChecked={true} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    };

    const { rerender } = render(<Component tableData={[]} autoScroll={false} />);

    const container = screen.getByTestId(InTestIds.container);
    const selectedRow = screen.getByTestId(InTestIds.selectedRow);

    container.getBoundingClientRect = jest.fn(
      () =>
        ({
          top: 0,
        } as any)
    );
    selectedRow.getBoundingClientRect = jest.fn(
      () =>
        ({
          top: 200,
        } as any)
    );
    container.scrollTo = jest.fn();

    rerender(<Component tableData={[]} autoScroll={true} />);

    expect(container.scrollTo).toHaveBeenCalledWith({ top: 200 });
  });
});
