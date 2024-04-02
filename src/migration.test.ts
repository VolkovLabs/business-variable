import { getMigratedOptions } from './migration';
import { DisplayMode, PanelOptions } from './types';

describe('Migration', () => {
  it('Should return panel options', () => {
    const options: Partial<PanelOptions> = {
      displayMode: DisplayMode.TABLE,
    };

    expect(
      getMigratedOptions({
        options: options,
      } as any)
    ).toEqual(options);
  });

  it('Should enable label for minimizeView', () => {
    const options: Partial<PanelOptions> = {
      displayMode: DisplayMode.MINIMIZE,
    };

    expect(
      getMigratedOptions({
        options: options,
      } as any)
    ).toEqual({
      ...options,
      showLabel: true,
    });
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
    ).toEqual({
      ...options,
      showLabel: false,
    });
  });
});
