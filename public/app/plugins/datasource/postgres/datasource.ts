import _ from 'lodash';
import PostgresQuery from './postgres_query';
import SqlDatasource from 'app/plugins/datasource/sql/datasource';

export class PostgresDatasource extends SqlDatasource {
  createQueryModel(target, templateSrv?, scopedVars?) {
    return new PostgresQuery({}, templateSrv, scopedVars);
  }

  getVersion() {
    return this.metricFindQuery("SELECT current_setting('server_version_num')::int/100", {});
  }

  getTimescaleDBVersion() {
    return this.metricFindQuery("SELECT extversion FROM pg_extension WHERE extname = 'timescaledb'", {});
  }
}
