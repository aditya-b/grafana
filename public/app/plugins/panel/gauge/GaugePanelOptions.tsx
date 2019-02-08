import React, { PureComponent } from 'react';
import {
  PanelOptionsProps,
  ThresholdsEditor,
  Threshold,
  PanelOptionsGrid,
  ValueMappingsEditor,
  ValueMapping,
} from '@grafana/ui';

import ValueOptions from 'app/plugins/panel/gauge/ValueOptions';
import GaugeOptionsEditor from './GaugeOptionsEditor';
import { GaugeOptions } from './types';
import { ThemeProvider } from 'app/core/utils/ConfigProvider';

export const defaultProps = {
  options: {
    minValue: 0,
    maxValue: 100,
    prefix: '',
    showThresholdMarkers: true,
    showThresholdLabels: false,
    suffix: '',
    decimals: 0,
    stat: 'avg',
    unit: 'none',
    valueMappings: [],
    thresholds: [],
  },
};

export default class GaugePanelOptions extends PureComponent<PanelOptionsProps<GaugeOptions>> {
  static defaultProps = defaultProps;

  onThresholdsChanged = (thresholds: Threshold[]) =>
    this.props.onChange({
      ...this.props.options,
      thresholds,
    });

  onValueMappingsChanged = (valueMappings: ValueMapping[]) =>
    this.props.onChange({
      ...this.props.options,
      valueMappings,
    });

  isCombineAndNotSupportedStat() {
    const { options } = this.props;
    const { multiSeriesMode, stat } = options;

    return multiSeriesMode === 'combine' && (stat !== 'min' && stat !== 'max' && stat !== 'avg' && stat !== 'total');
  }

  render() {
    const { onChange, options } = this.props;
    return (
      <ThemeProvider>
        {theme => (
          <>
            {this.isCombineAndNotSupportedStat() && (
              <div style={{ padding: '20px 10px' }}>
                <i className="fa fa-warning" style={{ fontSize: '20px' }} />
                <span style={{ marginLeft: '8px' }}>
                  You have selected a non supported stat for multi series mode Combine
                </span>
              </div>
            )}
            <PanelOptionsGrid>
              <ValueOptions onChange={onChange} options={options} />
              <GaugeOptionsEditor onChange={onChange} options={options} />
              <ThresholdsEditor onChange={this.onThresholdsChanged} thresholds={options.thresholds} theme={theme} />
            </PanelOptionsGrid>

            <ValueMappingsEditor onChange={this.onValueMappingsChanged} valueMappings={options.valueMappings} />
          </>
        )}
      </ThemeProvider>
    );
  }
}
