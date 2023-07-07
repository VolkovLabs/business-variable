import { RefObject, useCallback } from 'react';

/**
 * Scroll to Selected
 */
export const useScrollToSelected = ({
  autoScroll,
  containerRef,
}: {
  autoScroll: boolean;
  containerRef: RefObject<HTMLDivElement>;
}) => {
  /**
   * Wait until table data is ready
   */
  return useCallback(
    (toElement: HTMLElement, stickyContentHeight = 0) => {
      if (containerRef.current && autoScroll) {
        const { top: parentTop } = containerRef.current.getBoundingClientRect();
        const { top } = toElement.getBoundingClientRect();

        /**
         * Scroll to first checked row
         */
        const scrollTop = top + containerRef.current.scrollTop - parentTop;
        const scrollTopWithWithOffset = scrollTop - stickyContentHeight;
        containerRef.current.scrollTo({
          top: scrollTopWithWithOffset > 0 ? scrollTopWithWithOffset : scrollTop + stickyContentHeight,
        });
      }
    },
    [autoScroll, containerRef]
  );
};
