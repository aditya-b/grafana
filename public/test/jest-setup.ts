import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

import 'jquery';
import $ from 'jquery';
import 'angular';
import angular from 'angular';

angular.module('grafana', ['ngRoute']);
angular.module('grafana.services', ['ngRoute', '$strap.directives']);
angular.module('grafana.panels', []);
angular.module('grafana.controllers', []);
angular.module('grafana.directives', []);
angular.module('grafana.filters', []);
angular.module('grafana.routes', ['ngRoute']);

jest.mock('app/core/core', () => ({}));
jest.mock('app/features/plugins/plugin_loader', () => ({}));

const global = window as any;
global.$ = global.jQuery = $;

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key: string) => {
      return store[key];
    },
    setItem: (key: string, value) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

global.localStorage = localStorageMock;
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
