import { TypedVariableModel } from '@grafana/data';

/**
 * Runtime Variable Option
 */
export interface RuntimeVariableOption {
  /**
   * Value
   *
   * @type {string}
   */
  value: string;

  /**
   * Text
   *
   * @type {string}
   */
  text: string;

  /**
   * Selected
   *
   * @type {boolean};
   */
  selected?: boolean;

  /**
   * On Click
   *
   * @type {Function | null}
   */
  onClick?: Function | null;
}

/**
 * Runtime Variable
 */
export type RuntimeVariable = TypedVariableModel & {
  /**
   * Options
   *
   * @type {RuntimeVariableOption[]}
   */
  options: RuntimeVariableOption[];

  /**
   * Id
   *
   * @type {string}
   */
  id: string;

  /**
   * Multi
   *
   * @type {boolean}
   */
  multi: boolean;

  /**
   * Include All
   *
   * @type {boolean}
   */
  includeAll: boolean;
};
