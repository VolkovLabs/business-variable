import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useContentPosition } from './useContentPosition';

/**
 * In Test Ids
 */
const InTestIds = {
  scrollableElement: 'scrollable-element',
  container: 'container',
  content: 'content',
};

describe('Use Content Position', () => {
  /**
   * Tested Component
   */
  const Component = (props: { width: number; height: number; sticky: boolean }) => {
    const { containerRef, style } = useContentPosition(props);
    return (
      <div ref={containerRef} style={{ width: props.width, height: props.height }}>
        <div data-testid={InTestIds.content} style={style} />
      </div>
    );
  };

  /**
   * Scrollable Container
   */
  const ScrollableContainer = ({ children, style }: { children: React.ReactElement; style: React.CSSProperties }) => (
    <div className="main-view">
      <div className="scrollbar-view" data-testid={InTestIds.scrollableElement} style={style}>
        {children}
      </div>
    </div>
  );

  it('Should apply size on scroll', () => {
    render(
      <ScrollableContainer style={{ height: 1000 }}>
        <Component width={200} height={200} sticky={false} />
      </ScrollableContainer>
    );

    fireEvent.scroll(screen.getByTestId(InTestIds.scrollableElement), { target: { scrollY: 100 } });

    expect(screen.getByTestId(InTestIds.content)).toHaveStyle({ width: '200px', height: '200px' });
  });

  it('Should follow on scroll', () => {
    render(
      <ScrollableContainer style={{ height: 1000 }}>
        <Component width={200} height={200} sticky={true} />
      </ScrollableContainer>
    );

    const scrollableElement = screen.getByTestId(InTestIds.scrollableElement);
    const content = screen.getByTestId(InTestIds.content);

    expect(content).toHaveStyle({ transform: 'translateY(0px)' });

    content.getBoundingClientRect = jest.fn(
      () =>
        ({
          y: -100,
          height: 200,
        } as any)
    );
    scrollableElement.getBoundingClientRect = jest.fn(
      () =>
        ({
          top: 100,
          height: 1000,
        } as any)
    );
    fireEvent.scroll(scrollableElement, { target: { scrollY: 100 } });

    expect(screen.getByTestId(InTestIds.content)).toHaveStyle({ transform: 'translateY(100px)' });
  });
});
