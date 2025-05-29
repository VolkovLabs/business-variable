import { getBackendSrv } from '@grafana/runtime';

import { FAVORITES_KEY } from './constants';
import { getMigratedOptions } from './migration';
import { DisplayMode, FavoritesStorage, PanelOptions } from './types';
import { createFavoritesConfig } from './utils';

/**
 * Mock @grafana/runtime
 */
jest.mock('@grafana/runtime', () => ({
  getBackendSrv: jest.fn(),
}));

/**
 * Local Storage
 */
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};

describe('Migration', () => {
  beforeEach(() => {
    jest.mocked(getBackendSrv).mockImplementation(
      () =>
        ({
          get: jest.fn(() => [
            {
              name: 'Datasource 1',
              uid: 'ds1',
            },
            {
              name: 'Datasource 2',
              uid: 'ds2',
            },
            {
              name: 'Datasource 3',
              uid: 'ds3',
            },
            {
              name: 'Datasource 4',
              uid: 'ds4',
            },
            {
              name: 'Datasource 5',
              uid: 'ds5',
            },
          ]),
        }) as any
    );
  });

  it('Should return panel options', async () => {
    const options: Partial<PanelOptions> = {
      displayMode: DisplayMode.TABLE,
    };

    expect(
      await getMigratedOptions({
        options: options,
      } as any)
    ).toEqual(expect.objectContaining(options));
  });

  it('Should enable label for minimizeView', async () => {
    const options: Partial<PanelOptions> = {
      displayMode: DisplayMode.MINIMIZE,
    };

    expect(
      await getMigratedOptions({
        options: options,
      } as any)
    ).toEqual(
      expect.objectContaining({
        ...options,
        showLabel: true,
      })
    );
  });

  it('Should keep defined showLabel for minimizeView', async () => {
    const options: Partial<PanelOptions> = {
      displayMode: DisplayMode.MINIMIZE,
      showLabel: false,
    };

    expect(
      await getMigratedOptions({
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
    it('Should normalize favorites config', async () => {
      expect(
        await getMigratedOptions({
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
        await getMigratedOptions({
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

    it('Should keep current favorites config', async () => {
      expect(
        await getMigratedOptions({
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

    it('Should migrate old favorites from localStorage', async () => {
      jest.mocked(window.localStorage.getItem).mockImplementation(() =>
        JSON.stringify({
          device: ['device1', 'device2'],
        })
      );

      await getMigratedOptions({
        pluginVersion: '3.3.0',
        options: {},
      } as any);

      expect(window.localStorage.setItem).toHaveBeenCalledWith(FAVORITES_KEY, '{"device":["device1","device2"]}');
    });

    it('Should migrate old favorites from localStorage when no version specified', async () => {
      jest.mocked(window.localStorage.getItem).mockImplementation(() =>
        JSON.stringify({
          device: ['device1', 'device2'],
        })
      );

      await getMigratedOptions({
        options: {},
      } as any);

      expect(window.localStorage.setItem).toHaveBeenCalledWith(FAVORITES_KEY, '{"device":["device1","device2"]}');
    });

    it('Should not call setItem if no values in favorites key', async () => {
      jest.mocked(window.localStorage.getItem).mockImplementation(() => null);

      await getMigratedOptions({
        pluginVersion: '3.3.0',
        options: {},
      } as any);

      expect(window.localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('v3.7.0', () => {
    it('Should update datasource to uid instead name', async () => {
      const options: Partial<PanelOptions> = {
        displayMode: DisplayMode.MINIMIZE,
        favorites: createFavoritesConfig({
          enabled: false,
          datasource: 'Datasource 1',
          storage: FavoritesStorage.BROWSER,
        }),
      };

      expect(
        await getMigratedOptions({
          options: options,
        } as any)
      ).toEqual(
        expect.objectContaining({
          displayMode: DisplayMode.MINIMIZE,
          favorites: expect.objectContaining({
            datasource: 'ds1',
          }),
        })
      );
    });

    describe('Advanced browser options', () => {
      it('Should update advanced options for browser title without plugin version', async () => {
        const options: Partial<PanelOptions> = {
          displayMode: DisplayMode.MINIMIZE,
          favorites: createFavoritesConfig({
            enabled: false,
            datasource: 'Datasource 1',
            storage: FavoritesStorage.BROWSER,
          }),
        };

        expect(
          await getMigratedOptions({
            options: options,
          } as any)
        ).toEqual(
          expect.objectContaining({
            displayMode: DisplayMode.MINIMIZE,
            browserTabNamePattern: '',
          })
        );
      });

      it('Should update advanced options for browser title with plugin version', async () => {
        const options: Partial<PanelOptions> = {
          displayMode: DisplayMode.MINIMIZE,
          favorites: createFavoritesConfig({
            enabled: false,
            datasource: 'Datasource 1',
            storage: FavoritesStorage.BROWSER,
          }),
        };

        expect(
          await getMigratedOptions({
            pluginVersion: '3.3.0',
            options: options,
          } as any)
        ).toEqual(
          expect.objectContaining({
            displayMode: DisplayMode.MINIMIZE,
            browserTabNamePattern: '',
          })
        );
      });

      it('Should not update advanced options for browser title if already present', async () => {
        const options: Partial<PanelOptions> = {
          displayMode: DisplayMode.MINIMIZE,
          browserTabNamePattern: '${title}',
        };

        expect(
          await getMigratedOptions({
            options: options,
          } as any)
        ).toEqual(
          expect.objectContaining({
            displayMode: DisplayMode.MINIMIZE,
            browserTabNamePattern: '${title}',
          })
        );
      });
    });
  });

  describe('v4.0.0', () => {
    it('Should update selectedValues options if not specified', async () => {
      const options: Partial<PanelOptions> = {
        displayMode: DisplayMode.TABLE,
        selectedValues: undefined,
      };

      expect(
        await getMigratedOptions({
          pluginVersion: '3.3.0',
          options: options,
        } as any)
      ).toEqual(
        expect.objectContaining({
          displayMode: DisplayMode.TABLE,
          selectedValues: {
            maxCount: 0,
            showSelected: false,
          },
        })
      );
    });

    it('Should not update selectedValues options if specified', async () => {
      const options: Partial<PanelOptions> = {
        displayMode: DisplayMode.TABLE,
        selectedValues: {
          showSelected: true,
          maxCount: 1,
        },
      };

      expect(
        await getMigratedOptions({
          pluginVersion: '3.3.0',
          options: options,
        } as any)
      ).toEqual(
        expect.objectContaining({
          displayMode: DisplayMode.TABLE,
          selectedValues: {
            showSelected: true,
            maxCount: 1,
          },
        })
      );
    });
  });
});
