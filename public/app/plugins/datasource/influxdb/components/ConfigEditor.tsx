import React, { PureComponent } from 'react';
import {
  DataSourcePluginOptionsEditorProps,
  SelectableValue,
  onUpdateDatasourceOption,
  updateDatasourcePluginResetOption,
  onUpdateDatasourceJsonDataOption,
  onUpdateDatasourceJsonDataOptionSelect,
  onUpdateDatasourceSecureJsonDataOption,
} from '@grafana/data';
import { DataSourceHttpSettings, FormLabel, Input, SecretFormField, Select } from '@grafana/ui';
import { InfluxOptions, InfluxSecureJsonData } from '../types';

const httpModes = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
] as SelectableValue[];

const apiVersions = [
  { label: 'v1', value: 'v1' },
  { label: 'v2', value: 'v2' },
] as SelectableValue[];

export type Props = DataSourcePluginOptionsEditorProps<InfluxOptions>;

export class ConfigEditor extends PureComponent<Props> {
  onResetPassword = () => {
    updateDatasourcePluginResetOption(this.props, 'password');
  };

  v1Options = () => {
    const { options } = this.props;
    const { secureJsonFields } = options;
    const secureJsonData = (options.secureJsonData || {}) as InfluxSecureJsonData;

    return (
      <>
        <div className="gf-form-inline">
          <div className="gf-form">
            <FormLabel className="width-10">Database</FormLabel>
            <div className="width-20">
              <Input
                className="width-20"
                value={options.database || ''}
                onChange={onUpdateDatasourceOption(this.props, 'database')}
              />
            </div>
          </div>
        </div>
        <div className="gf-form-inline">
          <div className="gf-form">
            <FormLabel className="width-10">User</FormLabel>
            <div className="width-10">
              <Input
                className="width-20"
                value={options.user || ''}
                onChange={onUpdateDatasourceOption(this.props, 'user')}
              />
            </div>
          </div>
        </div>
        <div className="gf-form-inline">
          <div className="gf-form">
            <SecretFormField
              isConfigured={(secureJsonFields && secureJsonFields.password) as boolean}
              value={secureJsonData.password || ''}
              label="Password"
              labelWidth={10}
              inputWidth={20}
              onReset={this.onResetPassword}
              onChange={onUpdateDatasourceSecureJsonDataOption(this.props, 'password')}
            />
          </div>
        </div>
        <div className="gf-form-inline">
          <div className="gf-form">
            <FormLabel
              className="width-10"
              tooltip="You can use either GET or POST HTTP method to query your InfluxDB database. The POST
        method allows you to perform heavy requests (with a lots of WHERE clause) while the GET method
        will restrict you and return an error if the query is too large."
            >
              HTTP Method
            </FormLabel>
            <Select
              className="width-10"
              value={httpModes.find(httpMode => httpMode.value === options.jsonData.httpMode)}
              options={httpModes}
              defaultValue={options.jsonData.httpMode}
              onChange={onUpdateDatasourceJsonDataOptionSelect(this.props, 'httpMode')}
            />
          </div>
        </div>
        <div className="gf-form-group">
          <div className="grafana-info-box">
            <h5>Database Access</h5>
            <p>
              Setting the database for this datasource does not deny access to other databases. The InfluxDB query
              syntax allows switching the database in the query. For example:
              <code>SHOW MEASUREMENTS ON _internal</code> or <code>SELECT * FROM "_internal".."database" LIMIT 10</code>
              <br />
              <br />
              To support data isolation and security, make sure appropriate permissions are configured in InfluxDB.
            </p>
          </div>
        </div>
        <div className="gf-form-group">
          <div className="gf-form-inline">
            <div className="gf-form">
              <FormLabel
                className="width-10"
                tooltip="A lower limit for the auto group by time interval. Recommended to be set to write frequency,
				for example 1m if your data is written every minute."
              >
                Min time interval
              </FormLabel>
              <div className="width-10">
                <Input
                  className="width-10"
                  placeholder="10s"
                  value={options.jsonData.timeInterval || ''}
                  onChange={onUpdateDatasourceJsonDataOption(this.props, 'timeInterval')}
                />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  v2Options = () => {
    const { options } = this.props;
    const { secureJsonFields } = options;
    const secureJsonData = (options.secureJsonData || {}) as InfluxSecureJsonData;

    return (
      <div className="gf-form-group">
        <div className="gf-form max-width-25">
          <FormLabel className="width-10">Organization</FormLabel>
          <Input
            className="width-20"
            value={options.user || ''}
            onChange={onUpdateDatasourceOption(this.props, 'user')}
          />
        </div>
        <div className="gf-form max-width-25">
          <FormLabel className="width-10">Default Bucket</FormLabel>
          <Input
            className="width-20"
            value={options.user || ''}
            onChange={onUpdateDatasourceOption(this.props, 'user')}
          />
        </div>
        <div className="gf-form-inline">
          <div className="gf-form max-width-25">
            <SecretFormField
              isConfigured={(secureJsonFields && secureJsonFields.password) as boolean}
              value={secureJsonData.password || ''}
              label="Token"
              labelWidth={10}
              inputWidth={20}
              onReset={this.onResetPassword}
              onChange={onUpdateDatasourceSecureJsonDataOption(this.props, 'password')}
            />
          </div>
        </div>
      </div>
    );
  };

  render() {
    const { options, onOptionsChange } = this.props;
    return (
      <>
        <DataSourceHttpSettings
          showAccessOptions={true}
          dataSourceConfig={options}
          defaultUrl="http://localhost:8086"
          onChange={onOptionsChange}
        />

        <h3 className="page-heading">InfluxDB Details</h3>
        <div className="gf-form-inline">
          <div className="gf-form">
            <FormLabel
              className="width-10"
              tooltip="Api Version 1: Influx < 2.0 or Influx 1.7+ with Flux queries enabled
              Api Version 2: Influx >= 2.0
              Why use version 2.0 <the answer goes here...>"
            >
              API
            </FormLabel>
            <Select
              className="width-10"
              value={httpModes.find(apiVersion => apiVersion.value === options.jsonData.apiVersion)}
              options={apiVersions}
              defaultValue={options.jsonData.apiVersion}
              onChange={onUpdateDatasourceJsonDataOptionSelect(this.props, 'apiVersion')}
            />
          </div>
        </div>
        {options.jsonData.apiVersion === 'v1' ? this.v1Options() : this.v2Options()}
      </>
    );
  }
}

export default ConfigEditor;
