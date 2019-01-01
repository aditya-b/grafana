import _ from 'lodash';
import SqlQueryCtrl from 'app/plugins/datasource/sql/query_ctrl';

const defaultQuery = `SELECT
  $__timeEpoch(<time_column>),
  <value column> as value,
  <series name column> as metric
FROM
  <table name>
WHERE
  $__timeFilter(time_column)
ORDER BY
  <time_column> ASC`;

export class MssqlQueryCtrl extends SqlQueryCtrl {
  /** @ngInject */
  constructor($scope, $injector) {
    super($scope, $injector, defaultQuery);
  }
}
