import { getDateInLocalTimeFormat } from './format';

describe('getDateInLocalTimeFormat', () => {
  it('formats date correctly for standard date', () => {
    const date = new Date('2025-01-09T00:00:00');
    expect(getDateInLocalTimeFormat(date)).toBe('2025-01-09');
  });

  it('Formats date correctly for end of month', () => {
    const date = new Date('2025-01-31T00:00:00');
    expect(getDateInLocalTimeFormat(date)).toBe('2025-01-31');
  });

  it('Formats date correctly for February in a leap year', () => {
    const date = new Date('2024-02-29T00:00:00');
    expect(getDateInLocalTimeFormat(date)).toBe('2024-02-29');
  });
});
