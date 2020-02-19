import React, { PureComponent } from 'react';

import { LogsMetaKind, LogsDedupStrategy, LogRowModel, LogsMetaItem } from '@grafana/data';
import { Forms } from '@grafana/ui';
import { cx, css } from 'emotion';

export const fieldClass = css`
  margin-right: 28px;
  align-items: center;
  height: 35px;
`;

export const labelClass = css`
  margin-right: 12px;
  margin-bottom: 0px;
`;

export const pushRight = css`
  margin-right: auto;
`;

interface Props {
  logRows?: LogRowModel[];
  logsMeta?: LogsMetaItem[];
  dedupedRows?: LogRowModel[];
  showLabels: boolean;
  showTime: boolean;
  wrapLogMessage: boolean;
  dedupStrategy: LogsDedupStrategy;
  onDedupStrategyChange: (dedupStrategy: LogsDedupStrategy) => void;
  onLabelsChange: (showLabels: boolean) => void;
  onTimeChange: (showTime: boolean) => void;
  onWrapLogMessageChange: (wrapLogMessage: boolean) => void;
}

export class LogsControls extends PureComponent<Props> {
  onChangeDedup = (dedup: LogsDedupStrategy) => {
    return this.props.onDedupStrategyChange(dedup);
  };

  onChangeLabels = (event?: React.SyntheticEvent) => {
    const target = event && (event.target as HTMLInputElement);
    return this.props.onLabelsChange(target.checked);
  };

  onChangeTime = (event?: React.SyntheticEvent) => {
    const target = event && (event.target as HTMLInputElement);
    return this.props.onTimeChange(target.checked);
  };

  onChangewrapLogMessage = (event?: React.SyntheticEvent) => {
    const target = event && (event.target as HTMLInputElement);
    return this.props.onWrapLogMessageChange(target.checked);
  };

  render() {
    const { logRows, logsMeta, dedupedRows, showTime, showLabels, dedupStrategy, wrapLogMessage } = this.props;

    if (!logRows) {
      return null;
    }

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
        <Forms.Field label="Time" horizontal className={cx(fieldClass)} labelClassName={cx(labelClass)}>
          <Forms.Switch value={showTime} onChange={this.onChangeTime} />
        </Forms.Field>
        <Forms.Field label="Unique labels" horizontal className={cx(fieldClass)} labelClassName={cx(labelClass)}>
          <Forms.Switch value={showLabels} onChange={this.onChangeLabels} />
        </Forms.Field>
        <Forms.Field label="Wrap lines" horizontal className={cx(fieldClass)} labelClassName={cx(labelClass)}>
          <Forms.Switch value={wrapLogMessage} onChange={this.onChangewrapLogMessage} />
        </Forms.Field>
        <Forms.Field label="Dedup" horizontal className={cx(fieldClass, pushRight)} labelClassName={cx(labelClass)}>
          <Forms.RadioButtonGroup
            options={Object.keys(LogsDedupStrategy).map((dedupType: string) => ({
              label: dedupType,
              value: dedupType,
            }))}
            value={dedupStrategy}
            onChange={this.onChangeDedup}
          />
        </Forms.Field>
      </>
    );
  }
}
