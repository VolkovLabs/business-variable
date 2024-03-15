import { renderHook } from '@testing-library/react';

import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    // Clear the localStorage mock before each test
    localStorage.clear();
  });

  it('should remove item from localStorage', () => {
    const key = 'testKey';
    const { result } = renderHook(() => useLocalStorage(key));

    const removeItemMock = jest.spyOn(window.localStorage.__proto__, 'removeItem');

    result.current.remove();
    expect(removeItemMock).toHaveBeenCalledWith(key);
  });

  it('should get item from localStorage', () => {
    const key = 'testKey';
    const { result } = renderHook(() => useLocalStorage(key));

    const getItemMock = jest.spyOn(window.localStorage.__proto__, 'getItem');

    result.current.get();
    expect(getItemMock).toHaveBeenCalledWith(key);
  });

  it('should set item from localStorage', () => {
    const key = 'testKey';
    const testValue = 'testValue';
    const { result } = renderHook(() => useLocalStorage(key));

    const setItemMock = jest.spyOn(window.localStorage.__proto__, 'setItem');

    result.current.update(testValue);
    expect(setItemMock).toHaveBeenCalledWith(key, testValue);
  });
});
