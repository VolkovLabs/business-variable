import { useEffect, useRef, useState } from 'react';
import { TableItem } from '../types';

export const useScrollToSelected = (tableData: TableItem[], autoScroll: boolean) => {
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  /**
   * Wait until table data is ready
   */
  useEffect(() => {
    if (scrollElementRef.current && !isScrolled && autoScroll) {
      /**
       * Find first checked input
       */
      const firstCheckedElement = scrollElementRef.current.querySelector('input:checked');

      /**
       * Find first checked row
       */
      const firstCheckedRow = firstCheckedElement?.closest('tr');
      if (firstCheckedRow) {
        const { top: parentTop } = scrollElementRef.current.getBoundingClientRect();
        const { top } = firstCheckedRow.getBoundingClientRect();

        /**
         * Scroll to first checked row
         */
        scrollElementRef.current.scrollTo({ top: top - parentTop });
        setIsScrolled(true);
      }
    }
  }, [autoScroll, isScrolled, tableData]);

  return scrollElementRef;
};
