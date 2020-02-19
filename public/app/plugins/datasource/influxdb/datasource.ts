import _ from 'lodash';

import {
  dateMath,
  DataSourceApi,
  DataSourceInstanceSettings,
  DataQueryResponse,
  DataQueryRequest,
  AnnotationQueryRequest,
  ScopedVars,
} from '@grafana/data';
import InfluxSeries from './influx_series';
import InfluxQueryModel from './influx_query_model';
import ResponseParser from './response_parser';
import { InfluxQueryBuilder } from './query_builder';
import { InfluxQuery, InfluxOptions, InfluxResponse } from './types';
import { getBackendSrv } from 'app/core/services/backend_srv';
import templateSrv from 'app/features/templating/template_srv';

export default class InfluxDatasource extends DataSourceApi<InfluxQuery, InfluxOptions> {
  type: string;
  urls: any;
  username: string;
  password: string;
  name: string;
  database: any;
  basicAuth: any;
  withCredentials: any;
  interval: any;
  responseParser: ResponseParser;
  httpMode: string;

  constructor(instanceSettings: DataSourceInstanceSettings<InfluxOptions>) {
    super(instanceSettings);
    this.type = 'influxdb';
    this.urls = instanceSettings.url.split(',').map(url => url.trim());

    this.username = instanceSettings.username;
    this.password = instanceSettings.password;
    this.name = instanceSettings.name;
    this.database = instanceSettings.database;
    this.basicAuth = instanceSettings.basicAuth;
    this.withCredentials = instanceSettings.withCredentials;
    const settingsData = instanceSettings.jsonData || ({} as InfluxOptions);
    this.interval = settingsData.timeInterval;
    this.httpMode = settingsData.httpMode || 'GET';
    this.responseParser = new ResponseParser();
  }

  async query(options: DataQueryRequest<InfluxQuery>): Promise<DataQueryResponse> {
    let timeFilter = this.getTimeFilter(options);
    const scopedVars = options.scopedVars;
    const targets = _.cloneDeep(options.targets);
    const queryTargets: InfluxQuery[] = [];
    let queryModel: InfluxQueryModel;

    let allQueries = targets
      .filter(target => !target.hide)
      .map((target: InfluxQuery) => {
        queryTargets.push(target);

        // backward compatibility
        scopedVars.interval = scopedVars.__interval;

        queryModel = new InfluxQueryModel(target, templateSrv, scopedVars);
        return queryModel.render(true);
      })
      .join(';');

    if (allQueries === '') {
      return { data: [] };
    }

    // add global adhoc filters to timeFilter
    const adhocFilters = templateSrv.getAdhocFilters(this.name);
    if (adhocFilters.length > 0) {
      timeFilter += ' AND ' + queryModel.renderAdhocFilters(adhocFilters);
    }

    // replace grafana variables
    scopedVars.timeFilter = { text: timeFilter, value: timeFilter };

    // replace templated variables
    allQueries = templateSrv.replace(allQueries, scopedVars);

    const data = await this._seriesQuery(allQueries, options);
    if (!data || !data.results) {
      return { data: [] };
    }

    const dataFrames = [];
    for (let i = 0; i < data.results.length; i++) {
      const result = data.results[i];
      if (!result || !result.series) {
        continue;
      }

      const target = queryTargets[i];
      let alias = target.alias;
      if (alias) {
        alias = templateSrv.replace(target.alias, options.scopedVars);
      }

      const influxSeries = new InfluxSeries({
        series: data.results[i].series,
        alias: alias,
      });

      dataFrames.push(...influxSeries.toDataFrames());
    }

    return { data: dataFrames };
  }

  async annotationQuery(options: AnnotationQueryRequest<InfluxQuery>) {
    if (!options.annotation.query) {
      throw {
        message: 'Query missing in annotation definition',
      };
    }

    const timeFilter = this.getTimeFilter({ rangeRaw: options.rangeRaw, timezone: options.timezone });
    let query = options.annotation.query.replace('$timeFilter', timeFilter);
    query = templateSrv.replace(query, null, 'regex');

    const data = await this._seriesQuery(query, options);
    if (!data || !data.results || !data.results[0]) {
      throw { message: 'No results in response from InfluxDB' };
    }

    return new InfluxSeries({
      series: data.results[0].series,
      annotation: options.annotation,
    }).getAnnotations();
  }

  targetContainsTemplate(target: InfluxQuery) {
    for (const group of target.groupBy) {
      for (const param of group.params) {
        if (templateSrv.variableExists(param)) {
          return true;
        }
      }
    }

    return !!target.tags.find(tag => templateSrv.variableExists(tag.value));
  }

  interpolateVariablesInQueries(queries: InfluxQuery[], scopedVars: ScopedVars): InfluxQuery[] {
    if (!queries || queries.length === 0) {
      return [];
    }

    let expandedQueries = queries;
    if (queries && queries.length > 0) {
      expandedQueries = queries.map(query => {
        const expandedQuery = {
          ...query,
          datasource: this.name,
          measurement: templateSrv.replace(query.measurement, scopedVars, 'regex'),
        };

        if (query.rawQuery) {
          expandedQuery.query = templateSrv.replace(query.query, scopedVars, 'regex');
        }

        return expandedQuery;
      });
    }

    return expandedQueries;
  }

