import { readBenchmarks, BenchmarkLine, BenchmarkParseCallback } from './gobenchmark';

import fs from 'fs';

describe('read benchmmarks', () => {
  const path = __dirname + '/testdata/benchmark.txt';
  expect(fs.existsSync(path)).toBeTruthy();
  const txt = fs.readFileSync(path, 'utf8');

  it('should read lines', () => {
    const lines: string[] = [];
    const callback: BenchmarkParseCallback = (line: BenchmarkLine) => {
      lines.push(line.name);
    };

    const count = readBenchmarks(txt, callback);
    expect(count).toBe(480);
    expect(count).toBe(lines.length);
  });
});
