export interface ScopedVar<T = any> {
  text: any;
  value: T;
  [key: string]: any;
}

export interface ScopedVars {
  [key: string]: ScopedVar;
}

export type InterpolateFunction = (value: string, scopedVars?: ScopedVars, format?: string | Function) => string;
