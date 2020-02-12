import React, { PureComponent } from 'react';

import { LogsMetaKind, LogsDedupStrategy, LogRowModel, LogsDedupDescription, LogsMetaItem } from '@grafana/data';
import { Switch, ToggleButtonGroup, ToggleButton } from '@grafana/ui';
import store from 'app/core/store';

enum DisplayFormat {
  'Logs',
  'Table',
}

const SETTINGS_KEYS = {
  showLabels: 'grafana.explore.logs.showLabels',
  showTime: 'grafana.explore.logs.showTime',
  wrapLogMessage: 'grafana.explore.logs.wrapLogMessage',
  displayFormat: 'grafana.explore.logs.displayFormat',
  dedupStrategy: 'grafana.explore.logs.dedupStrategy',
};

interface Props {
  logRows?: LogRowModel[];
  logsMeta?: LogsMetaItem[];
  dedupedRows?: LogRowModel[];
  onDedupStrategyChange: (dedupStrategy: LogsDedupStrategy) => void;
}

interface State {
  showLabels: boolean;
  showTime: boolean;
  wrapLogMessage: boolean;
  displayFormat: DisplayFormat;
  dedupStrategy: LogsDedupStrategy;
}

export class LogsControls extends PureComponent<Props> {
  getStoreState = () =>
    ({
      showLabels: store.getBool(SETTINGS_KEYS.showLabels, false),
      showTime: store.getBool(SETTINGS_KEYS.showTime, true),
      wrapLogMessage: store.getBool(SETTINGS_KEYS.wrapLogMessage, true),
      displayFormat: store.getObject(SETTINGS_KEYS.displayFormat, DisplayFormat.Logs),
      dedupStrategy: store.getObject(SETTINGS_KEYS.dedupStrategy, LogsDedupStrategy.none),
    } as State);

  onChangeDedup = (dedup: LogsDedupStrategy) => {
    const { dedupStrategy } = this.getStoreState();
    if (dedupStrategy === dedup) {
      return this.props.onDedupStrategyChange(LogsDedupStrategy.none);
    }
    return this.props.onDedupStrategyChange(dedup);
  };

  onChangeLabels = (event?: React.SyntheticEvent) => {
    const target = event && (event.target as HTMLInputElement);
    if (target) {
      const showLabels = target.checked;
      this.setState({
        showLabels,
      });
      store.set(SETTINGS_KEYS.showLabels, showLabels);
    }
  };

  onChangeTime = (event?: React.SyntheticEvent) => {
    const target = event && (event.target as HTMLInputElement);
    if (target) {
      const showTime = target.checked;
      this.setState({
        showTime,
      });
      store.set(SETTINGS_KEYS.showTime, showTime);
    }
  };

  onChangeFormat = (displayFormat: DisplayFormat) => {
    this.setState({
      displayFormat,
    });
    store.set(SETTINGS_KEYS.displayFormat, displayFormat);
  };

  onChangewrapLogMessage = (event?: React.SyntheticEvent) => {
    const target = event && (event.target as HTMLInputElement);
    if (target) {
      const wrapLogMessage = target.checked;
      this.setState({
        wrapLogMessage,
      });
      store.set(SETTINGS_KEYS.wrapLogMessage, wrapLogMessage);
    }
  };

  render() {
    const { logRows, logsMeta, dedupedRows } = this.props;

    if (!logRows) {
      return null;
    }

    const { showLabels, showTime, wrapLogMessage, dedupStrategy } = this.getStoreState();
    const dedupCount = dedupedRows
      ? dedupedRows.reduce((sum, row) => (row.duplicates ? sum + row.duplicates : sum), 0)
      : 0;
    const meta = logsMeta ? [...logsMeta] : [];

    if (dedupStrategy !== LogsDedupStrategy.none) {
      meta.push({
        label: 'Dedup count',
        value: dedupCount,
        kind: LogsMetaKind.Number,
      });
    }

    return (
      <>
        <Switch label="Time" checked={showTime} onChange={this.onChangeTime} transparent />
        <Switch label="Unique labels" checked={showLabels} onChange={this.onChangeLabels} transparent />
        <Switch label="Wrap lines" checked={wrapLogMessage} onChange={this.onChangewrapLogMessage} transparent />
        <ToggleButtonGroup label="Dedup" transparent={true}>
          {Object.keys(LogsDedupStrategy).map((dedupType: string, i) => (
            <ToggleButton
              key={i}
              value={dedupType}
              onChange={this.onChangeDedup}
              selected={dedupStrategy === dedupType}
              // @ts-ignore
              tooltip={LogsDedupDescription[dedupType]}
            >
              {dedupType}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </>
    );
  }
}
