import {
  LogsModel,
  GraphSeriesXY,
  DataFrame,
  //FieldType,
  TimeZone,
  toDataFrame,
  getDisplayProcessor,
  ExploreMode,
} from '@grafana/data';
import { ExploreItemState } from 'app/types/explore';
import TableModel, { mergeTablesIntoModel } from 'app/core/table_model';
import { sortLogsResult, refreshIntervalToSortOrder } from 'app/core/utils/explore';
import { dataFrameToLogsModel } from 'app/core/logs_model';
import { getGraphSeriesModel } from 'app/plugins/panel/graph2/getGraphSeriesModel';
import { config } from 'app/core/config';

export class ResultProcessor {
  constructor(
    private state: ExploreItemState,
    private dataFrames: DataFrame[],
    private intervalMs: number,
    private timeZone: TimeZone
  ) {}

  getGraphResult(): GraphSeriesXY[] | null {
    const onlyTimeSeries = this.dataFrames.filter(isTimeSeries);

    if (onlyTimeSeries.length === 0) {
      return null;
    }

    return getGraphSeriesModel(
      onlyTimeSeries,
      this.timeZone,
      {},
      {
        lines: {
          show: true,
        },
        points: {
          show: false,
        },
        bars: {
          show: false,
        },
        yaxis: 2,
      },
      { asTable: false, isVisible: true, placement: 'under' }
    );
  }

  getTableResult(): DataFrame | null {
    // For now ignore time series
    // We can change this later, just need to figure out how to
    // Ignore time series only for prometheus
    const onlyTables = this.dataFrames.filter(dataFrame => dataFrame.meta.responseType === 'Logs');

    if (onlyTables.length === 0) {
      return null;
    }

    const tables = onlyTables.map(frame => {
      const { fields } = frame;
      const fieldCount = fields.length;
      const rowCount = frame.length;

      const columns = fields.map(field => ({
        text: field.name,
        type: field.type,
        filterable: field.config.filterable,
      }));

      const rows: any[][] = [];
      for (let i = 0; i < rowCount; i++) {
        const row: any[] = [];
        for (let j = 0; j < fieldCount; j++) {
          row.push(frame.fields[j].values.get(i));
        }
        rows.push(row);
      }

      return new TableModel({
        columns,
        rows,
        meta: frame.meta,
      });
    });

    const mergedTable = mergeTablesIntoModel(new TableModel(), ...tables);
    const data = toDataFrame(mergedTable);

    // set display processor
    for (const field of data.fields) {
      field.display = getDisplayProcessor({
        field,
        theme: config.theme,
      });
    }

    return data;
  }

  getLogsResult(): LogsModel | null {
    const newResults = dataFrameToLogsModel(this.dataFrames, this.intervalMs, this.timeZone);
    const sortOrder = refreshIntervalToSortOrder(this.state.refreshInterval);
    const sortedNewResults = sortLogsResult(newResults, sortOrder);
    const rows = sortedNewResults.rows;
    const series = sortedNewResults.series;
    return { ...sortedNewResults, rows, series };
  }
}

export function isTimeSeries(frame: DataFrame): boolean {
  return frame.meta.responseType === 'Metrics';
  // let hasTimeField = false;
  // let hasNumberField = false;
  // for (const field of frame.fields) {
  //   hasTimeField = hasTimeField || field.type === FieldType.time;
  //   hasNumberField = hasNumberField || field.type === FieldType.number;
  //   if (hasTimeField && hasNumberField) {
  //     break;
  //   }
  // }

  // return hasTimeField && hasNumberField;
}
