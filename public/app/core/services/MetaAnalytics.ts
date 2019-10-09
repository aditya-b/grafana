export interface UserAction {
  labels: { [key: string]: string };
}

export interface Counter {
  labels: { [key: string]: string };
  value: number;
}

export interface Labels {
  [key: string]: string;
}

export class MetaAnalytics {
  private counters: { [key: string]: Counter };

  constructor() {
    this.counters = [];
  }

  increment(name: string, labels: Labels, value: number = 1) {}
}

export const metaAnalytics = new MetaAnalytics();
