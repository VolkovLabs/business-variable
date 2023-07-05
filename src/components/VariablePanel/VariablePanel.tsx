import React, { useEffect, useMemo, useState } from 'react';
import { css, cx } from '@emotion/css';
import { PanelProps } from '@grafana/data';
import { Alert, Tab, TabsBar, useTheme2 } from '@grafana/ui';
import { TestIds } from '../../constants';
import { useContentPosition, useScrollToSelected, useTable } from '../../hooks';
import { Styles } from '../../styles';
import { PanelOptions } from '../../types';
import { Table } from '../Table';

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
  const [currentGroup, setCurrentGroup] = useState(options.groups?.[0]?.name);

  /**
   * Current Levels
   */
  const currentLevels = useMemo(() => {
    if (options.groups?.length && currentGroup) {
      return options.groups.find((group) => group.name === currentGroup)?.items;
    }
    return;
  }, [options.groups, currentGroup]);

  /**
   * Change current group if was removed
   */
  useEffect(() => {
    if (!options.groups?.some((group) => group.name === currentGroup)) {
      setCurrentGroup(options.groups?.[0]?.name);
    }
  }, [currentGroup, options.groups]);

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
   * Scroll To Selected Element
   */
  const scrollElementRef = useScrollToSelected(tableData, options.autoScroll);

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
        <div style={style} className={styles.content} ref={scrollElementRef}>
          {options.groups?.length > 1 && (
            <TabsBar>
              {options.groups?.map((group) => (
                <Tab
                  key={group.name}
                  label={group.name}
                  onChangeTab={() => setCurrentGroup(group.name)}
                  active={currentGroup === group.name}
                  data-testid={TestIds.panel.tab(group.name)}
                />
              ))}
            </TabsBar>
          )}
          <Table columns={columns} data={tableData} getSubRows={getSubRows} showHeader={options.header} />
        </div>
      )}
    </div>
  );
};
