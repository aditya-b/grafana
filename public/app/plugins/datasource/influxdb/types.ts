import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface InfluxOptions extends DataSourceJsonData {
  timeInterval: string;
  httpMode: string;
}

export interface InfluxSecureJsonData {
  password?: string;
}

export interface InfluxQueryPart {
  type: string;
  params?: string[];
  interval?: string;
}

export interface InfluxQueryTag {
  key: string;
  operator?: string;
  condition?: string;
  value: string;
}

export interface InfluxQuery extends DataQuery {
  policy?: string;
  measurement?: string;
  orderByTime?: string;
  tags?: InfluxQueryTag[];
  groupBy?: InfluxQueryPart[];
  select?: InfluxQueryPart[][];
  limit?: string;
  slimit?: string;
  tz?: string;
  fill?: string;
  rawQuery?: boolean;
  query?: string;
  alias?: string;
}

export interface InfluxRow {
  name?: string;
  tags?: Record<string, string>;
  columns?: string[];
  values?: Array<Array<string | number | boolean | null>>;
  partial?: boolean;
}

export interface InfluxMessage {
  level: string;
  text: string;
}

export interface InfluxResult {
  statement_id: number;
  series?: InfluxRow[];
  messages?: InfluxMessage[];
  partial?: boolean;
  err?: string;
}

export interface InfluxResponse {
  results?: InfluxResult[];
  err?: string;
}
