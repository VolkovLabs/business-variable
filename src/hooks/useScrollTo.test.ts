import { renderHook } from '@testing-library/react';
import { useScrollTo } from './useScrollTo';

describe('Use Scroll To', () => {
  it('Should scroll to element position', () => {
    const scrollTo = jest.fn();
    const { result } = renderHook(() =>
      useScrollTo({
        containerRef: {
          current: {
            scrollTop: 0,
            scrollTo,
            getBoundingClientRect: () => ({
              top: 0,
            }),
          },
        } as any,
      })
    );

    result.current({
      getBoundingClientRect: () => ({
        top: 40,
      }),
    } as any);

    expect(scrollTo).toHaveBeenCalledWith({
      top: 40,
    });
  });

  it('Should scroll to element position with current scroll position', () => {
    const scrollTo = jest.fn();
    const { result } = renderHook(() =>
      useScrollTo({
        containerRef: {
          current: {
            scrollTop: 20,
            scrollTo,
            getBoundingClientRect: () => ({
              top: 0,
            }),
          },
        } as any,
      })
    );

    result.current({
      getBoundingClientRect: () => ({
        top: 40,
      }),
    } as any);

    expect(scrollTo).toHaveBeenCalledWith({
      top: 60,
    });
  });

  it('Should scroll to element position if content is not sticky yet', () => {
    const scrollTo = jest.fn();
    const { result } = renderHook(() =>
      useScrollTo({
        containerRef: {
          current: {
            scrollTop: 0,
            scrollTo,
            getBoundingClientRect: () => ({
              top: 0,
            }),
          },
        } as any,
      })
    );

    result.current(
      {
        getBoundingClientRect: () => ({
          top: 0,
        }),
      } as any,
      40
    );

    expect(scrollTo).toHaveBeenCalledWith({
      top: 0,
    });

    result.current(
      {
        getBoundingClientRect: () => ({
          top: 20,
        }),
      } as any,
      40
    );

    expect(scrollTo).toHaveBeenCalledWith({
      top: 20,
    });
  });
});
