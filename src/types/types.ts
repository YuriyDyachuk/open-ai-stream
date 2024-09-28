import { Literal } from 'sequelize/types/utils';

export type ObjectLiteral = Record<string, any>;

export type DateEntityType =
  | undefined
  | null
  | Date
  | string
  | number
  | Literal;
