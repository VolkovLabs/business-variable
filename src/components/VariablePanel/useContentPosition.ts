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
          const transformY = Math.abs(Math.min(startY - scrollableElement.getBoundingClientRect().top, 0));

          setStyle({
            width,
            height: Math.max(height - transformY, 0),
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
