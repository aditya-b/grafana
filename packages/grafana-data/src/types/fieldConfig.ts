import { ValueMapping } from './valueMapping';
import { ThresholdsConfig } from './thresholds';
import { FieldColor } from './fieldColor';
import { DataLink } from './dataLink';

/**
 * Every property is optional
 *
 * Plugins may extend this with additional properties. Something like series overrides
 */
export interface FieldConfig<TOptions extends object = any> {
  title?: string; // The display value for this field.  This supports template variables blank is auto
  filterable?: boolean;

  // Numeric Options
  unit?: string;
  decimals?: number | null; // Significant digits (for display)
  min?: number | null;
  max?: number | null;

  // Convert input values into a display string
  mappings?: ValueMapping[];

  // Map numeric values to states
  thresholds?: ThresholdsConfig;

  // Map values to a display color
  color?: FieldColor;

  // Used when reducing field values
  nullValueMode?: NullValueMode;

  // The behavior when clicking on a result
  links?: DataLink[];

  // Alternative to empty string
  noValue?: string;

  // Panel Specific Values
  custom?: TOptions;
}

export enum NullValueMode {
  Null = 'null',
  Ignore = 'connected',
  AsZero = 'null as zero',
}
