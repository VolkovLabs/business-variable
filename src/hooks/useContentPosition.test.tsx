import { fireEvent, render, screen } from '@testing-library/react';
import React, { useRef } from 'react';

import { useContentPosition } from './useContentPosition';

/**
 * In Test Ids
 */
const InTestIds = {
  scrollableElement: 'scrollable-element',
  dashboardControls: 'data-testid dashboard controls',
  dashboardControlsContainer: 'dashboard-controls-container',
  container: 'container',
  content: 'content',
  grafanaVariablesSection: 'grafanaVariablesSection',
};

describe('Use Content Position', () => {
  beforeEach(() => {
    /**
     * delete __grafanaSceneContext
     */
    delete window.__grafanaSceneContext;
  });

  /**
   * Tested Component
   */
  const Component = (props: { width: number; height: number; sticky: boolean; mockElement?: HTMLElement }) => {
    /**
     * Element ref
     */
    const scrollableContainerRef = useRef<HTMLDivElement | null>(null);

    const { containerRef, style } = useContentPosition({ ...props, scrollableContainerRef });
    return (
      <div ref={containerRef} data-testid={InTestIds.container} style={{ width: props.width, height: props.height }}>
        <div data-testid={InTestIds.content} ref={scrollableContainerRef} style={style} />
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

  /**
   * Scrollable Container
   */
  const MainViewContainer = ({ children, style }: { children: React.ReactElement; style: React.CSSProperties }) => (
    <div id="pageContent">
      <div style={style} data-testid={InTestIds.dashboardControlsContainer}>
        <div data-testid={InTestIds.dashboardControls}></div>
      </div>

      {children}
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

  it('Should apply sizes for scene dashboard', () => {
    window.__grafanaSceneContext = {
      body: {
        text: 'hello',
      },
    };

    render(
      <MainViewContainer style={{ height: 1000 }}>
        <Component width={250} height={250} sticky={false} />
      </MainViewContainer>
    );

    expect(screen.getByTestId(InTestIds.content)).toHaveStyle({ width: '250px', height: '250px' });
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

  it('Should follow on scroll for scene dashboard', () => {
    window.__grafanaSceneContext = {
      body: {
        text: 'hello',
      },
    };

    window.innerHeight = 750;

    render(
      <MainViewContainer style={{ height: 500 }}>
        <Component width={250} height={550} sticky={true} />
      </MainViewContainer>
    );

    const content = screen.getByTestId(InTestIds.content);
    const container = screen.getByTestId(InTestIds.container);
    const controlsContainer = screen.getByTestId(InTestIds.dashboardControlsContainer);

    expect(content).toHaveStyle({ transform: 'translateY(0px)' });
    expect(container).toBeVisible();
    expect(controlsContainer).toBeVisible();

    /**
     * Panel Container
     */
    container.getBoundingClientRect = jest.fn(
      () =>
        ({
          y: 50,
          height: 550,
        }) as any
    );

    /**
     * set visible offset
     */
    controlsContainer.getBoundingClientRect = jest.fn(
      () =>
        ({
          bottom: 220,
        }) as any
    );

    document.dispatchEvent(new Event('scroll'));
    expect(screen.getByTestId(InTestIds.content)).toHaveStyle({ width: '250px', height: '380px' });
  });

  it('Should follow on scroll for scene dashboard if startY return -startY', () => {
    window.__grafanaSceneContext = {
      body: {
        text: 'hello',
      },
    };

    window.innerHeight = 750;

    render(
      <MainViewContainer style={{ height: 500 }}>
        <Component width={250} height={550} sticky={true} />
      </MainViewContainer>
    );

    const content = screen.getByTestId(InTestIds.content);
    const container = screen.getByTestId(InTestIds.container);
    const controlsContainer = screen.getByTestId(InTestIds.dashboardControlsContainer);

    expect(content).toHaveStyle({ transform: 'translateY(0px)' });
    expect(container).toBeVisible();
    expect(controlsContainer).toBeVisible();

    /**
     * Panel Container
     */
    container.getBoundingClientRect = jest.fn(
      () =>
        ({
          y: -50,
          height: 550,
        }) as any
    );

    /**
     * set visible offset
     */
    controlsContainer.getBoundingClientRect = jest.fn(
      () =>
        ({
          bottom: 220,
        }) as any
    );

    document.dispatchEvent(new Event('scroll'));
    expect(screen.getByTestId(InTestIds.content)).toHaveStyle({ width: '250px', height: '280px' });
    expect(content).toHaveStyle({ transform: 'translateY(270px)' });
  });

  it('Should add a spacing if grafana variable section with fixed position', () => {
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

    /**
     * Set client height to variables section
     */
    Object.defineProperty(grafanaVariablesSection, 'clientHeight', {
      get() {
        return 80;
      },
    });

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

    expect(screen.getByTestId(InTestIds.content)).toHaveStyle({ transform: 'translateY(180px)' });
  });
});
