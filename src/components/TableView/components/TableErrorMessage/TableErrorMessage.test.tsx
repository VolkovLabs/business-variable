import { act, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '../../../../constants';

import { TableErrorMessage } from './TableErrorMessage';

/**
 * Properties
 */
type Props = React.ComponentProps<typeof TableErrorMessage>;

/**
 * Table Error Message
 */
describe('Table Error Message', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({ ...TEST_IDS.tableErrorMessage });
  const selectors = getSelectors(screen);

  /**
   * Get Tested Component
   */
  const getComponent = ({ options = {} as any, ...restProps }: Partial<Props>) => {
    return <TableErrorMessage options={options} {...(restProps as any)} />;
  };

  it('Should Render error message if no variable', async () => {
    await act(async () =>
      render(
        getComponent({
          runtimeVariable: undefined,
          options: {} as any,
          tableData: [],
          currentGroup: '',
        })
      )
    );
    expect(selectors.infoMessage()).toBeInTheDocument();
  });

  it('Should Render error custom message if no variable', async () => {
    await act(async () =>
      render(
        getComponent({
          runtimeVariable: undefined,
          options: { alertCustomMessage: 'Custom error' } as any,
          tableData: [],
          currentGroup: '',
        })
      )
    );
    expect(selectors.infoMessage()).toBeInTheDocument();
    expect(selectors.infoMessage()).toHaveTextContent('Custom error');
  });

  it('Should Render error message if no table data', async () => {
    await act(async () =>
      render(
        getComponent({
          runtimeVariable: { name: 'Variable' } as any,
          options: {} as any,
          tableData: [],
          currentGroup: '',
        })
      )
    );
    expect(selectors.noDataMessage()).toBeInTheDocument();
  });

  it('Should Render custom error message if no table data', async () => {
    await act(async () =>
      render(
        getComponent({
          runtimeVariable: { name: 'Variable' } as any,
          options: { groups: [{ name: 'test', noDataCustomMessage: 'Test message' }] } as any,
          tableData: [],
          currentGroup: 'test',
        })
      )
    );
    expect(selectors.noDataMessage()).toBeInTheDocument();
    expect(selectors.noDataMessage()).toHaveTextContent('Test message');
  });

  it('Should not Render error message if all is okay', async () => {
    await act(async () =>
      render(
        getComponent({
          runtimeVariable: { name: 'Variable' } as any,
          options: { groups: [{ name: 'test', noDataCustomMessage: 'Test message' }] } as any,
          tableData: [{ selected: true, value: test } as any],
          currentGroup: 'test',
        })
      )
    );
    expect(selectors.noDataMessage(true)).not.toBeInTheDocument();
  });
});
