// Libraries
import $ from 'jquery';
import React, { PureComponent, ReactChildren } from 'react';
// Types
import { FlotPlotOptions, FlotSeries } from '@grafana/data';
import _ from 'lodash';

export interface GraphProps extends FlotPlotOptions {
  data: Array<Array<[number, number]> | FlotSeries>;
  width: number;
  height: number;
  children?: ReactChildren;
}

export class FlotGraph extends PureComponent<GraphProps> {
  element: HTMLElement | null = null;
  $element: any;

  componentDidUpdate(prevProps: GraphProps) {
    if (prevProps !== this.props) {
      console.log('drawing');
      this.draw();
    } else {
      console.log('not drawing');
    }
  }

  componentDidMount() {
    this.draw();
    if (this.element) {
      this.$element = $(this.element);
    }
  }

  draw() {
    if (this.element === null) {
      return;
    }

    const flotOptions = _.omit(this.props, 'data');

    try {
      $.plot(this.element, this.props.data, flotOptions);
    } catch (err) {
      console.log('Graph rendering error', err, flotOptions, this.props.data);
      throw new Error('Error rendering panel');
    }
  }

  render() {
    const { data, width, height, children } = this.props;
    const noDataToBeDisplayed = data.length === 0;
    return (
      <div className="graph-panel">
        <div className="graph-panel__chart" ref={e => (this.element = e)} style={{ width, height }} />
        {noDataToBeDisplayed && <div className="datapoints-warning">No data</div>}
        {children}
      </div>
    );
  }
}

export default FlotGraph;
