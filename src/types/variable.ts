import {
  CustomVariableModel as CoreCustomVariableModel,
  LoadingState,
  QueryVariableModel as QueryVariableCoreModel,
  TextBoxVariableModel,
  VariableHide,
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

export interface ConvertCommonProperties {
  name: string;
  label?: string;
  skipUrlSync: boolean;
  hide: VariableHide;
  global: boolean;
  id: string;
  rootStateKey: string | null;
  state: LoadingState;
  error: unknown | null;
  index: number;
  description: string | null;
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
  onClick?: () => void;
}

/**
 * Runtime Variable With Options Base
 */
interface RuntimeVariableWithOptionsBase {
  /**
   * Options
   *
   * @type {RuntimeVariableOption[]}
   */
  options: RuntimeVariableOption[];

  /**
   * Option Index By Name
   *
   * @type {Map}
   */
  optionIndexByName: Map<string, number>;

  /**
   * Helpers
   */
  helpers: {
    /**
     * Get Option
     * @param value
     */
    getOption: (value: string) => RuntimeVariableOption | undefined;
  };
}

/**
 * Custom Variable Model
 */
export type CustomVariableModel = Omit<CoreCustomVariableModel, 'options' | 'type'> &
  ({
    type: VariableType.CUSTOM;
  } & RuntimeVariableWithOptionsBase);

/**
 * Query Variable Model
 */
export type QueryVariableModel = Omit<QueryVariableCoreModel, 'options' | 'type'> &
  ({
    type: VariableType.QUERY;
  } & RuntimeVariableWithOptionsBase);

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
