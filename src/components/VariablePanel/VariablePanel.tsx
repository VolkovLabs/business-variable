import React from 'react';
import { css, cx } from '@emotion/css';
import { PanelProps } from '@grafana/data';
import { Alert, useTheme2 } from '@grafana/ui';
import { TestIds } from '../../constants';
import { Styles } from '../../styles';
import { PanelOptions } from '../../types';
import { Table } from '../Table';
import { useTable } from './useTable';
import { useContentPosition } from './useContentPosition';

/**
 * Properties
 */
interface Props extends PanelProps<PanelOptions> {}

/**
 * Panel
 */
export const VariablePanel: React.FC<Props> = ({ data, options, width, height, eventBus }) => {
  /**
   * Table config
   */
  const { tableData, columns, getSubRows } = useTable({ data, options, eventBus });

  /**
   * Sticky position
   */
  const { containerRef, style } = useContentPosition({
    width,
    height,
    sticky: options.stickyPosition,
  });

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
      ref={containerRef}
    >
      {!tableData.length && (
        <Alert data-testid={TestIds.panel.infoMessage} severity="info" title="Variable">
          Variable is not selected.
        </Alert>
      )}

      {tableData.length > 0 && (
        <div style={style} className={styles.content}>
          <Table columns={columns} data={tableData} getSubRows={getSubRows} showHeader={options.header} />
        </div>
      )}
    </div>
  );
};
