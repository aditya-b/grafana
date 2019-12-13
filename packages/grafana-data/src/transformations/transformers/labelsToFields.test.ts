import { FieldType } from '../../types/dataFrame';
// import { DataTransformerID } from './ids';
import { toDataFrame } from '../../dataframe/processDataFrame';
// import { FieldMatcherID } from '../matchers/ids';
// import { transformDataFrame } from '../transformers';
import { labelsToFields } from './labelsToFields';

export const data = toDataFrame({
  fields: [
    { name: 'time', type: FieldType.time, values: [1000, 2000] },
    {
      name: 'value A',
      type: FieldType.number,
      values: [1, 2],
      labels: { app: 'frontend', server: 'A' },
    },
  ],
});

describe('Join Transformer', () => {
  it('simple', () => {
    const cfg = {
      id: DataTransformerID.join,
      options: {},
    };

    const joined = transformDataFrame([cfg], data);
    expect(joined.fields.length).toBe(4);
    expect(joined.fields[0].name).toBe('time');
    expect(joined.fields[1].name).toBe('server');
    expect(joined.fields[2].name).toBe('value A');
    expect(joined.fields[3].name).toBe('value B');
  });
});
