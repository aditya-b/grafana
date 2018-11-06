import { LoadingState, TimeSeries, TimeRange } from './series';

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

export interface PanelMenuExtras {
  additionalMenuItems: PanelHeaderMenuItemProps[];
  additionalSubMenuItems: PanelHeaderMenuItemProps[];
}
