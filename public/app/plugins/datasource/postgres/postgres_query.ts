import _ from 'lodash';
import SqlQuery from 'app/plugins/datasource/sql/query';

export default class PostgresQuery extends SqlQuery {
  hasUnixEpochTimecolumn() {
    return ['int4', 'int8', 'float4', 'float8', 'numeric'].indexOf(this.target.timeColumnType) > -1;
  }

  buildValueColumn(column) {
    let query = '';

    const columnName = _.find(column, (g: any) => g.type === 'column');
    query = columnName.params[0];

    const aggregate = _.find(column, (g: any) => g.type === 'aggregate' || g.type === 'percentile');
    const windows = _.find(column, (g: any) => g.type === 'window' || g.type === 'moving_window');

    if (aggregate) {
      const func = aggregate.params[0];
      switch (aggregate.type) {
        case 'aggregate':
          if (func === 'first' || func === 'last') {
            query = func + '(' + query + ',' + this.target.timeColumn + ')';
          } else {
            query = func + '(' + query + ')';
          }
          break;
        case 'percentile':
          query = func + '(' + aggregate.params[1] + ') WITHIN GROUP (ORDER BY ' + query + ')';
          break;
      }
    }

    if (windows) {
      const overParts = [];
      if (this.hasMetricColumn()) {
        overParts.push('PARTITION BY ' + this.target.metricColumn);
      }
      overParts.push('ORDER BY ' + this.buildTimeColumn(false));

      const over = overParts.join(' ');
      let curr: string;
      let prev: string;
      switch (windows.type) {
        case 'window':
          switch (windows.params[0]) {
            case 'delta':
              curr = query;
              prev = 'lag(' + curr + ') OVER (' + over + ')';
              query = curr + ' - ' + prev;
              break;
            case 'increase':
              curr = query;
              prev = 'lag(' + curr + ') OVER (' + over + ')';
              query = '(CASE WHEN ' + curr + ' >= ' + prev + ' THEN ' + curr + ' - ' + prev;
              query += ' WHEN ' + prev + ' IS NULL THEN NULL ELSE ' + curr + ' END)';
              break;
            case 'rate':
              let timeColumn = this.target.timeColumn;
              if (aggregate) {
                timeColumn = 'min(' + timeColumn + ')';
              }

              curr = query;
              prev = 'lag(' + curr + ') OVER (' + over + ')';
              query = '(CASE WHEN ' + curr + ' >= ' + prev + ' THEN ' + curr + ' - ' + prev;
              query += ' WHEN ' + prev + ' IS NULL THEN NULL ELSE ' + curr + ' END)';
              query += '/extract(epoch from ' + timeColumn + ' - lag(' + timeColumn + ') OVER (' + over + '))';
              break;
            default:
              query = windows.params[0] + '(' + query + ') OVER (' + over + ')';
              break;
          }
          break;
        case 'moving_window':
          query = windows.params[0] + '(' + query + ') OVER (' + over + ' ROWS ' + windows.params[1] + ' PRECEDING)';
          break;
      }
    }

    const alias = _.find(column, (g: any) => g.type === 'alias');
    if (alias) {
      query += ' AS ' + this.quoteIdentifier(alias.params[0]);
    }

    return query;
  }
}
