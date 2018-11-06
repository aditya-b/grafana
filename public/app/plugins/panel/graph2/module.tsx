import _ from 'lodash';
import React, { PureComponent } from 'react';
import Slider, { createSliderWithTooltip } from 'rc-slider';

import Graph from 'app/viz/Graph';
import { Switch } from 'app/core/components/Switch/Switch';

// Types
import { Label } from '../../../core/components/Label/Label';

import { getTimeSeriesVMs } from 'app/viz/state/timeSeries';
import { PanelProps, PanelOptionsProps, NullValueMode } from 'app/types';

const SliderWithTooltip = createSliderWithTooltip(Slider);

interface Options {
  showBars: boolean;
  showLines: boolean;
  showPoints: boolean;
  fill: number;
  lineWidth: number;
  pointRadius: number;

  onChange: (options: Options) => void;
}

interface Props extends PanelProps<Options> {}

export class Graph2 extends PureComponent<Props> {
  constructor(props) {
    super(props);
  }

  render() {
    const { timeSeries, timeRange } = this.props;
    const { fill, lineWidth, pointRadius, showLines, showBars, showPoints } = this.props.options;

    const vmSeries = getTimeSeriesVMs({
      timeSeries: timeSeries,
      nullValueMode: NullValueMode.Ignore,
    });

    return (
      <Graph
        fill={fill}
        lineWidth={lineWidth}
        pointRadius={pointRadius}
        timeSeries={vmSeries}
        timeRange={timeRange}
        showLines={showLines}
        showPoints={showPoints}
        showBars={showBars}
      />
    );
  }
}

export class GraphOptions extends PureComponent<PanelOptionsProps<Options>> {
  onToggleLines = () => {
    this.props.onChange({ ...this.props.options, showLines: !this.props.options.showLines });
  };

  onToggleBars = () => {
    this.props.onChange({ ...this.props.options, showBars: !this.props.options.showBars });
  };

  onTogglePoints = () => {
    this.props.onChange({ ...this.props.options, showPoints: !this.props.options.showPoints });
  };

  onFillChange = value => {
    this.props.onChange({ ...this.props.options, fill: value });
  };

  onLineWidthChange = value => {
    this.props.onChange({ ...this.props.options, lineWidth: value });
  };

  onPointRadiusChange = value => {
    this.props.onChange({ ...this.props.options, pointRadius: value });
  };

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
    const { fill, lineWidth, pointRadius, showBars, showPoints, showLines } = this.props.options;

    return (
      <div>
        <div className="section gf-form-group">
          <h5 className="section-heading">Draw Modes</h5>
          <Switch label="Lines" labelClass="width-5" checked={showLines} onChange={this.onToggleLines} />
          <Switch label="Bars" labelClass="width-5" checked={showBars} onChange={this.onToggleBars} />
          <Switch label="Points" labelClass="width-5" checked={showPoints} onChange={this.onTogglePoints} />
        </div>
        <div className="section gf-form-group">
          <h5 className="section-heading">Mode options</h5>
          <div style={{ marginBottom: '20px' }}>
            <div className="gf-form" style={{ marginBottom: '10px' }}>
              <Label width={7}>Fill</Label>
              {this.renderSlider(fill, this.onFillChange)}
            </div>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <div className="gf-form" style={{ marginBottom: '10px' }}>
              <Label width={7}>Line Width</Label>
              {this.renderSlider(lineWidth, this.onLineWidthChange)}
            </div>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <div className="gf-form" style={{ marginBottom: '10px' }}>
              <Label width={7}>Point Radius</Label>
              {this.renderSlider(pointRadius, this.onPointRadiusChange)}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export { Graph2 as PanelComponent, GraphOptions as PanelOptionsComponent };
