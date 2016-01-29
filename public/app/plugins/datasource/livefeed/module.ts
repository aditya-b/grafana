///<reference path="../../../headers/common.d.ts" />

import angular from 'angular';
import moment from 'moment';

import {Observable} from 'vendor/npm/rxjs/Observable';

class LiveFeedDatasource {
  constructor(private instanceSettings, private $q) {
  }

  query(options) {
    var source = new Observable(observer => {
      console.log('LiveFeed: new observer');
      var from = options.range.from.valueOf();
      var to = moment().valueOf();
      var series = {target: 'test', datapoints: []};
      var dpCount = 10;
      var step = (to - from)/dpCount;
      var i;
      var value = 100;
      var current = from;

      for (i = 0; i < dpCount; i++) {
        series.datapoints.push([value, current]);
        value += (Math.random() - 0.5) * 10;
        current += step;
      }

      observer.next({
        data: [series],
        range: {from: from, to: to}
      });

      var cancel = setInterval(() => {
        to = moment().valueOf();
        current = to;
        value += (Math.random() - 0.5) * 10;
        series.datapoints.push([value, current]);
        console.log(series.datapoints.length);

        if (series.datapoints.length > 500) {
          series.datapoints.splice(0, 1);
          from = series.datapoints[0][1];
        }

        observer.next({
          data: [series],
          range: {from: from, to: to}
        });
      }, 50);

      return () => {
        console.log('LiveFeed: dispose observer');
        clearInterval(cancel);
      };
    });

    return source;
  }
}

export {
  LiveFeedDatasource as Datasource,
};

