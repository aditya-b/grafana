import { Emitter } from 'app/core/utils/emitter';
import { removeModelDefaults } from 'app/core/utils/model_utils';
import _ from 'lodash';

export interface GridPos {
  x: number;
  y: number;
  w: number;
  h: number;
  static?: boolean;
}

const notPersistedProperties: { [str: string]: boolean } = {
  events: true,
  fullscreen: true,
  isEditing: true,
  hasRefreshed: true,
  defaults: true,
};

const basicDefaults: any = {
  gridPos: { x: 0, y: 0, h: 3, w: 6 },
  datasource: null,
  targets: [{}],
};

export class PanelModel {
  id: number;
  gridPos: GridPos;
  type: string;
  title: string;
  alert?: any;
  scopedVars?: any;
  repeat?: string;
  repeatIteration?: number;
  repeatPanelId?: number;
  repeatDirection?: string;
  repeatedByRow?: boolean;
  minSpan?: number;
  collapsed?: boolean;
  panels?: any;
  soloMode?: boolean;
  targets: any[];
  datasource: string;
  thresholds?: any;

  // non persisted
  fullscreen: boolean;
  isEditing: boolean;
  hasRefreshed: boolean;
  events: Emitter;
  defaults: object;

  constructor(model) {
    this.events = new Emitter();
    this.defaults = {};

    // assign persisted props to this
    Object.assign(this, model);

    // add basic defaults
    this.applyDefaults(basicDefaults);
  }

  applyDefaults(defaults: object) {
    // apply defaults to this
    _.defaultsDeep(this, _.cloneDeep(defaults));
    // assign defaults to defaults object
    Object.assign(this.defaults, defaults);
  }

  getSaveModel() {
    return removeModelDefaults(this, this.defaults, notPersistedProperties);
  }

  setViewMode(fullscreen: boolean, isEditing: boolean) {
    this.fullscreen = fullscreen;
    this.isEditing = isEditing;
    this.events.emit('panel-size-changed');
  }

  updateGridPos(newPos: GridPos) {
    let sizeChanged = false;

    if (this.gridPos.w !== newPos.w || this.gridPos.h !== newPos.h) {
      sizeChanged = true;
    }

    this.gridPos.x = newPos.x;
    this.gridPos.y = newPos.y;
    this.gridPos.w = newPos.w;
    this.gridPos.h = newPos.h;

    if (sizeChanged) {
      this.events.emit('panel-size-changed');
    }
  }

  resizeDone() {
    this.events.emit('panel-size-changed');
  }

  refresh() {
    this.hasRefreshed = true;
    this.events.emit('refresh');
  }

  render() {
    if (!this.hasRefreshed) {
      this.refresh();
    } else {
      this.events.emit('render');
    }
  }

  panelInitialized() {
    this.events.emit('panel-initialized');
  }

  initEditMode() {
    this.events.emit('panel-init-edit-mode');
  }

  changeType(pluginId: string) {
    this.type = pluginId;

    delete this.thresholds;
    delete this.alert;
  }

  destroy() {
    this.events.removeAllListeners();
  }
}
