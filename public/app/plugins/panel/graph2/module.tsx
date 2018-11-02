// Libraries
import _ from 'lodash';
import React, { PureComponent } from 'react';
import Slider from 'rc-slider';

// Components
import Graph from 'app/viz/Graph';
import { getTimeSeriesVMs } from 'app/viz/state/timeSeries';
import { Switch } from 'app/core/components/Switch/Switch';

// Types
import { PanelProps, NullValueMode } from 'app/types';
import { Label } from '../../../core/components/Label/Label';

interface Options {
  showBars: boolean;
}

interface Props extends PanelProps {
  options: Options;
}

export class Graph2 extends PureComponent<Props> {
  constructor(props) {
    super(props);
  }

  render() {
    const { timeSeries, timeRange } = this.props;

    const vmSeries = getTimeSeriesVMs({
      timeSeries: timeSeries,
      nullValueMode: NullValueMode.Ignore,
    });

    return <Graph timeSeries={vmSeries} timeRange={timeRange} />;
  }
}

export class TextOptions extends PureComponent<any> {
  onChange = () => {};

  render() {
    return (
      <div>
        <div className="section gf-form-group">
          <h5 className="section-heading">Draw Modes</h5>
          <Switch label="Lines" checked={true} onChange={this.onChange} />
        </div>
        <div className="section gf-form-group">
          <h5 className="section-heading">Mode options</h5>
          <div className="gf-form">
            <Label width={5}>Fill</Label>
            <Slider
              min={1}
              max={10}
              step={1}
              dots={true}
              dotStyle={{
                border: 'none',
              }}
              trackStyle={{ backgroundColor: 'orange', height: 2 }}
              handleStyle={{
                border: '1px solid red',
                height: 15,
                width: 15,
                backgroundColor: 'white',
              }}
              railStyle={{ backgroundColor: 'white', height: 2 }}
            />
          </div>
        </div>
      </div>
    );
  }
}

export { Graph2 as PanelComponent, TextOptions as PanelOptions };
