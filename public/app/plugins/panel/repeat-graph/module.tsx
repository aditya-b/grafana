import { PanelPlugin } from '@grafana/data';
import { RepeatGraphPanel } from './RepeatGraphPanel';
import { Options, defaults } from './types';

export const plugin = new PanelPlugin<Options>(RepeatGraphPanel).setNoPadding().setDefaults(defaults);
