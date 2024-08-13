import { getMigratedOptions } from './migration';
import { DisplayMode, FavoritesStorage, PanelOptions } from './types';

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
          favorites: {
            enabled: true,
            storage: FavoritesStorage.BROWSER,
          },
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
          favorites: {
            enabled: false,
            storage: FavoritesStorage.BROWSER,
          },
        })
      );
    });

    it('Should keep current favorites config', () => {
      expect(
        getMigratedOptions({
          options: {
            favorites: {
              enabled: false,
              storage: FavoritesStorage.DATASOURCE,
            },
          },
        } as any)
      ).toEqual(
        expect.objectContaining({
          favorites: {
            enabled: false,
            storage: FavoritesStorage.DATASOURCE,
          },
        })
      );
    });
  });
});
