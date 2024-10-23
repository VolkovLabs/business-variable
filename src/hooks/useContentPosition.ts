import { throttle } from 'lodash';
import { CSSProperties, RefObject, useLayoutEffect, useRef, useState } from 'react';

/**
 * Content Position
 */
export const useContentPosition = ({
  width,
  height,
  sticky,
  scrollableContainerRef,
}: {
  width: number;
  height: number;
  sticky: boolean;
  scrollableContainerRef: RefObject<HTMLDivElement>;
}) => {
  /**
   * Element ref
   */
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Dashboard refs
   */
  const dashboardScrollViewRef = useRef<HTMLDivElement | null>(null);
  const dashboardSubmenuRef = useRef<HTMLDivElement | null>(null);
  const dashboardVariablesContainer = useRef<HTMLElement | null | undefined>(null);

  /**
   * Content Element Styles
   */
  const [style, setStyle] = useState<CSSProperties>({
    width,
    height,
  });

  /**
   * Update state throttle to performance optimization
   */
  const updateStateThrottle = useRef(
    throttle((style: CSSProperties) => {
      setStyle(style);
    }, 100)
  );

  /**
   * Get dashboard submenu sticky rect
   */
  const getDashboardSubmenuStickyRect = () => {
    if (dashboardSubmenuRef.current) {
      const styles = getComputedStyle(dashboardSubmenuRef.current);
      const isSticky = styles.position === 'fixed' && styles.visibility !== 'hidden';

      if (isSticky) {
        return {
          enabled: true,
          height: dashboardSubmenuRef.current.clientHeight,
        };
      }
    }

    return {
      enabled: false,
      height: 0,
    };
  };

  useLayoutEffect(() => {
    /**
     * Set scrollbar view element
     * Several scrollbar view elements exist
     * We have to specify particular element
     */
    if (!dashboardScrollViewRef.current) {
      dashboardScrollViewRef.current = document.querySelector('.main-view .scrollbar-view');
    }

    /**
     * Set dashboard sub menu
     */
    if (!dashboardSubmenuRef.current) {
      dashboardSubmenuRef.current = document.querySelector('[aria-label="Dashboard submenu"]');
    }

    /**
     * Set dashboard controls
     */
    if (!dashboardVariablesContainer.current) {
      const variablesElement = document.querySelector('[data-testid="data-testid dashboard controls"]');
      dashboardVariablesContainer.current = variablesElement?.parentElement;
    }

    /**
     * Calculate Position
     */
    const calcPosition = () => {
      if (window && window.hasOwnProperty('__grafanaSceneContext')) {
        if (dashboardVariablesContainer?.current && containerRef.current) {
          if (sticky) {
            const { y: startY, height } = containerRef?.current?.getBoundingClientRect();

            /**
             * .bottom use as sum of variable container height and header menu height
             */
            const dashboardContentOffsetY = dashboardVariablesContainer?.current.getBoundingClientRect().bottom;
            const availableVisibleHeight = window.innerHeight - dashboardContentOffsetY;
            const relativeStartY = startY - dashboardContentOffsetY;

            const transformY = Math.abs(Math.min(relativeStartY, 0));

            const visibleHeightTest = availableVisibleHeight - startY + dashboardContentOffsetY;

            const calculateHeightTest = Math.min(
              Math.max(height - transformY, 0),
              relativeStartY < 0 ? availableVisibleHeight : visibleHeightTest
            );

            /**
             * Set styles directly to element to prevent flashing on scroll
             */
            if (scrollableContainerRef.current) {
              scrollableContainerRef.current.style.transform = `translateY(${transformY}px)`;
              scrollableContainerRef.current.style.height = `${calculateHeightTest}px`;
            }

            /**
             * Set styles
             */
            updateStateThrottle.current({
              height: calculateHeightTest,
              transform: `translateY(${transformY}px)`,
              width,
            });
            return;
          }
        }

        setStyle({
          width,
          height,
        });

        return;
      }

      if (containerRef.current && dashboardScrollViewRef.current) {
        if (sticky) {
          /**
           * Get dashboard submenu sticky rect
           */
          const dashboardSubmenuStickyRect = getDashboardSubmenuStickyRect();

          const { y: startY, height } = containerRef.current.getBoundingClientRect();

          const dashboardScrollViewRect = dashboardScrollViewRef.current.getBoundingClientRect();
          const dashboardContentOffsetY = dashboardScrollViewRect.top + dashboardSubmenuStickyRect.height;
          const relativeStartY = startY - dashboardContentOffsetY;
          const transformY = Math.abs(Math.min(relativeStartY, 0));
          const visibleHeight = dashboardScrollViewRect.height - startY + dashboardContentOffsetY;
          const calculateHeight = Math.min(
            Math.max(height - transformY, 0),
            relativeStartY < 0 ? dashboardScrollViewRect.height : visibleHeight
          );

          /**
           * Set styles directly to element to prevent flashing on scroll
           */
          if (scrollableContainerRef.current) {
            scrollableContainerRef.current.style.transform = `translateY(${transformY}px)`;
            scrollableContainerRef.current.style.height = `${calculateHeight}px`;
          }

          /**
           * Set styles
           */
          updateStateThrottle.current({
            height: calculateHeight,
            transform: `translateY(${transformY}px)`,
            width,
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
     * Listen for Scroll events in Scenes
     */
    if (window && window.hasOwnProperty('__grafanaSceneContext') && sticky) {
      document.addEventListener('scroll', calcPosition);

      return () => {
        document.removeEventListener('scroll', calcPosition);
      };
    }

    /**
     * Listen for Scroll events in non-Scenes
     */
    if (dashboardScrollViewRef.current && sticky && !window.hasOwnProperty('__grafanaSceneContext')) {
      dashboardScrollViewRef.current.addEventListener('scroll', calcPosition);

      return () => {
        dashboardScrollViewRef.current?.removeEventListener('scroll', calcPosition);
      };
    }

    return () => {};
  }, [containerRef, width, height, sticky, scrollableContainerRef]);

  return {
    containerRef,
    style,
  };
};
