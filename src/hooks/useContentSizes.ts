import { useEffect, useRef, useState } from 'react';

import { PanelOptions, TableItem } from '../types';

/**
 * Content Sizes
 */
export const useContentSizes = ({
  tableData,
  height,
  options,
}: {
  tableData: TableItem[];
  height: number;
  options: PanelOptions;
}) => {
  /**
   * Refs
   */
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const tableHeaderRef = useRef<HTMLTableSectionElement>(null);

  /**
   * States
   */
  const [tableTopOffset, setTableTopOffset] = useState(0);

  /**
   * Calculate table offset
   */
  useEffect(() => {
    if (containerRef.current) {
      let topOffset = 0;
      if (headerRef.current) {
        topOffset += headerRef.current.clientHeight;
      }

      setTableTopOffset(topOffset);
    }
  }, [tableData, height, options.groups]);

  return { containerRef, headerRef, tableRef, tableHeaderRef, tableTopOffset };
};
