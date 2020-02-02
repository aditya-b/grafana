import _ from 'lodash';
import TableModel from 'app/core/table_model';
import { FieldType, DataFrame, ArrayVector, AnnotationQueryRequest } from '@grafana/data';
import { InfluxRow, InfluxQuery } from './types';

export default class InfluxSeries {
  series: InfluxRow[];
  alias: string;
  annotation: AnnotationQueryRequest<InfluxQuery>['annotation'];

  constructor(options: {
    series: InfluxRow[];
    alias?: any;
    annotation?: AnnotationQueryRequest<InfluxQuery>['annotation'];
  }) {
    this.series = options.series;
    this.alias = options.alias;
    this.annotation = options.annotation;
  }

  getTimeSeries() {
    const output: any[] = [];
    let i, j;

    if (this.series.length === 0) {
      return output;
    }

    this.series.forEach(series => {
      const columns = series.columns.length;
      const tags = Object.entries(series.tags ?? {}).map((key, value) => `${key}: ${value}`);

      for (j = 1; j < columns; j++) {
        let seriesName = series.name;
        const columnName = series.columns[j];
        if (columnName !== 'value') {
          seriesName = `${seriesName}.${columnName}`;
        }

        if (this.alias) {
          seriesName = this._getSeriesName(series, j);
        } else if (series.tags) {
          seriesName = `${seriesName} {${tags.join(', ')}}`;
        }

        const datapoints = [];
        if (series.values) {
          for (i = 0; i < series.values.length; i++) {
            datapoints[i] = [series.values[i][j], series.values[i][0]];
          }
        }

        output.push({ target: seriesName, datapoints });
      }
    });

    return output;
  }

  _getSeriesName(series: any, index: number) {
    const regex = /\$(\w+)|\[\[([\s\S]+?)\]\]/g;
    const segments = series.name.split('.');

    return this.alias.replace(regex, (match: any, g1: any, g2: any) => {
      const group = g1 || g2;
      const segIndex = parseInt(group, 10);

      if (group === 'm' || group === 'measurement') {
        return series.name;
      }

      if (group === 'col') {
        return series.columns[index];
      }

      if (!isNaN(segIndex)) {
        return segments[segIndex];
      }

      if (group.indexOf('tag_') !== 0) {
        return match;
      }

      const tag = group.replace('tag_', '');
      if (!series.tags) {
        return match;
      }

      return series.tags[tag];
    });
  }

  getAnnotations() {
    const list: any[] = [];

    this.series.forEach(series => {
      let titleCol: number = null;
      let timeCol: number = null;
      const tagsCol: number[] = [];
      let textCol: any = null;

      series.columns.forEach((column, index) => {
        if (column === 'time') {
          timeCol = index;
          return;
        }

        if (column === 'sequence_number') {
          return;
        }

        if (column === this.annotation.titleColumn) {
          titleCol = index;
          return;
        }

        if (
          (this.annotation.tagsColumn || '')
            .replace(' ', '')
            .split(',')
            .includes(column)
        ) {
          tagsCol.push(index);
          return;
        }

        if (column === this.annotation.textColumn) {
          textCol = index;
          return;
        }

        // legacy case
        if (!titleCol && textCol !== index) {
          titleCol = index;
        }
      });

      series.values.forEach(value => {
        const data = {
          annotation: this.annotation,
          time: +new Date(value[timeCol] as string),
          title: value[titleCol],
          // Remove empty values, then split in different tags for comma separated values
          tags: _.flatten(tagsCol.filter((t: any) => value[t]).map((t: any) => (value[t] as string).split(','))),
          text: value[textCol],
        };

        list.push(data);
      });
    });

    return list;
  }

  getTable() {
    const table = new TableModel();

    if (this.series.length === 0) {
      return table;
    }

    const hasTimeColumn = this.series[0].columns[0] === 'time';
    if (hasTimeColumn) {
      table.columns = [{ text: 'Time', type: FieldType.time }];
    }

    table.columns.push(
      ...Object.keys(this.series[0].tags ?? {}).map(key => ({ text: key })),
      ...this.series[0].columns.slice(hasTimeColumn ? 1 : 0).map(column => ({ text: column }))
    );

    this.series.forEach(row => {
      table.rows.push(...row.values.map(values => [values[0], ...Object.values(row.tags ?? {}), ...values.slice(1)]));
    });
    return table;
  }

  toDataFrame(): DataFrame {
    const allValues: ArrayVector[] = [];
    for (let i = 0; i < this.series[0].columns.length; i++) {
      allValues.push(new ArrayVector([]));
    }

    for (const row of this.series[0].values) {
      for (let i = 0; i < row.length; i++) {
        allValues[i].add(row[i]);
      }
    }

    const fields = [];
    const hasTimeColumn = this.series[0].columns[0] === 'time';
    if (hasTimeColumn) {
      fields.push({
        name: 'ts',
        type: FieldType.time,
        config: { title: 'Time' },
        values: allValues[0],
      });
    }

    fields.push(
      ...this.series[0].columns.slice(hasTimeColumn ? 1 : 0).map((colName, i) => ({
        name: colName,
        type: FieldType.other,
        config: {},
        values: allValues.slice(hasTimeColumn ? 1 : 0)[i],
      }))
    );

    return {
      fields,
      length: allValues[0].length,
    };
  }
}
