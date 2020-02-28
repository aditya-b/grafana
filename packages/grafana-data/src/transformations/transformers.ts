import { DataFrame } from '../types/dataFrame';
import { Registry } from '../utils/Registry';
// Initalize the Registry

import { appendTransformer, AppendOptions } from './transformers/append';
import { reduceTransformer, ReduceTransformerOptions } from './transformers/reduce';
import { filterFieldsTransformer, filterFramesTransformer } from './transformers/filter';
import { filterFieldsByNameTransformer, FilterFieldsByNameTransformerOptions } from './transformers/filterByName';
import { noopTransformer } from './transformers/noop';
import { DataTransformerInfo, DataTransformerConfig } from '../types/transformations';
import { filterFramesByRefIdTransformer } from './transformers/filterByRefId';

/**
 * Apply configured transformations to the input data
 */
export function transformDataFrame(options: DataTransformerConfig[], data: DataFrame[]): DataFrame[] {
  let processed = data;

  for (const config of options) {
    const info = transformersRegistry.get(config.id);
    const transformer = info.transformer(config.options);
    const after = transformer(processed);

    // Add a key to the metadata if the data changed
    if (after && after !== processed) {
      for (const series of after) {
        if (!series.meta) {
          series.meta = {};
        }
        if (!series.meta.transformations) {
          series.meta.transformations = [info.id];
        } else {
          series.meta.transformations = [...series.meta.transformations, info.id];
        }
      }
      processed = after;
    }
  }

  return processed;
}

/**
 * Registry of transformation options that can be driven by
 * stored configuration files.
 */
class TransformerRegistry extends Registry<DataTransformerInfo> {}

export const transformersRegistry = new TransformerRegistry(() => [
  noopTransformer,
  filterFieldsTransformer,
  filterFieldsByNameTransformer,
  filterFramesTransformer,
  filterFramesByRefIdTransformer,
  appendTransformer,
  reduceTransformer,
]);

export { ReduceTransformerOptions, FilterFieldsByNameTransformerOptions };
