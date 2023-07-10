import { RefObject, useCallback } from 'react';

/**
 * Scroll To
 */
export const useScrollTo = ({ containerRef }: { containerRef: RefObject<HTMLDivElement> }) => {
  return useCallback(
    (toElement: HTMLElement, stickyContentHeight = 0) => {
      if (containerRef.current) {
        const { top: parentTop } = containerRef.current.getBoundingClientRect();
        const { top } = toElement.getBoundingClientRect();

        /**
         * Element Top
         */
        const scrollTop = top + containerRef.current.scrollTop - parentTop;

        /**
         * Scroll top without sticky content
         */
        const scrollTopWithoutStickyContent = scrollTop - stickyContentHeight;

        /**
         * Scroll container
         */
        containerRef.current.scrollTo({
          top: scrollTopWithoutStickyContent >= 0 ? scrollTopWithoutStickyContent : scrollTop,
        });
      }
    },
    [containerRef]
  );
};
