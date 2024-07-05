import { getActiveThresholdStyle } from './threshold';

describe('Threshold utils', () => {
  describe('getActiveThresholdStyle', () => {
    it('Should find active threshold', () => {
      const threshold90 = {
        value: 90,
        image: '90.png',
      };
      const threshold0 = {
        value: 0,
        image: '0.png',
      };
      const threshold50 = {
        value: 50,
        image: '50.png',
      };

      const thresholds = [threshold90, threshold0, threshold50];

      expect(getActiveThresholdStyle(30, thresholds)).toEqual(threshold0);
      expect(getActiveThresholdStyle(50, thresholds)).toEqual(threshold50);
      expect(getActiveThresholdStyle(91, thresholds)).toEqual(threshold90);
    });

    it('Should return fallback threshold', () => {
      expect(getActiveThresholdStyle(10, [])).toEqual({
        value: 0,
        image: '',
      });
    });
  });
});
