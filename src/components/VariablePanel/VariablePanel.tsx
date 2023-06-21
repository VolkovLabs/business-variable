import React from 'react';
import { css, cx } from '@emotion/css';
import { PanelProps } from '@grafana/data';
import { Alert, useTheme2 } from '@grafana/ui';
import { TestIds } from '../../constants';
import { Styles } from '../../styles';
import { PanelOptions } from '../../types';
import { Table } from '../Table';
import { useTable } from './useTable';

/**
 * Properties
 */
interface Props extends PanelProps<PanelOptions> {}

/**
 * Panel
 */
export const VariablePanel: React.FC<Props> = ({ data, options, width, height }) => {
  const { tableData, getRowId, columns } = useTable({ data: data?.series[0], variable: options.variable });

  /**
   * Styles and Theme
   */
  const theme = useTheme2();
  const styles = Styles(theme);

  /**
   * Return
   */
  return (
    <div
      data-testid={TestIds.panel.root}
      className={cx(
        styles.wrapper,
        css`
          width: ${width}px;
          height: ${height}px;
        `
      )}
    >
      {!tableData.length && (
        <Alert data-testid={TestIds.panel.infoMessage} severity="info" title="Variable">
          Variable is not selected.
        </Alert>
      )}

      {tableData.length > 0 && <Table columns={columns} data={tableData} getRowId={getRowId} />}
    </div>
  );
};
