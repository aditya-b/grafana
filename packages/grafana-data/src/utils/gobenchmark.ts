export interface BenchmarkLine {
  // <name> <iterations> <value> <unit> [<value> <unit>...]
  name: string;
  iterations: number;
  values: Record<string, number>; // Unit -> value
  config: Record<string, string>; // The config lines
}

export interface BenchmarkParseCallbacks {
  // Called after each row is read.  Note, the config will be the same object if it has not changed
  onLine: (line: BenchmarkLine) => void;
}
