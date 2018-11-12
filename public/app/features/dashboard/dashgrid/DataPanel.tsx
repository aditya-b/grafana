// Library
import React, { Component } from 'react';

// Services
import DatasourceSrv, { getDatasourceSrv } from 'app/features/plugins/datasource_srv';
import { getTimeSrv, TimeSrv } from '../time_srv';

// Types
import { TimeRange, LoadingState, DataQueryOptions, DataQueryResponse, TimeSeries } from 'app/types';
import { PanelModel } from '../panel_model';
import { DataSourceApi } from 'app/types/series';

// Utils
import { applyPanelTimeOverrides, getResolution, calculateInterval } from 'app/features/dashboard/utils/panel';

interface RenderProps {
  loading: LoadingState;
  timeSeries: TimeSeries[];
  timeRange: TimeRange;
}

export interface Props {
  datasource: string | null;
  queries: any[];
  panelId?: number;
  panel: PanelModel;
  dashboardId?: number;
  isVisible?: boolean;
  refreshCounter: number;
  children: (r: RenderProps) => JSX.Element;
}

export interface State {
  isFirstLoad: boolean;
  loading: LoadingState;
  response: DataQueryResponse;
  dataSourceApi: DataSourceApi;
  resolution?: number;
  timeInfo?: string;
  timeRange?: TimeRange;
  interval?: {
    interval: string;
    intervalMs: number;
  };
}

export class DataPanel extends Component<Props, State> {
  timeSrv: TimeSrv = getTimeSrv();
  dataSourceSrv: DatasourceSrv = getDatasourceSrv();

  static defaultProps = {
    isVisible: true,
    panelId: 1,
    dashboardId: 1,
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      loading: LoadingState.NotStarted,
      response: {
        data: [],
      },
      isFirstLoad: true,
      dataSourceApi: undefined,
    };
  }

  async componentDidMount() {
    console.log('DataPanel mount');
    this.props.panel.events.on('refresh', this.onRefresh);
    const dataSourceApi = await this.getDataSourceApi();
    this.setState(prevState => ({
      ...prevState,
      dataSourceApi,
    }));
  }

  async componentDidUpdate(prevProps: Props) {
    if (!this.hasPropsChanged(prevProps)) {
      return;
    }

    this.issueQueries();
  }

  componentWillUnmount() {
    this.props.panel.events.off('refresh', this.onRefresh);
  }

  async getDataSourceApi() {
    const { datasource } = this.props;
    return await this.dataSourceSrv.get(datasource);
  }

  onRefresh = () => {
    console.log('onRefresh');
    const { isVisible, panel } = this.props;
    const { dataSourceApi } = this.state;
    if (!isVisible) {
      return;
    }

    const timeRange = this.timeSrv.timeRange();
    const timeData = applyPanelTimeOverrides(panel, timeRange);
    const resolution = getResolution(panel);
    const interval = calculateInterval(panel, dataSourceApi, timeData.timeRange, resolution);

    this.setState(prevState => ({
      ...prevState,
      interval,
      resolution,
      ...timeData,
    }));
  };

  hasPropsChanged(prevProps: Props) {
    return this.props.refreshCounter !== prevProps.refreshCounter || this.props.isVisible !== prevProps.isVisible;
  }

  issueQueries = async () => {
    const { isVisible, queries, panelId, dashboardId } = this.props;
    const { dataSourceApi, timeRange, interval, resolution } = this.state;

    if (!isVisible || !dataSourceApi) {
      return;
    }

    if (!queries.length) {
      this.setState({ loading: LoadingState.Done });
      return;
    }

    this.setState({ loading: LoadingState.Loading });
    try {
      const queryOptions: DataQueryOptions = {
        timezone: 'browser',
        panelId: panelId,
        dashboardId: dashboardId,
        range: timeRange,
        rangeRaw: timeRange.raw,
        interval: interval.interval,
        intervalMs: interval.intervalMs,
        targets: queries,
        maxDataPoints: resolution,
        scopedVars: {},
        cacheTimeout: null,
      };
      console.log('Issuing DataPanel query', queryOptions);
      const resp = await dataSourceApi.query(queryOptions);
      console.log('Issuing DataPanel query Resp', resp);

      this.setState({
        loading: LoadingState.Done,
        response: resp,
        isFirstLoad: false,
      });
    } catch (err) {
      console.log('Loading error', err);
      this.setState({ loading: LoadingState.Error, isFirstLoad: false });
    }
  };

  render() {
    const { response, loading, isFirstLoad, timeRange } = this.state;
    console.log('data panel render');
    const timeSeries = response.data;

    if (isFirstLoad && (loading === LoadingState.Loading || loading === LoadingState.NotStarted)) {
      return (
        <div className="loading">
          <p>Loading</p>
        </div>
      );
    }

    return (
      <>
        {this.loadingSpinner}
        {this.props.children({
          timeSeries,
          loading,
          timeRange,
        })}
      </>
    );
  }

  private get loadingSpinner(): JSX.Element {
    const { loading } = this.state;

    if (loading === LoadingState.Loading) {
      return (
        <div className="panel__loading">
          <i className="fa fa-spinner fa-spin" />
        </div>
      );
    }

    return null;
  }
}
