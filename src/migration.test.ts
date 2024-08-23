import { FAVORITES_KEY } from './constants';
import { getMigratedOptions } from './migration';
import { DisplayMode, FavoritesStorage, PanelOptions } from './types';
import { createFavoritesConfig } from './utils';

/**
 * Local Storage
 */
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};

describe('Migration', () => {
  it('Should return panel options', () => {
    const options: Partial<PanelOptions> = {
      displayMode: DisplayMode.TABLE,
    };

    expect(
      getMigratedOptions({
        options: options,
      } as any)
    ).toEqual(expect.objectContaining(options));
  });

  it('Should enable label for minimizeView', () => {
    const options: Partial<PanelOptions> = {
      displayMode: DisplayMode.MINIMIZE,
    };

    expect(
      getMigratedOptions({
        options: options,
      } as any)
    ).toEqual(
      expect.objectContaining({
        ...options,
        showLabel: true,
      })
    );
  });

  it('Should keep defined showLabel for minimizeView', () => {
    const options: Partial<PanelOptions> = {
      displayMode: DisplayMode.MINIMIZE,
      showLabel: false,
    };

    expect(
      getMigratedOptions({
        options: options,
      } as any)
    ).toEqual(
      expect.objectContaining({
        ...options,
        showLabel: false,
      })
    );
  });

  describe('v3.3.0', () => {
    it('Should normalize favorites config', () => {
      expect(
        getMigratedOptions({
          options: {
            favorites: true,
          },
        } as any)
      ).toEqual(
        expect.objectContaining({
          favorites: createFavoritesConfig({
            enabled: true,
            storage: FavoritesStorage.BROWSER,
          }),
        })
      );
      expect(
        getMigratedOptions({
          options: {
            favorites: false,
          },
        } as any)
      ).toEqual(
        expect.objectContaining({
          favorites: createFavoritesConfig({
            enabled: false,
            storage: FavoritesStorage.BROWSER,
          }),
        })
      );
    });

    it('Should keep current favorites config', () => {
      expect(
        getMigratedOptions({
          options: {
            favorites: createFavoritesConfig({
              enabled: false,
              storage: FavoritesStorage.DATASOURCE,
            }),
          },
        } as any)
      ).toEqual(
        expect.objectContaining({
          favorites: createFavoritesConfig({
            enabled: false,
            storage: FavoritesStorage.DATASOURCE,
          }),
        })
      );
    });
  });

  describe('v3.4.0', () => {
    /**
     * Set Mock
     */
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    beforeEach(() => {
      jest.mocked(window.localStorage.getItem).mockClear();
      jest.mocked(window.localStorage.setItem).mockClear();
    });

    it('Should migrate old favorites from localStorage', () => {
      jest.mocked(window.localStorage.getItem).mockImplementation(() =>
        JSON.stringify({
          device: ['device1', 'device2'],
        })
      );

      getMigratedOptions({
        pluginVersion: '3.3.0',
        options: {},
      } as any);

      expect(window.localStorage.setItem).toHaveBeenCalledWith(FAVORITES_KEY, '{"device":["device1","device2"]}');
    });

    it('Should not call setItem if no values in favorites key', () => {
      jest.mocked(window.localStorage.getItem).mockImplementation(() => null);

      getMigratedOptions({
        pluginVersion: '3.3.0',
        options: {},
      } as any);

      expect(window.localStorage.setItem).not.toHaveBeenCalled();
    });
  });
});
