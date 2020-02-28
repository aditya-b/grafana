import { ComponentType } from 'react';
import { DataFrame, Field } from './dataFrame';
import { RegistryItemWithOptions } from '../utils/Registry';

/**
 * Immutable data transformation
 */
export type DataTransformer = (data: DataFrame[]) => DataFrame[];

export interface DataTransformerInfo<TOptions = any> extends RegistryItemWithOptions {
  transformer: (options: TOptions) => DataTransformer;
  editor: ComponentType<DataTransformerItemEditorProps<TOptions>>;
}

export interface DataTransformerConfig<TOptions = any> {
  id: string;
  options: TOptions;
}

export interface DataTransformerItemEditorProps<T> {
  /* Transformer configuration, persisted on panel's model */
  options: T;
  /* Pre-transformation DataFrames */
  input: DataFrame[];
  /* Called on change to config */
  onChange: (options: T) => void;
}

export type FieldMatcher = (field: Field) => boolean;
export type FrameMatcher = (frame: DataFrame) => boolean;

export interface FieldMatcherInfo<TOptions = any> extends RegistryItemWithOptions<TOptions> {
  get: (options: TOptions) => FieldMatcher;
}

export interface FrameMatcherInfo<TOptions = any> extends RegistryItemWithOptions<TOptions> {
  get: (options: TOptions) => FrameMatcher;
}

export interface MatcherConfig<TOptions = any> {
  id: string;
  options?: TOptions;
}
