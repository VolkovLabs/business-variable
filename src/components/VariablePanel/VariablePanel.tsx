import React, { useEffect, useState, useCallback } from 'react';
import { css, cx } from '@emotion/css';
import { applyFieldOverrides, FieldColorModeId, FieldType, MutableDataFrame, PanelProps } from '@grafana/data';
import { getTemplateSrv, locationService, RefreshEvent } from '@grafana/runtime';
import { Alert, Table, useTheme2 } from '@grafana/ui';
import { TestIds } from '../../constants';
import { Styles } from '../../styles';
import { PanelOptions, RuntimeVariable, RuntimeVariableTableBody } from '../../types';

/**
 * Properties
 */
interface Props extends PanelProps<PanelOptions> {}

/**
 * Panel
 */
export const VariablePanel: React.FC<Props> = ({ options, width, height, eventBus }) => {
  /**
   * Styles and Theme
   */
  const styles = Styles();
  const theme = useTheme2();

  /**
   * States
   */
  const [tableData, setTableData] = useState<any>(null);

  /**
   * Handle Selected State
   */
  const getMappingOptions = useCallback(
    (runtimeVariable: RuntimeVariable | null, selectedItem?: string | null) => {
      if (!runtimeVariable || !selectedItem) {
        return;
      }

      const isSelectedAll = !!runtimeVariable.options.find((rt) => rt.value.includes('__all') && rt.selected === true);

      /**
       * Mapping
       */
      return runtimeVariable?.options.reduce((acc, opt, i) => {
        acc[opt.value] = {
          color: isSelectedAll || opt.selected ? theme.colors.secondary.main : theme.colors.background.primary,
          index: i,
          text: opt.text,
        };

        return acc;
      }, {} as Record<string, any>);
    },
    [theme.colors.background.primary, theme.colors.secondary.main]
  );

  /**
   * On Click event
   */
  const onClick = (runtimeVariable: RuntimeVariable | undefined, name: string, selectedLocationState: string) => {
    if (!runtimeVariable) {
      return;
    }

    const { multi, includeAll } = runtimeVariable as any;

    /**
     * All is selected
     */
    if (includeAll && selectedLocationState?.toLowerCase()?.indexOf('all') === 0) {
      locationService.partial({ [`var-${name}`]: selectedLocationState }, true);
      return;
    }

    /**
     * Select a single value if multi select is not enabled
     */
    if (!multi) {
      locationService.partial({ [`var-${name}`]: selectedLocationState }, true);
      return;
    }

    /**
     * Search
     */
    const searchParams = locationService
      .getSearch()
      .getAll(`var-${name}`)
      .filter((s) => s.toLowerCase().indexOf('all') !== 0);

    /**
     * Check if any already selected
     */
    const selectedValue = runtimeVariable.options.find((opt) => opt.selected);

    /**
     * Value selected, but not defined in the URL
     */
    if (selectedValue && !locationService.getSearchObject()[`var-${name}`]) {
      searchParams.push(selectedValue.value);
      locationService.partial({ [`var-${name}`]: selectedValue.value }, true);
    }

    /**
     * Already selected value
     */
    if (searchParams.length >= 1) {
      const isSelected = searchParams.includes(selectedLocationState);

      if (!isSelected) {
        locationService.partial({ [`var-${name}`]: [...searchParams, selectedLocationState] }, true);
        return;
      }

      locationService.partial(
        {
          [`var-${name}`]: searchParams.filter((sp) => sp !== selectedLocationState),
        },
        true
      );
    }
  };

  /**
   * Update Variable Table
   */
  const updateVariableTable = useCallback(() => {
    /**
     * Get Dashboard variables
     */
    const variables = getTemplateSrv().getVariables();
    if (!variables || !options.variable) {
      return;
    }

    /**
     * Current variables
     */
    const currentVariables = variables.filter((dv) => options.variable === dv.name) as RuntimeVariable[];
    const tableHeaders: Array<Record<string, any>> = [];
    const tableBody: RuntimeVariableTableBody[][] = [];

    /**
     * Fill Table with options
     */
    currentVariables.forEach((vr) => {
      tableHeaders.push({ name: vr.name, label: vr.label });
      vr.options.forEach((fop) => {
        tableBody.push([fop]);
      });
    });

    /**
     * Data
     */
    const data = new MutableDataFrame({
      fields: tableHeaders.map(({ name, label }) => ({
        name: label || name,
        type: FieldType.string,
        values: [],
        config: {
          links: [
            {
              title: `Update ${name}`,
              url: '',
              onClick: (dataLink) => {
                const runtimeVariable = currentVariables.find((rt) => rt.id === name);
                onClick(runtimeVariable, name, dataLink.e?.target?.innerText);
              },
            },
          ],
          custom: {
            displayMode: 'color-background-solid',
            color: { mode: FieldColorModeId.Fixed, fixedColor: theme.colors.background.primary },
            filterable: true,
          },
          mappings: [
            {
              type: 'value' as any,
              options: getMappingOptions(currentVariables.find((rt) => rt.id === name) || null, name) as any,
            },
          ],
        },
      })),
    });

    /**
     * Add Rows
     */
    tableBody.forEach((td) => data.appendRow(td.map((t) => t.text)));

    /**
     * Apply Overrides for Mappings
     */
    const tableDataFrame = applyFieldOverrides({
      data: [data],
      fieldConfig: {
        overrides: [],
        defaults: {},
      },
      theme,
      replaceVariables: (value: string) => value,
    });

    setTableData(tableDataFrame[0]);
  }, [getMappingOptions, options.variable, theme]);

  /**
   * Set Table on Load
   */
  useEffect(() => {
    updateVariableTable();

    /**
     * On Refresh
     */
    const subscriber = eventBus.getStream(RefreshEvent).subscribe(() => {
      updateVariableTable();
    });

    /**
     * Unsubscribe
     */
    return () => {
      subscriber.unsubscribe();
    };
  }, [eventBus, updateVariableTable]);

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
      {!tableData && (
        <Alert data-testid={TestIds.panel.infoMessage} severity="info" title="Variable">
          Variable is not selected.
        </Alert>
      )}

      {tableData && <Table data={{ ...tableData }} height={height} width={width} resizable={true} />}
    </div>
  );
};
