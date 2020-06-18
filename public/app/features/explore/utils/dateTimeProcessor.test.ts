import { processDateTime } from './dateTimeProcessor';

describe('dateTimeProcessor', () => {
  const nonDateTimeRange = { from: 'now-1h', to: 'now' };

  it('should process nonDateTime range properly - returns unchanged', () => {
    expect(processDateTime(nonDateTimeRange.from)).toBe('now-1h');
    expect(processDateTime(nonDateTimeRange.to)).toBe('now');
  });
});
