import { LoadingState, TimeSeries, TimeRange, DataSourceApi } from './series';
import { PanelModel } from 'app/features/dashboard/panel_model';

export interface PanelProps {
  timeSeries: TimeSeries[];
  timeRange: TimeRange;
  loading: LoadingState;
}

export enum PanelHeaderMenuItemTypes { // TODO: Evaluate. Remove?
  Button = 'Button', // ?
  Divider = 'Divider',
  Link = 'Link',
  SubMenu = 'SubMenu',
}

export interface PanelHeaderMenuItemProps {
  type: PanelHeaderMenuItemTypes;
  text?: string;
  iconClassName?: string;
  handleClick?: () => void;
  shortcut?: string;
  children?: any;
  subMenu?: PanelHeaderMenuItemProps[];
  role?: string;
}

export interface PanelHeaderMenuAdditional {
  additionalMenuItems: PanelHeaderMenuItemProps[];
  additionalSubMenuItems: PanelHeaderMenuItemProps[];
}

export interface PanelHeaderGetMenuAdditional {
  (panel: PanelModel, dataSourceApi: DataSourceApi, timeSeries: TimeSeries[]): PanelHeaderMenuAdditional;
}