  async metricFindQuery(query: string, options?: any) {
    const interpolated = templateSrv.replace(query, null, 'regex');

    const res = await this._seriesQuery(interpolated, options);
    return this.responseParser.parse(query, res as any);
  }

  getTagKeys(options: any = {}) {
    const queryBuilder = new InfluxQueryBuilder({ measurement: options.measurement || '', tags: [] }, this.database);
    const query = queryBuilder.buildExploreQuery('TAG_KEYS');
    return this.metricFindQuery(query, options);
  }

  getTagValues(options: any = {}) {
    const queryBuilder = new InfluxQueryBuilder({ measurement: options.measurement || '', tags: [] }, this.database);
    const query = queryBuilder.buildExploreQuery('TAG_VALUES', options.key);
    return this.metricFindQuery(query, options);
  }

  async _seriesQuery(query: string, options?: any): Promise<InfluxResponse> {
    if (!query) {
      return { results: [] };
    }

    if (options && options.range) {
      const timeFilter = this.getTimeFilter({ rangeRaw: options.range, timezone: options.timezone });
      query = query.replace('$timeFilter', timeFilter);
    }

    return this._influxRequest(this.httpMode, '/query', { q: query, epoch: 'ms' }, options);
  }

  serializeParams(params: any) {
    if (!params) {
      return '';
    }

    return _.reduce(
      params,
      (memo, value, key) => {
        if (value === null || value === undefined) {
          return memo;
        }
        memo.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
        return memo;
      },
      []
    ).join('&');
  }

  async testDatasource() {
    const queryBuilder = new InfluxQueryBuilder({ measurement: '', tags: [] }, this.database);
    const query = queryBuilder.buildExploreQuery('RETENTION POLICIES');

    try {
      const res = await this._seriesQuery(query);

      const error = _.get(res, 'results[0].error');
      if (error) {
        return { status: 'error', message: error };
      }
      return { status: 'success', message: 'Data source is working' };
    } catch (err) {
      return { status: 'error', message: err.message };
    }
  }

  async _influxRequest(method: string, url: string, data: any, options?: any) {
    const currentUrl = this.urls.shift();
    this.urls.push(currentUrl);

    const params: any = {};

    if (this.username) {
      params.u = this.username;
      params.p = this.password;
    }

    if (options && options.database) {
      params.db = options.database;
    } else if (this.database) {
      params.db = this.database;
    }

    if (method === 'POST' && _.has(data, 'q')) {
      // verb is POST and 'q' param is defined
      _.extend(params, _.omit(data, ['q']));
      data = this.serializeParams(_.pick(data, ['q']));
    } else if (method === 'GET' || method === 'POST') {
      // verb is GET, or POST without 'q' param
      _.extend(params, data);
      data = null;
    }

    const req: any = {
      method: method,
      url: currentUrl + url,
      params: params,
      data: data,
      precision: 'ms',
      inspect: { type: 'influxdb' },
      paramSerializer: this.serializeParams,
    };

    req.headers = req.headers || {};
    if (this.basicAuth || this.withCredentials) {
      req.withCredentials = true;
    }
    if (this.basicAuth) {
      req.headers.Authorization = this.basicAuth;
    }

    if (method === 'POST') {
      req.headers['Content-type'] = 'application/x-www-form-urlencoded';
    }

    try {
      const result = await getBackendSrv().datasourceRequest(req);
      return result.data as InfluxResponse;
    } catch (err) {
      if ((Number.isInteger(err.status) && err.status !== 0) || err.status >= 300) {
        if (err.data?.error) {
          throw {
            message: `InfluxDB Error: ${err.data.error}`,
            data: err.data,
            config: err.config,
          };
        } else {
          throw {
            message: `Network Error: ${err.statusText} (${err.status})`,
            data: err.data,
            config: err.config,
          };
        }
      } else {
        throw {
          message: 'An unknown error occurred.',
          data: err.data,
          config: err.config,
        };
      }
    }
  }

  getTimeFilter(options: any) {
    const from = this.getInfluxTime(options.rangeRaw.from, false, options.timezone);
    const until = this.getInfluxTime(options.rangeRaw.to, true, options.timezone);
    const fromIsAbsolute = from[from.length - 1] === 'ms';

    if (until === 'now()' && !fromIsAbsolute) {
      return `time >= ${from}`;
    }

    return `time >= ${from} and time <= ${until}`;
  }

  getInfluxTime(date: any, roundUp: any, timezone: any) {
    if (typeof date === 'string') {
      if (date === 'now') {
        return 'now()';
      }

      const parts = /^now-(\d+)([dhms])$/.exec(date);
      if (parts) {
        const amount = parseInt(parts[1], 10);
        const unit = parts[2];
        return `now() - ${amount}${unit}`;
      }

      date = dateMath.parse(date, roundUp, timezone);
    }

    return date.valueOf() + 'ms';
  }
}
