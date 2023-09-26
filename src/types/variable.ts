import {
  CustomVariableModel as CoreCustomVariableModel,
  QueryVariableModel as CoreQueryVariableModel,
  TextBoxVariableModel,
  VariableOption,
} from '@grafana/data';

/**
 * Dashboard variable type
 * `query`: Query-generated list of values such as metric names, server names, sensor IDs, data centers, and so on.
 * `adhoc`: Key/value filters that are automatically added to all metric queries for a data source.
 * `constant`: 	Define a hidden constant.
 * `datasource`: Quickly change the data source for an entire dashboard.
 * `interval`: Interval variables represent time spans.
 * `textbox`: Display a free text input field with an optional default value.
 * `custom`: Define the variable options manually using a comma-separated list.
 * `system`: Variables defined by Grafana.
 */
export enum VariableType {
  QUERY = 'query',
  ADHOC = 'adhoc',
  CONSTANT = 'constant',
  DATASOURCE = 'datasource',
  INTERVAL = 'interval',
  TEXTBOX = 'textbox',
  CUSTOM = 'custom',
  SYSTEM = 'system',
}

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
  selected: boolean;

  /**
   * On Click
   *
   * @type {Function | null}
   */
  onClick?: Function | null;
}

/**
 * Variable With Options Helpers
 */
interface VariableWithOptionsHelpers {
  /**
   * Get Option
   * @param value
   */
  getOption: (value: string) => RuntimeVariableOption | undefined;
}

/**
 * Custom Variable Model
 */
export type CustomVariableModel = Omit<CoreCustomVariableModel, 'options' | 'type'> & {
  type: VariableType.CUSTOM;
  options: RuntimeVariableOption[];
  optionIndexByName: Map<string, number>;
  helpers: VariableWithOptionsHelpers;
};

/**
 * Query Variable Model
 */
export type QueryVariableModel = Omit<CoreQueryVariableModel, 'options' | 'type'> & {
  type: VariableType.QUERY;
  options: RuntimeVariableOption[];
  optionIndexByName: Map<string, number>;
  helpers: VariableWithOptionsHelpers;
};

/**
 * TextBox Variable
 */
export type TextBoxVariable = TextBoxVariableModel & { current: Partial<VariableOption>; helpers?: never };

/**
 * Runtime Variable With Options
 */
export type RuntimeVariableWithOptions = CustomVariableModel | QueryVariableModel;

/**
 * Runtime Variable
 */
export type RuntimeVariable = RuntimeVariableWithOptions | TextBoxVariable;
