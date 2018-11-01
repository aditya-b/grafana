// Libraries
import React, { ComponentClass, PureComponent } from 'react';

// Services
import { getTimeSrv } from '../time_srv';

// Components
import { PanelHeader } from './PanelHeader/PanelHeader';
import { DataPanel } from './DataPanel';

// Types
import { PanelModel } from '../panel_model';
import { DashboardModel } from '../dashboard_model';
import { TimeRange, PanelProps } from 'app/types';

export interface PanelChromeProps {
  panel: PanelModel;
  dashboard: DashboardModel;
  component: ComponentClass<PanelProps>;
  withMenuOptions: any;
}

export interface PanelChromeState {
  refreshCounter: number;
  timeRange?: TimeRange;
}

export class PanelChrome extends PureComponent<PanelChromeProps, PanelChromeState> {
  constructor(props) {
    super(props);

    this.state = {
      refreshCounter: 0,
    };
  }

  componentDidMount() {
    this.props.panel.events.on('refresh', this.onRefresh);
    this.props.dashboard.panelInitialized(this.props.panel);
  }

  componentWillUnmount() {
    this.props.panel.events.off('refresh', this.onRefresh);
  }

  onRefresh = () => {
    const timeSrv = getTimeSrv();
    const timeRange = timeSrv.timeRange();

    this.setState({
      refreshCounter: this.state.refreshCounter + 1,
      timeRange: timeRange,
    });
  };

  get isVisible() {
    return !this.props.dashboard.otherPanelInFullscreen(this.props.panel);
  }

  render() {
    const { panel, dashboard, withMenuOptions } = this.props;
    const { datasource, targets } = panel;
    const { refreshCounter, timeRange } = this.state;
    const PanelComponent = this.props.component;
    return (
      <div className="panel-container">
        <PanelHeader panel={panel} dashboard={dashboard} withMenuOptions={withMenuOptions} />
        <div className="panel-content">
          <DataPanel
            datasource={datasource}
            queries={targets}
            timeRange={timeRange}
            isVisible={this.isVisible}
            refreshCounter={refreshCounter}
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
