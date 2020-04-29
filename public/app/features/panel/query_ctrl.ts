import _ from 'lodash';
import { auto } from 'angular';

export class QueryCtrl {
  target: any;
  datasource: any;
  panelCtrl: any;
  panel: any;
  hasRawMode: boolean;
  error: string;
  isLastQuery: boolean;

  /** @ngInject */
  constructor(public $scope: any, public $injector: auto.IInjectorService) {
    if (!this.panelCtrl) {
      console.log('[QueryCtrl] Strangely the panelCtrl is only avaliable in $scope', this);
      this.panelCtrl = this.$scope.ctrl.panelCtrl;
    }

    this.panel = this.panelCtrl.panel;
    this.target = this.panelCtrl.target.target;
    this.isLastQuery = _.indexOf(this.panel.targets, this.target) === this.panel.targets.length - 1;
  }

  refresh() {
    this.panelCtrl.refresh();
  }
}
