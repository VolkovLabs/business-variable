/**
 * All Value
 */
export const ALL_VALUE = 'All';

/**
 * All Value Parameter
 */
export const ALL_VALUE_PARAMETER = '$__all';

/**
 * No Value Parameter
 */
export const NO_VALUE_PARAMETER = '$__empty';

/**
 * Variable regex to define ${} in string
 */
export const VARIABLE_REGEX = /\$\{([^}]+)\}/g;

export const REQUEST_LATENCY_MODE_OPTIONS = {
  low: {
    refreshCheckCount: 5,
    refreshCheckInterval: 500,
  },
  normal: {
    refreshCheckCount: 10,
    refreshCheckInterval: 1000,
  },
  high: {
    refreshCheckCount: 20,
    refreshCheckInterval: 1500,
  },
  unstable: {
    refreshCheckCount: 30,
    refreshCheckInterval: 2000,
  },
};
