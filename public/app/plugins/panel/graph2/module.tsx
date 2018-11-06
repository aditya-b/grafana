// Libraries
import _ from 'lodash';
import React, { PureComponent } from 'react';
import Slider, { createSliderWithTooltip } from 'rc-slider';

// Components
import Graph from 'app/viz/Graph';
import { getTimeSeriesVMs } from 'app/viz/state/timeSeries';
import { Switch } from 'app/core/components/Switch/Switch';

// Types
import { PanelProps, NullValueMode } from 'app/types';
import { Label } from '../../../core/components/Label/Label';

const SliderWithTooltip = createSliderWithTooltip(Slider);

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

  renderSlider(value, onChange) {
    return (
      <div
        className="width-10"
        style={{
          padding: '0 10px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          border: '1px solid #262626',
        }}
      >
        <SliderWithTooltip
          min={0}
          max={10}
          step={1}
          value={value}
          onChange={onChange}
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
            width: '20px',
            height: '20px',
            marginTop: '-8px',
          }}
          railStyle={{ backgroundColor: 'white', width: '100%' }}
          tipFormatter={v => v}
        />
      </div>
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
              <Label width={7}>Fill</Label>
              {this.renderSlider(this.state.fill, this.onFillChange)}
            </div>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <div className="gf-form" style={{ marginBottom: '10px' }}>
              <Label width={7}>Line Width</Label>
              {this.renderSlider(this.state.lineWidth, this.onLineWidthChange)}
            </div>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <div className="gf-form" style={{ marginBottom: '10px' }}>
              <Label width={7}>Point Radius</Label>
              {this.renderSlider(this.state.pointRadius, this.onPointRadiusChange)}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export { Graph2 as PanelComponent, TextOptions as PanelOptions };
