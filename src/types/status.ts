/**
 * Status
 */
export type Status =
  | {
      exist: false;
    }
  | {
      exist: true;
      value: number;
      color: string;
    };
