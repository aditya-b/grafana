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

interface State {
  fill: number;
  lineWidth: number;
  pointRadius: number;
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

export class TextOptions extends PureComponent<any, State> {
  state = {
    fill: 1,
    lineWidth: 1,
    pointRadius: 1,
  };

  onFillChange = value => this.setState({ fill: value });
  onLineWidthChange = value => this.setState({ lineWidth: value });
  onPointRadiusChange = value => this.setState({ pointRadius: value });

  onChange = () => {};

  renderSlider(min, max, step, value, onChange) {
    return (
      <Slider
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        dots={true}
        className="width-15"
        activeDotStyle={{
          backgroundColor: '#ecbb13',
        }}
        dotStyle={{
          border: 'none',
        }}
        trackStyle={{ backgroundColor: '#ecbb13' }}
        handleStyle={{
          border: 'none',
          backgroundColor: '#eb7b18',
        }}
        railStyle={{ backgroundColor: 'white', width: '100%' }}
      />
    );
  }

  render() {
    return (
      <div>
        <div className="section gf-form-group">
          <h5 className="section-heading">Draw Modes</h5>
          <Switch label="Lines" checked={true} onChange={this.onChange} />
        </div>
        <div className="section gf-form-group">
          <h5 className="section-heading">Mode options</h5>
          <div style={{ marginBottom: '20px' }}>
            <div className="gf-form" style={{ marginBottom: '10px' }}>
              <Label width={11}>Fill</Label>
              <input type="text" className="gf-form-input width-5" readOnly={true} value={this.state.fill} />
            </div>
            <div className="gf-form" style={{ display: 'flex', justifyContent: 'center' }}>
              {this.renderSlider(1, 10, 1, this.state.fill, this.onFillChange)}
            </div>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <div className="gf-form" style={{ marginBottom: '10px' }}>
              <Label width={11}>Line Width</Label>
              <input type="text" className="gf-form-input width-5" readOnly={true} value={this.state.lineWidth} />
            </div>
            <div className="gf-form" style={{ display: 'flex', justifyContent: 'center' }}>
              {this.renderSlider(1, 10, 1, this.state.lineWidth, this.onLineWidthChange)}
            </div>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <div className="gf-form" style={{ marginBottom: '10px' }}>
              <Label width={11}>Point Radius</Label>
              <input type="text" className="gf-form-input width-5" readOnly={true} value={this.state.pointRadius} />
            </div>
            <div className="gf-form" style={{ display: 'flex', justifyContent: 'center' }}>
              {this.renderSlider(1, 10, 1, this.state.pointRadius, this.onPointRadiusChange)}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export { Graph2 as PanelComponent, TextOptions as PanelOptions };
