import { renderHook } from '@testing-library/react';

import { useAutoSave } from './useAutoSave';

/**
 * Mock timers
 */
jest.useFakeTimers();

describe('useAutoSave', () => {
  it('Should run callback by timer end', () => {
    const handler = jest.fn();

    const { result } = renderHook(() => useAutoSave());

    /**
     * Start timer
     */
    result.current.startTimer(handler);

    /**
     * Check if handler is not called
     */
    expect(handler).not.toHaveBeenCalled();

    /**
     * Simulate end of timer
     */
    jest.runOnlyPendingTimers();

    /**
     * Check if handler is called
     */
    expect(handler).toHaveBeenCalled();
  });

  it('Should re-create timer', () => {
    const handler = jest.fn();

    const { result } = renderHook(() => useAutoSave());

    /**
     * Start Timer
     */
    result.current.startTimer(handler);

    /**
     * Check if handler is not called
     */
    expect(handler).not.toHaveBeenCalled();

    /**
     * Start Another Timer
     */
    result.current.startTimer(handler);

    /**
     * Simulate end of timer
     */
    jest.runOnlyPendingTimers();

    /**
     * Check if timer is called only once
     */
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
