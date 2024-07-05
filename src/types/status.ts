import { StatusStyleMode } from './panel';

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
      mode: StatusStyleMode;
      image?: string;
    };
