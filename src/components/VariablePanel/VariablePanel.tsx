import React, { useEffect, useState } from 'react';
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
export const VariablePanel: React.FC<Props> = ({ options, data, width, height, eventBus }) => {
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

    return () => {
      subscriber.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Handle Selected State
   */
  const getMappingOptions = (runtimeVariable: RuntimeVariable | null, selectedItem?: string | null) => {
    if (!runtimeVariable || !selectedItem) {
      return;
    }

    const isSelectedAll = !!runtimeVariable.options.find((rt) => rt.value.includes('__all') && rt.selected === true);

    /**
     * Mapping
     */
    const mapping = runtimeVariable?.options.reduce((acc, opt, i) => {
      acc[opt.value] = {
        color: isSelectedAll || opt.selected ? theme.colors.secondary.main : theme.colors.background.primary,
        index: i,
        text: opt.text,
      };

      return acc;
    }, {} as Record<string, any>);

    return mapping;
  };

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
    const hasSelectedValue = runtimeVariable.options.find((opt) => opt.selected);

    /**
     * Value selected, but not defined in the URL
     */
    if (hasSelectedValue && !locationService.getSearchObject()[`var-${name}`]) {
      searchParams.push(hasSelectedValue.value);
      locationService.partial({ [`var-${name}`]: hasSelectedValue.value }, true);
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
  const updateVariableTable = () => {
    /**
     * Get Dashboard variables
     */
    const variables = getTemplateSrv().getVariables();
    if (!variables || !options.variables.length) {
      return;
    }

    /**
     * Filter selected variables
     */
    const runtimeVariables = variables.filter((dv) => options.variables.includes(dv.name)) as RuntimeVariable[];
    if (!runtimeVariables) {
      return;
    }

    /**
     * Get Max Count for Rows
     */
    const optionCounts = runtimeVariables.map((vr) => vr.options.length).sort();
    const maxCount = optionCounts[optionCounts.length - 1];

    const tableHeaders: Array<Record<string, any>> = [];
    const tableBody = [...Array(maxCount).keys()].map((x) => [] as RuntimeVariableTableBody[]);

    runtimeVariables.forEach((vr, i) => {
      const remainingOptions = maxCount - vr.options.length;

      let filledOptions = [];

      if (remainingOptions) {
        const remaningItems = Array(remainingOptions).fill({ value: null, text: '' });
        filledOptions = [...vr.options];
        filledOptions.push(...remaningItems);
      } else {
        filledOptions = [...vr.options];
      }

      tableHeaders.push({ name: vr.name, label: vr.label });

      filledOptions.map((fop, idx) => {
        tableBody[idx].splice(i, 0, {
          ...fop,
          onClick: fop.value === null ? null : () => locationService.partial({ [`var-${vr.id}`]: fop.value }),
        });
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
                const runtimeVariable = runtimeVariables.find((rt) => rt.id === name);
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
              options: getMappingOptions(runtimeVariables.find((rt) => rt.id === name) as any, name) as any,
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
  };

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
        <Alert data-testid={TestIds.panel.root} severity="info" title="Variable">
          Variable is not selected.
        </Alert>
      )}

      {tableData && <Table data={{ ...tableData }} height={height} width={width} resizable={true} />}
    </div>
  );
};
