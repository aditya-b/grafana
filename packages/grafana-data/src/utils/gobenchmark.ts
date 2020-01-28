export interface BenchmarkLine {
  // <name> <iterations> <value> <unit> [<value> <unit>...]
  name: string;
  iterations: number;
  values: Record<string, number>; // Unit -> value
  config: Record<string, string>; // The config lines
}

// Called after each row is read.  Note, the config will be the same object if it has not changed
export type BenchmarkParseCallback = (line: BenchmarkLine) => void;

export function readBenchmarks(txt: string, callback: BenchmarkParseCallback): number {
  const config: Record<string, string> = {};
  let count = 0;
  const lines = txt.split(/\r|\n/);
  for (const linetext of lines) {
    if (linetext.length < 2) {
      continue;
    }
    const line = linetext.split(/\s+/).map(v => v.trim());

    if (line[0].endsWith(':')) {
      config[line[0].slice(0, -1)] = line[1];
    } else {
      const iterations = parseInt(line[1], 0);
      if (iterations) {
        const values: Record<string, number> = {};
        for (let j = 2; j < line.length; j += 2) {
          values[line[j + 1]] = parseFloat(line[j]);
        }
        callback({
          config,
          name: line[0],
          iterations,
          values,
        });
        count++;
      }
    }
  }
  return count;
}
