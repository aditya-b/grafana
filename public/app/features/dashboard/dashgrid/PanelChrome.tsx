// Libraries
import React, { ComponentClass, PureComponent } from 'react';

// Services
import { getTimeSrv } from '../time_srv';
import { getDatasourceSrv } from 'app/features/plugins/datasource_srv';

// Components
import { PanelHeader } from './PanelHeader/PanelHeader';
import { DataPanel } from './DataPanel';
import { PanelHeaderMenu } from './PanelHeader/PanelHeaderMenu';

// Types
import { PanelModel } from '../panel_model';
import { DashboardModel } from '../dashboard_model';
import { TimeRange, PanelProps, TimeSeries } from 'app/types';
import { PanelHeaderGetMenuAdditional } from 'app/types/panel';
import { DataSourceApi } from 'app/types/series';

export interface PanelChromeProps {
  panel: PanelModel;
  dashboard: DashboardModel;
  component: ComponentClass<PanelProps>;
  getMenuAdditional?: PanelHeaderGetMenuAdditional;
}

export interface PanelChromeState {
  refreshCounter: number;
  timeRange?: TimeRange;
  timeSeries?: TimeSeries[];
  dataSourceApi?: DataSourceApi;
}

export class PanelChrome extends PureComponent<PanelChromeProps, PanelChromeState> {
  constructor(props) {
    super(props);
    this.state = {
      refreshCounter: 0,
    };
  }

  async componentDidMount() {
    const { panel } = this.props;
    const { datasource } = panel;

    this.props.panel.events.on('refresh', this.onRefresh);
    this.props.dashboard.panelInitialized(this.props.panel);

    try {
      const dataSourceSrv = getDatasourceSrv();
      const dataSourceApi = await dataSourceSrv.get(datasource);
      this.setState((prevState: PanelChromeState) => ({
        ...prevState,
        dataSourceApi,
      }));
    } catch (err) {
      console.log('Datasource loading error', err);
    }
  }

  componentWillUnmount() {
    this.props.panel.events.off('refresh', this.onRefresh);
  }

  onRefresh = () => {
    const timeSrv = getTimeSrv();
    const timeRange = timeSrv.timeRange();

    this.setState(prevState => ({
      ...prevState,
      refreshCounter: this.state.refreshCounter + 1,
      timeRange: timeRange,
    }));
  };

  onIssueQueryResponse = (timeSeries: any) => {
    this.setState(prevState => ({
      ...prevState,
      timeSeries,
    }));
  };

  get isVisible() {
    return !this.props.dashboard.otherPanelInFullscreen(this.props.panel);
  }

  render() {
    const { panel, dashboard, getMenuAdditional } = this.props;
    const { targets } = panel;
    const { refreshCounter, timeRange, dataSourceApi, timeSeries } = this.state;
    const PanelComponent = this.props.component;
    const panelSpecificMenuOptions = getMenuAdditional(panel, dataSourceApi, timeSeries);
    const additionalMenuItems = panelSpecificMenuOptions.additionalMenuItems || undefined;
    const additionalSubMenuItems = panelSpecificMenuOptions.additionalSubMenuItems || undefined;

    console.log('panelChrome render');
    return (
      <div className="panel-container">
        <PanelHeader title={panel.title}>
          <PanelHeaderMenu
            panel={panel}
            dashboard={dashboard}
            dataSourceApi={dataSourceApi}
            additionalMenuItems={additionalMenuItems}
            additionalSubMenuItems={additionalSubMenuItems}
            timeSeries={timeSeries}
          />
        </PanelHeader>
        <div className="panel-content">
          <DataPanel
            dataSourceApi={dataSourceApi}
            queries={targets}
            timeRange={timeRange}
            isVisible={this.isVisible}
            refreshCounter={refreshCounter}
            onIssueQueryResponse={this.onIssueQueryResponse}
          >
            {({ loading, timeSeries }) => {
              return <PanelComponent loading={loading} timeSeries={timeSeries} timeRange={timeRange} />;
            }}
          </DataPanel>
        </div>
      </div>
    );
  }
}
