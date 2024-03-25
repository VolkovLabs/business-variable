import { CSSProperties, useLayoutEffect, useRef, useState } from 'react';

/**
 * Content Position
 */
export const useContentPosition = ({ width, height, sticky }: { width: number; height: number; sticky: boolean }) => {
  /**
   * Element ref
   */
  const containerRef = useRef<HTMLDivElement | null>(null);

  /**
   * Content Element Styles
   */
  const [style, setStyle] = useState<CSSProperties>({
    position: 'absolute',
    overflow: 'auto',
    width,
    height,
  });

  /**
   * Grafana variable section
   */
  const grafanaVariablesSection = () => {
    const grafanaSection = document.querySelector('[aria-label="Dashboard submenu"]');

    let bottomPosition = 0;
    let sectionHeight = 0;

    if (grafanaSection) {
      bottomPosition = grafanaSection.getBoundingClientRect().bottom;
      sectionHeight = grafanaSection.getBoundingClientRect().height;
    }

    return {
      isUseSection:
        !!grafanaSection &&
        getComputedStyle(grafanaSection).position === 'fixed' &&
        getComputedStyle(grafanaSection).visibility !== 'hidden',
      bottomPosition,
      sectionHeight,
    };
  };

  useLayoutEffect(() => {
    /**
     * Several scrollbar view elements exist
     * We have to specify particular element
     */
    const scrollableElement = document.querySelector('.main-view .scrollbar-view');

    /**
     * Calculate Position
     */
    const calcPosition = () => {
      if (containerRef.current && scrollableElement) {
        if (sticky) {
          /**
           * Use Grafana Section with variables
           */
          const { isUseSection, bottomPosition, sectionHeight } = grafanaVariablesSection();

          const { y: startY, height, top } = containerRef.current.getBoundingClientRect();

          const scrollableElementRect = scrollableElement.getBoundingClientRect();
          let transformY = Math.abs(Math.min(startY - scrollableElementRect.top, 0));

          /**
           * Calculate transformY with grafana variables section
           */
          if (isUseSection && top <= bottomPosition) {
            transformY = Math.abs(transformY + sectionHeight);
          }

          const visibleHeight = scrollableElementRect.height - startY + scrollableElementRect.top;

          setStyle({
            width,
            height: Math.min(
              Math.max(height - transformY, 0),
              startY < 0 ? scrollableElementRect.height : visibleHeight
            ),
            transform: `translateY(${transformY}px)`,
          });

          return;
        }

        setStyle({
          width,
          height,
        });
      }
    };

    calcPosition();

    /**
     * Listen for Scroll events
     */
    if (scrollableElement && sticky) {
      scrollableElement.addEventListener('scroll', calcPosition);

      return () => {
        scrollableElement.removeEventListener('scroll', calcPosition);
      };
    }

    return () => {};
  }, [containerRef, width, height, sticky]);

  return {
    containerRef,
    style,
  };
};
