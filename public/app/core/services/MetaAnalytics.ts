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

// example data
export const exampleData = [
  {
    name: 'panel-request',
    dashboardId: 1,
    dashboardUid: 'AAA',
    dashboardName: 'Some name',
    panelId: 2,
    panelName: 'Latency',
    userId: 2,
    userName: 'admin',
    userSession: 'token_or_session_id',
    datasourceId: 3,
    dataSourceName: 'gdev',
    value: 10, // ever increasing counter
  },
  {
    name: 'panel-request-seconds_bucket',
    dashboardId: 1,
    dashboardUid: 'BBB',
    dashboardName: 'Some name2',
    panelId: 2,
    panelName: 'Latency',
    userId: 2,
    le: 10, // bucket  (less then or equals, can later be converted to percentiles)
    userName: 'login',
    userSession: 'token_or_session_id',
    value: 10, // ever increasing counter
  },
];
