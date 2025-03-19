import { EventBus } from '@grafana/data';
import { throttle } from 'lodash';
import { CSSProperties, RefObject, useLayoutEffect, useRef, useState } from 'react';

import { DashboardPanelsChangedEvent } from '../types';

/**
 * Content Position
 */
export const useContentPosition = ({
  width,
  height,
  sticky,
  scrollableContainerRef,
  eventBus,
}: {
  width: number;
  height: number;
  sticky: boolean;
  eventBus: EventBus;
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
  const dashboardHeaderContainer = useRef<HTMLElement | null | undefined>(null);

  /**
   * Main dashboard container since v.11.3.0
   */
  const mainDashboard = useRef<HTMLDivElement | null>(null);

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
     * Set main dashboard container
     *
     */
    if (!mainDashboard.current) {
      mainDashboard.current = document.querySelector('.main-view');
    }

    /**
     * Set dashboard controls (variables line; refresh; time picker -  sticky from 10.3)
     */
    if (!dashboardVariablesContainer.current) {
      const variablesElement = document.querySelector('[data-testid="data-testid dashboard controls"]');
      dashboardVariablesContainer.current = variablesElement?.parentElement;
    }

    /**
     * Set dashboard header (menu; breadcrumbs -  sticky from 10.3)
     */
    if (!dashboardHeaderContainer.current) {
      dashboardHeaderContainer.current = document.querySelector('header');
    }

    /**
     * Calculate Position
     */
    const calcPosition = () => {
      if (window && window.hasOwnProperty('__grafanaSceneContext')) {
        if (containerRef.current && sticky) {
          const { y: startY, height } = containerRef?.current?.getBoundingClientRect();

          /**
           * .bottom use as sum of variable container height and header menu height.
           * If controls are hidden, use only header content
           */
          let headerContent = 0;
          if (dashboardHeaderContainer?.current) {
            headerContent = dashboardHeaderContainer?.current.getBoundingClientRect().height;
          }
          const dashboardContentOffsetY = dashboardVariablesContainer?.current
            ? dashboardVariablesContainer?.current.getBoundingClientRect().bottom
            : headerContent;

          const availableVisibleHeight = window.innerHeight - dashboardContentOffsetY;
          const relativeStartY = startY - dashboardContentOffsetY;

          const transformY = Math.abs(Math.min(relativeStartY, 0));
          const visibleHeight = availableVisibleHeight - startY + dashboardContentOffsetY;

          const calculateHeight = Math.min(
            Math.max(height - transformY, 0),
            relativeStartY < 0 ? availableVisibleHeight : visibleHeight
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

        return;
      }

      if (containerRef.current && dashboardScrollViewRef.current && !window.hasOwnProperty('__grafanaSceneContext')) {
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
      /**
       * Add resize observer to main
       * Call calculation if panels inside control panel were changed without scrolling
       */
      const resizeObserver = new ResizeObserver(() => {
        calcPosition();
      });

      if (mainDashboard.current) {
        resizeObserver.observe(mainDashboard.current);
      }

      document.addEventListener('scroll', calcPosition);

      return () => {
        document.removeEventListener('scroll', calcPosition);
        resizeObserver.disconnect();
      };
    }

    /**
     * Listen for Scroll events in non-Scenes
     */
    if (dashboardScrollViewRef.current && sticky && !window.hasOwnProperty('__grafanaSceneContext')) {
      /**
       * subscribe on Panels change event
       * It is necessary to wait until the current container dimensions and positions are received after the event is called.
       */
      const subscription = eventBus.subscribe(DashboardPanelsChangedEvent, () => {
        setTimeout(() => {
          calcPosition();
        }, 150);
      });

      dashboardScrollViewRef.current.addEventListener('scroll', calcPosition);

      return () => {
        dashboardScrollViewRef.current?.removeEventListener('scroll', calcPosition);
        subscription.unsubscribe();
      };
    }

    return () => {};
  }, [containerRef, width, height, sticky, scrollableContainerRef, eventBus]);

  return {
    containerRef,
    style,
  };
};
