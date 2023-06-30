import React, { useState, useMemo } from 'react';
import { css, cx } from '@emotion/css';
import { PanelProps } from '@grafana/data';
import { Alert, useTheme2, RadioButtonGroup } from '@grafana/ui';
import { TestIds } from '../../constants';
import { Styles } from '../../styles';
import { PanelOptions } from '../../types';
import { Table } from '../Table';
import { useContentPosition } from './useContentPosition';
import { useTable } from './useTable';

/**
 * Properties
 */
interface Props extends PanelProps<PanelOptions> {}

/**
 * Panel
 */
export const VariablePanel: React.FC<Props> = ({ data, options, width, height, eventBus }) => {
  /**
   * Current Levels Group
   */
  const [currentGroup, setCurrentGroup] = useState(options.levelsGroups?.[0].name);

  /**
   * Group options
   */
  const groupOptions = useMemo(() => {
    return (
      options.levelsGroups?.map(({ name }) => ({
        value: name,
        label: name,
      })) || []
    );
  }, [options.levelsGroups]);

  /**
   * Current Levels
   */
  const currentLevels = useMemo(() => {
    if (options.levelsGroups?.length && currentGroup) {
      return options.levelsGroups.find((group) => group.name === currentGroup)?.items;
    }
    return;
  }, [options.levelsGroups, currentGroup]);

  /**
   * Table config
   */
  const { tableData, columns, getSubRows } = useTable({ data, options, eventBus, levels: currentLevels });

  /**
   * Sticky position
   */
  const { containerRef, style } = useContentPosition({
    width,
    height,
    sticky: options.sticky,
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
          Variable is not selected or do not match returned fields.
        </Alert>
      )}

      {tableData.length > 0 && (
        <div style={style} className={styles.content}>
          {options.levelsGroups?.length > 0 && (
            <RadioButtonGroup
              value={currentGroup}
              options={groupOptions}
              onChange={(value) => setCurrentGroup(value)}
            />
          )}
          <Table columns={columns} data={tableData} getSubRows={getSubRows} showHeader={options.header} />
        </div>
      )}
    </div>
  );
};
