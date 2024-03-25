import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { useContentPosition } from './useContentPosition';

/**
 * In Test Ids
 */
const InTestIds = {
  scrollableElement: 'scrollable-element',
  container: 'container',
  content: 'content',
  grafanaVariablesSection: 'grafanaVariablesSection',
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
        }) as any
    );
    scrollableElement.getBoundingClientRect = jest.fn(
      () =>
        ({
          top: 100,
          height: 1000,
        }) as any
    );
    fireEvent.scroll(scrollableElement, { target: { scrollY: 100 } });

    expect(screen.getByTestId(InTestIds.content)).toHaveStyle({ transform: 'translateY(100px)' });
  });

  it('Should follow on scroll with grafana variables section', () => {
    render(
      <ScrollableContainer style={{ height: 1000 }}>
        <>
          <section
            aria-label="Dashboard submenu"
            data-testid={InTestIds.grafanaVariablesSection}
            style={{ height: 80, position: 'fixed' }}
          ></section>
          <Component width={200} height={200} sticky={true} />
        </>
      </ScrollableContainer>
    );

    const scrollableElement = screen.getByTestId(InTestIds.scrollableElement);
    const content = screen.getByTestId(InTestIds.content);
    const grafanaVariablesSection = screen.getByTestId(InTestIds.grafanaVariablesSection);

    expect(content).toHaveStyle({ transform: 'translateY(0px)' });

    content.getBoundingClientRect = jest.fn(
      () =>
        ({
          y: -100,
          height: 200,
        }) as any
    );
    scrollableElement.getBoundingClientRect = jest.fn(
      () =>
        ({
          top: 100,
          height: 1000,
        }) as any
    );
    grafanaVariablesSection.getBoundingClientRect = jest.fn(
      () =>
        ({
          bottom: 40,
          height: 200,
        }) as any
    );
    fireEvent.scroll(scrollableElement, { target: { scrollY: 100 } });

    expect(screen.getByTestId(InTestIds.content)).toHaveStyle({ transform: 'translateY(300px)' });
  });
});
