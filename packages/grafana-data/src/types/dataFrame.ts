import { QueryResultBase, Labels } from './data';
import { DisplayProcessor, DisplayValue } from './displayValue';
import { LinkModel } from './dataLink';
import { Vector } from './vector';
import { ScopedVars } from './ScopedVars';
import { FieldConfig } from './fieldConfig';

export enum FieldType {
  time = 'time', // or date
  number = 'number',
  string = 'string',
  boolean = 'boolean',
  // Used to detect that the value is some kind of trace data to help with the visualisation and processing.
  trace = 'trace',
  other = 'other', // Object, Array, etc
}

export interface FieldCalcs {
  [key: string]: any;
}

export interface ValueLinkConfig {
  /**
   * Result of field reduction
   */
  calculatedValue?: DisplayValue;
  /**
   * Index of the value row within Field. Should be provided only when value is not a result of a reduction
   */
  valueRowIndex?: number;
}

export interface Field<T = any, V = Vector<T>> {
  /**
   * Name of the field (column)
   */
  name: string;
  /**
   *  Field value type (string, number, etc)
   */
  type: FieldType;
  /**
   *  Meta info about how field and how to display it
   */
  config: FieldConfig;
  values: V; // The raw field values
  labels?: Labels;

  /**
   * Cached values with appropriate dispaly and id values
   */
  state?: FieldState;

  /**
   * Convert text to the field value
   */
  parse?: (value: any) => T;

  /**
   * Convert a value for display
   */
  display?: DisplayProcessor;

  /**
   * Get value data links with variables interpolated
   */
  getLinks?: (config: ValueLinkConfig) => Array<LinkModel<Field>>;
}

export interface FieldState {
  /**
   * An appropriate name for the field (does not include frame info)
   */
  title: string;

  /**
   * Cache of reduced values
   */
  calcs?: FieldCalcs;

  /**
   * Appropriate values for templating
   */
  scopedVars?: ScopedVars;
}

export interface DataFrame extends QueryResultBase {
  name?: string;
  fields: Field[]; // All fields of equal length

  // The number of rows
  length: number;
}

/**
 * Like a field, but properties are optional and values may be a simple array
 */
export interface FieldDTO<T = any> {
  name: string; // The column name
  type?: FieldType;
  config?: FieldConfig;
  values?: Vector<T> | T[]; // toJSON will always be T[], input could be either
  labels?: Labels;
}

/**
 * Like a DataFrame, but fields may be a FieldDTO
 */
export interface DataFrameDTO extends QueryResultBase {
  name?: string;
  fields: Array<FieldDTO | Field>;
}

export const TIME_SERIES_FIELD_NAME = 'Value';
