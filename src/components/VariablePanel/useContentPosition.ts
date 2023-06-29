import { useRef, useState, CSSProperties, useLayoutEffect } from 'react';

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

  useLayoutEffect(() => {
    const scrollableElement = document.querySelector('.scrollbar-view');

    const calcPosition = () => {
      if (containerRef.current && scrollableElement) {
        if (sticky) {
          const { y: startY, height } = containerRef.current.getBoundingClientRect();
          const scrollableElementRect = scrollableElement.getBoundingClientRect();
          const transformY = Math.abs(Math.min(startY - scrollableElementRect.top, 0));
          const visibleHeight = scrollableElementRect.height - startY + scrollableElementRect.top;

          setStyle({
            width,
            height: Math.min(Math.max(height - transformY, 0), visibleHeight),
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
