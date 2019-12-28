import React from 'react';
import { ThresholdsMode } from '@grafana/data';
import { Table } from './Table';
import { withCenteredStory } from '../../utils/storybook/withCenteredStory';
import { number } from '@storybook/addon-knobs';
import { useTheme } from '../../themes';
import mdx from './Table.mdx';
import {
  DataFrame,
  MutableDataFrame,
  FieldType,
  GrafanaTheme,
  applyFieldOverrides,
  FieldMatcherID,
  ConfigOverrideRule,
} from '@grafana/data';

export default {
  title: 'Visualizations/Table',
  component: Table,
  decorators: [withCenteredStory],
  parameters: {
    docs: {
      page: mdx,
    },
  },
};

function buildData(theme: GrafanaTheme, overrides: ConfigOverrideRule[]): DataFrame {
  const data = new MutableDataFrame({
    fields: [
      { name: 'Time', type: FieldType.time, values: [] }, // The time field
      {
        name: 'Quantity',
        type: FieldType.number,
        values: [],
        config: {
          decimals: 0,
          custom: {
            align: 'center',
          },
        },
      },
      { name: 'Status', type: FieldType.string, values: [] }, // The time field
      {
        name: 'Value',
        type: FieldType.number,
        values: [],
        config: {
          decimals: 2,
        },
      },
      {
        name: 'Progress',
        type: FieldType.number,
        values: [],
        config: {
          unit: 'percent',
          custom: {
            width: 50,
          },
        },
      },
    ],
  });

  for (let i = 0; i < 1000; i++) {
    data.appendRow([
      new Date().getTime(),
      Math.random() * 2,
      Math.random() > 0.7 ? 'Active' : 'Cancelled',
      Math.random() * 100,
      Math.random() * 100,
    ]);
  }

  return applyFieldOverrides({
    data: [data],
    fieldOptions: {
      overrides,
      defaults: {},
    },
    theme,
    replaceVariables: (value: string) => value,
  })[0];
}

export const Simple = () => {
  const theme = useTheme();
  const width = number('width', 700, {}, 'Props');
  const data = buildData(theme, []);

  return (
    <div className="panel-container" style={{ width: 'auto' }}>
      <Table data={data} height={500} width={width} />
    </div>
  );
};

export const BarGaugeCell = () => {
  const theme = useTheme();
  const width = number('width', 700, {}, 'Props');
  const data = buildData(theme, [
    {
      matcher: { id: FieldMatcherID.byName, options: 'Progress' },
      properties: [
        { path: 'custom.width', value: '200' },
        { path: 'custom.displayMode', value: 'gradient-gauge' },
        { path: 'min', value: '0' },
        { path: 'max', value: '100' },
      ],
    },
  ]);

  return (
    <div className="panel-container" style={{ width: 'auto' }}>
      <Table data={data} height={500} width={width} />
    </div>
  );
};

function buildDataNumberMatrix(theme: GrafanaTheme, overrides: ConfigOverrideRule[]): DataFrame {
  const data = new MutableDataFrame({
    fields: [
      { name: 'Server A', type: FieldType.number, values: [] },
      { name: 'Server B', type: FieldType.number, values: [] },
      { name: 'Server C', type: FieldType.number, values: [] },
      { name: 'Server D', type: FieldType.number, values: [] },
      { name: 'Server E', type: FieldType.number, values: [] },
      { name: 'Server F', type: FieldType.number, values: [] },
    ],
  });

  for (let i = 0; i < 1000; i++) {
    data.appendRow([
      (i * 2 + 20) % 100,
      (i * 2 + 30) % 100,
      (i * 2 + 50) % 100,
      (i * 2 + 60) % 100,
      (i * 2 + 70) % 100,
      (i * 2 + 80) % 100,
    ]);
  }

  return applyFieldOverrides({
    data: [data],
    fieldOptions: {
      overrides,
      defaults: {},
    },
    theme,
    replaceVariables: (value: string) => value,
  })[0];
}

export const ColoredCells = () => {
  const thresholds = {
    mode: ThresholdsMode.Absolute,
    step: [
      { color: 'blue', value: -Infinity },
      { color: 'green', value: 0 },
      { color: 'orange', value: 60 },
      { color: 'red', value: 80 },
    ],
  };

  const theme = useTheme();
  const width = number('width', 750, {}, 'Props');
  const data = buildDataNumberMatrix(theme, [
    {
      matcher: { id: FieldMatcherID.numeric },
      properties: [
        { path: 'custom.displayMode', value: 'color-background' },
        { path: 'min', value: '0' },
        { path: 'max', value: '100' },
        { path: 'thresholds', value: thresholds },
      ],
    },
  ]);

  return (
    <div className="panel-container" style={{ width: 'auto' }}>
      <Table data={data} height={500} width={width} />
    </div>
  );
};
