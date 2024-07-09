import { StatusStyleThreshold } from '../types';

/**
 * Get active threshold style
 * @param value
 * @param thresholds
 */
export const getActiveThresholdStyle = (value: number, thresholds: StatusStyleThreshold[]): StatusStyleThreshold => {
  if (!thresholds || thresholds.length === 0) {
    return { value: 0, image: '' };
  }

  /**
   * Sort thresholds from low to high
   */
  const sortedThresholds = [...thresholds];
  sortedThresholds.sort((a, b) => (a.value > b.value ? 1 : -1));

  let active = sortedThresholds[0];

  for (const threshold of sortedThresholds) {
    if (value >= threshold.value) {
      active = threshold;
    } else {
      break;
    }
  }

  return active;
};
