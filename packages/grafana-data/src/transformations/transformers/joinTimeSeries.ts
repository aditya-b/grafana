import { DataFrame, Field, FieldType } from '../../types/dataFrame';
import { DataTransformerID } from './ids';
import { DataTransformerInfo } from '../../types/transformations';
import { getTimeField } from '../../dataframe';
import { ArrayVector } from '../../vector';
import { MutableVector, Vector } from '../../types';

export interface JoinTimeseriesOptions {
  // naming strategy?
}

interface InputFrame {
  timeField: Field;
  timeIndex: number;
  frame: DataFrame;

  // When iterating rows this is the currently active row
  index: number;
  
  // The field values
  values: Vector[]; 

  // The output values
  buffers: MutableVector[];
}

export const joinTimeSeriesTransformer: DataTransformerInfo<JoinTimeseriesOptions> = {
  id: DataTransformerID.filterFields,
  name: 'Join TimeSeries data',
  description: 'select a subset of fields',
  defaultOptions: {

  },

  /**
   * Return a modified copy of the series.  If the transform is not or should not
   * be applied, just return the input series
   */
  transformer: (options: JoinTimeseriesOptions) => {
    return (data: DataFrame[]) => {
      
      // 1. Find the relevant fields
      let firstTime = Number.MAX_SAFE_INTEGER;
      let lastLength = -1;
      let sameLength = true;
      const inputs:InputFrame[] = [];
      for(const frame of data) {
        const v = {
          ...getTimeField(frame),
          frame,
          buffers: [],
          values: [],
          index: 0,
        };
        if(v.timeField) {
          if(inputs.length && sameLength) {
            if(frame.length !== lastLength) {
              sameLength = false;
            }
          }
          lastLength = frame.length;
          inputs.push(v as InputFrame);

          // Find th
          const time = v.timeField.values.get(0);
          if(firstTime > time) {
            firstTime = time;
          }
        }
      }

      // No timeseries results
      if(inputs.length === 0) {
        return []
      }
      
      // Single timeseries
      if(inputs.length === 1) {
        return [inputs[0].frame]
      }

      // If everything shares the same time column, just return the values
      let sharedTimeField = sameLength;
      if(sharedTimeField) {
        for(let i=0; i<length && sharedTimeField; i++) {
          const time = inputs[0].timeField.values.get(i);
          for(let j=1; j<inputs.length && sharedTimeField; j++) {
            if( time !== inputs[j].timeField.values.get(i)) {
              sharedTimeField = false;
              break;
            }
          }
        }
      }


      // Collect all the fields
      const fields:Field[] = [inputs[0].timeField]

      // Prepare the output fields
      for(let i=0; i<inputs.length; i++) {
        const v = inputs[i];
        const suffix = v.frame.name ? ` {${v.frame.name}}` : ` [${i}]`;
        for(const field of v.frame.fields) {
          if(field === v.timeField) {
            continue;
          }
          const copy:Field = {
            ...field,
            name: field.name + suffix,
            labels: {
              ...field.labels,
            },
          };
          if(v.frame.refId) {
            copy.labels!['refId'] = v.frame.refId;
          }
          if(v.frame.name) {
            copy.labels!['series'] = v.frame.name;
          }

          if(!sharedTimeField) {
            const vals = new ArrayVector<any>([]);
            copy.values = vals;
            v.buffers.push(vals);
            v.values.push(field.values);
          }
          fields.push(copy);
        }
      }

      if(sharedTimeField) {
        return [{
          fields,
          length,
        }]
      }

      // TODO???? SORT???  

      // Reset joined values
      const timeValues   = new ArrayVector<number>([]);
      fields[0] = {
        name: 'time',
        type: FieldType.time,
        values: timeValues,
        config: {},
      }
      for(const field of fields) {
        field.values = new ArrayVector<any>([]);
      }

      // Fill the first row
      timeValues.add(firstTime);
      for(const input of inputs) {
        const time = input.timeField.values.get(0);
        const fill = (time===firstTime);
        if(fill) {
          input.index++;
        }
        for(let i=0; i<input.buffers.length; i++) {
          const buffer = input.buffers[i];
          if(fill) {
            buffer.add(input.values[i].get(0));
          }
          else {
            buffer.add(null);
          }
        }
      }
      
      // while(true) {
      // TODO... add all the other fields
      // }

      return [{
        fields,
        length: timeValues.length,
      }]
    };
  },
};
