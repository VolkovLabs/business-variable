import React, { useEffect, useState } from 'react';
import { css, cx } from '@emotion/css';
import { applyFieldOverrides, FieldColorModeId, FieldType, MutableDataFrame, PanelProps } from '@grafana/data';
import { getTemplateSrv, locationService, RefreshEvent } from '@grafana/runtime';
import { Table, useTheme2 } from '@grafana/ui';
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
   * Update table if variable selected
   */
  useEffect(() => {
    formatVariableForTableBody();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  /**
   * ?
   */
  useEffect(() => {
    const subscriber = eventBus.getStream(RefreshEvent).subscribe(() => {
      formatVariableForTableBody();

      /**
       * Check variables
       */
      const variables = getDashboardVariables();
      if (variables) {
        const selectedVariables = variables.filter((v) => v.options.find((o) => o.selected === true));
        const variableNames = selectedVariables.map((v) => v.name);

        /**
         * Check URL
         */
        const locationNames = Object.keys(locationService.getSearchObject())
          .filter((l) => l !== 'orgId')
          .map((l) => l.replace('var-', '').trim());
        const missingVariables = variableNames.filter((v) => !locationNames.includes(v));

        /**
         * Missing
         */
        const missingFields = selectedVariables
          .filter((l) => missingVariables.includes(l.name))
          .filter((l) => l.options.find((o) => o.selected === true && o.value.includes('$__all')));

        missingFields.map((vr) => {
          const selectedOption = vr.options.find((o) => o.selected === true);
          handleLocationStateChange(vr, vr.name || '', selectedOption?.text || '');
        });
      }
    });

    return () => {
      subscriber.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventBus]);

  /**
   * Handle Selected State
   */
  const handleSelectedState = (runtimeVariable: RuntimeVariable | null, selectedItem?: string | null) => {
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
   * Handle Location State Change
   */
  const handleLocationStateChange = (
    runtimeVariable: RuntimeVariable | undefined,
    name: string,
    selectedLocationState: string
  ) => {
    if (!runtimeVariable) {
      return;
    }

    const { multi, includeAll } = runtimeVariable as any;

    /**
     * Include All
     */
    if (includeAll && selectedLocationState?.toLowerCase()?.indexOf('all') === 0) {
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
     * Multiselect
     */
    if (multi) {
      const hasSelectedValue = runtimeVariable.options.find((opt) => opt.selected === true);

      /**
       * Selected
       */
      if (hasSelectedValue && !locationService.getSearchObject()[`var-${name}`]) {
        searchParams.push(hasSelectedValue.value);
        locationService.partial({ [`var-${name}`]: hasSelectedValue.value }, true);
      }

      if (searchParams.length >= 1) {
        const isSelected = searchParams.includes(selectedLocationState);

        if (isSelected) {
          locationService.partial(
            {
              [`var-${name}`]: searchParams.filter((sp) => sp !== selectedLocationState),
            },
            true
          );
          return;
        } else {
          locationService.partial({ [`var-${name}`]: [...searchParams, selectedLocationState] }, true);
          return;
        }
      }
    }

    locationService.partial({ [`var-${name}`]: selectedLocationState }, true);
  };

  /**
   * Get Dashboard variables
   */
  const getDashboardVariables = () => {
    const variables = getTemplateSrv().getVariables();
    if (!variables || !options.variables.length) {
      return;
    }

    /**
     * Filter selected variables
     */
    const filtered = variables.filter((dv) => options.variables.includes(dv.name)) as RuntimeVariable[];
    return filtered;
  };

  /**
   * Format Variables
   */
  const formatVariableForTableBody = () => {
    const runtimeVariables = getDashboardVariables();
    if (!runtimeVariables) {
      return;
    }

    const optionCounts = runtimeVariables.map((vr) => vr.options.length).sort();
    const maxCount = optionCounts[optionCounts.length - 1];

    const tableHeaders: Array<Record<string, any>> = [];
    const tableBody = [...Array(maxCount).keys()].map((x) => [] as RuntimeVariableTableBody[]);

    for (let i = 0; i < runtimeVariables.length; i++) {
      const vr = runtimeVariables[i];

      const remainingOptions = maxCount - vr.options.length;

      let filledOptions = [];

      if (remainingOptions !== 0) {
        const remaningItems = Array(remainingOptions).fill({ value: null, text: '' });
        filledOptions = [...vr.options];
        filledOptions.push(...remaningItems);
      } else {
        filledOptions = [...vr.options];
      }

      tableHeaders.push({ name: vr.name, label: (vr as any)?.allValue || vr.label });

      filledOptions.map((fop, idx) => {
        tableBody[idx].splice(i, 0, {
          ...fop,
          onClick: fop.value === null ? null : () => locationService.partial({ [`var-${vr.id}`]: fop.value }),
        });
      });
    }

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
              title: `Variable  - ${name}`,
              url: '',
              onClick: ({ e }: { e?: any }) => {
                const runtimeVariable = runtimeVariables.find((rt) => rt.id === name);
                handleLocationStateChange(runtimeVariable, name, e?.target?.innerText);
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
              options: handleSelectedState(runtimeVariables.find((rt) => rt.id === name) as any, name) as any,
            },
          ],
        },
      })),
    });

    /**
     * Add Rows
     */
    tableBody.forEach((td) => data.appendRow(td.map((t) => t.text)));

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
      className={cx(
        styles.wrapper,
        css`
          width: ${width}px;
          height: ${height}px;
        `
      )}
    >
      {tableData && <Table data={{ ...tableData }} height={height} width={width} resizable={true} />}
    </div>
  );
};
