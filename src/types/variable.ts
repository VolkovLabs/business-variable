import { TypedVariableModel } from '@grafana/data';

/**
 * Runtime Variable Option
 */
export interface RuntimeVariableOption {
  value: string;
  text: string;
  selected?: boolean;
}

/**
 * Runtime Variable
 */
export type RuntimeVariable = TypedVariableModel & {
  options: RuntimeVariableOption[];
  id: string;
};

/**
 * RunTime Variable Table Body
 */
export type RuntimeVariableTableBody = {
  value: string;
  text: string;
  onClick?: Function | null;
  selected?: boolean;
};

/**
 * Runtime Variable Table
 */
export type RuntimeVariableTable = {
  headers: string[];
  body: RuntimeVariableTableBody[][];
};
