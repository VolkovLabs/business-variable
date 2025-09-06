import { act, renderHook } from '@testing-library/react';

import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  const key = 'testKey';
  const version = 1;

  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  it('Should return undefined if no data in localStorage', async () => {
    const { result } = renderHook(() => useLocalStorage(key, version));
    const data = await result.current.get();
    expect(data).toBeUndefined();
  });

  it('Should return undefined if version mismatch', async () => {
    localStorage.setItem(key, JSON.stringify({ version: 999, data: { hello: 'world' } }));

    const { result } = renderHook(() => useLocalStorage(key, version));
    const data = await result.current.get();
    expect(data).toBeUndefined();
  });

  it('Should return data if version matches', async () => {
    const storedData = { hello: 'world' };
    localStorage.setItem(key, JSON.stringify({ version, data: storedData }));

    const { result } = renderHook(() => useLocalStorage(key, version));
    const data = await result.current.get();
    expect(data).toEqual(storedData);
  });

  it('Should save and return data', async () => {
    const { result } = renderHook(() => useLocalStorage(key, version));
    const newData = { name: 'test' };

    let updatedData;
    await act(async () => {
      updatedData = await result.current.update(newData);
    });

    expect(updatedData).toEqual(newData);

    const storedRaw = localStorage.getItem(key);
    expect(storedRaw).not.toBeNull();

    const stored = JSON.parse(storedRaw!);
    expect(stored).toEqual({ version, data: newData });
  });
});
