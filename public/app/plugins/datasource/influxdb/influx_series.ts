import _ from 'lodash';
import TableModel from 'app/core/table_model';
import { FieldType, DataFrame, ArrayVector, AnnotationQueryRequest, Field } from '@grafana/data';
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

  getSeriesName(influxRow: InfluxRow, columnIndex: number) {
    let seriesName = influxRow.name;
    const columnName = influxRow.columns[columnIndex];
    if (columnName !== 'value') {
      seriesName = `${columnName}`;
    }

    if (this.alias) {
      seriesName = this._getSeriesName(influxRow, columnIndex);
    } else if (this.series[0].tags) {
      const tags = Object.entries(influxRow.tags ?? {}).map((key, value) => `${key}: ${value}`);
      seriesName = `${seriesName} {${tags.join(', ')}}`;
    }

    return seriesName;
  }

  influxRowToDataFrame(influxRow: InfluxRow): DataFrame {
    // Instantiate array vectors
    const rowValues: ArrayVector[] = [];
    for (const _col of influxRow.columns) {
      rowValues.push(new ArrayVector([]));
    }

    for (const row of influxRow.values) {
      for (let i = 0; i < row.length; i++) {
        rowValues[i].add(row[i]);
      }
    }

    const fields: Field[] = [];

    // Add time field
    const timeColumnIndex = influxRow.columns.findIndex(col => col === 'time');
    if (timeColumnIndex !== -1) {
      fields.push({
        name: 'time',
        type: FieldType.time,
        config: { title: 'Time' },
        values: rowValues[timeColumnIndex],
      });
    }

    for (let i = 0; i < influxRow.columns.length; i++) {
      if (i === timeColumnIndex) {
        continue;
      }

      fields.push({
        name: this.getSeriesName(influxRow, i),
        type: FieldType.other,
        config: {},
        values: rowValues[i],
      });
    }

    return {
      fields,
      length: rowValues[0].length,
    };
  }

  toDataFrames(): DataFrame[] {
    const dataFrames: DataFrame[] = this.series.map(influxRow => this.influxRowToDataFrame(influxRow));
    return dataFrames;
  }
}
