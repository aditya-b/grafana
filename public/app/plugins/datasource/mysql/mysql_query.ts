import _ from 'lodash';
import SqlQuery from 'app/plugins/datasource/sql/query';

export default class MysqlQuery extends SqlQuery {
  hasUnixEpochTimecolumn() {
    return ['int', 'bigint', 'double'].indexOf(this.target.timeColumnType) > -1;
  }

  buildValueColumn(column) {
    let query = '';

    const columnName = _.find(column, (g: any) => g.type === 'column');
    query = columnName.params[0];

    const aggregate = _.find(column, (g: any) => g.type === 'aggregate');

    if (aggregate) {
      const func = aggregate.params[0];
      query = func + '(' + query + ')';
    }

    const alias = _.find(column, (g: any) => g.type === 'alias');
    if (alias) {
      query += ' AS ' + this.quoteIdentifier(alias.params[0]);
    }

    return query;
  }
}
