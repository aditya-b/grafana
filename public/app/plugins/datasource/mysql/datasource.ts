import _ from 'lodash';
import SqlDatasource from 'app/plugins/datasource/sql/datasource';
import MysqlQuery from './mysql_query';

export class MysqlDatasource extends SqlDatasource {
  createQueryModel(target, templateSrv?, scopedVars?) {
    return new MysqlQuery({}, templateSrv, scopedVars);
  }
}
