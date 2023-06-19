import React, { useEffect, useState, useCallback } from 'react';
import { css, cx } from '@emotion/css';
import {
  applyFieldOverrides,
  DataFrame,
  FieldColorModeId,
  FieldType,
  MutableDataFrame,
  PanelProps,
} from '@grafana/data';
import { getTemplateSrv, locationService, RefreshEvent } from '@grafana/runtime';
import { Alert, Table, useTheme2 } from '@grafana/ui';
import { TestIds } from '../../constants';
import { Styles } from '../../styles';
import { PanelOptions, RuntimeVariable, RuntimeVariableOption } from '../../types';

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
  const [tableData, setTableData] = useState<DataFrame | null>(null);

  /**
   * Handle Selected State
   */
  const getMappingOptions = useCallback(
    (runtimeVariable: RuntimeVariable | null, selectedItem?: string | null) => {
      if (!runtimeVariable || !selectedItem) {
        return;
      }

      /**
       * Check if selected All
       */
      const isSelectedAll = !!runtimeVariable.options.find((rt) => rt.value.includes('__all') && rt.selected === true);

      /**
       * Mapping
       */
      return runtimeVariable?.options.reduce((acc, opt, i) => {
        acc[opt.text] = {
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

    /**
     * All is selected
     */
    if (runtimeVariable.includeAll && !selectedLocationState?.toLowerCase()?.indexOf('all')) {
      locationService.partial({ [`var-${name}`]: selectedLocationState }, true);
      return;
    }

    /**
     * Select a single value if multi select is not enabled
     */
    if (!runtimeVariable.multi) {
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
    const selectedValues = runtimeVariable.options.filter((opt) => opt.selected).map((opt) => opt.text);

    /**
     * Value selected, but not defined in the URL
     */
    if (selectedValues.length && !locationService.getSearchObject()[`var-${name}`]) {
      searchParams.push(...selectedValues);
      locationService.partial({ [`var-${name}`]: [...selectedValues] }, true);
    }

    /**
     * All was selected, changing to the value
     */
    if (runtimeVariable.includeAll && selectedValues.find((opt) => opt.toLowerCase() === 'all')) {
      locationService.partial({ [`var-${name}`]: selectedLocationState }, true);
      return;
    }

    /**
     * Already selected value in multi-value
     */
    if (searchParams.length >= 1) {
      const isSelected = searchParams.includes(selectedLocationState);

      /**
       * Select more
       */
      if (!isSelected) {
        locationService.partial({ [`var-${name}`]: [...searchParams, selectedLocationState] }, true);
        return;
      }

      /**
       * Remove from selected
       */
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
    const tableBody: RuntimeVariableOption[][] = [];

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
    const dataFrame = applyFieldOverrides({
      data: [data],
      fieldConfig: {
        overrides: [],
        defaults: {},
      },
      theme,
      replaceVariables: (value: string) => value,
    });

    setTableData(dataFrame[0]);
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
