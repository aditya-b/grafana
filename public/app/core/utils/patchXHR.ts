import { loggerFactory } from './loggerFactory';

export function patchXMLHTTPRequest(
  beforeXHRSendCb: (url: string) => void,
  onRequestCompletedCb: (url: string) => void
) {
  const open = XMLHttpRequest.prototype.open;

  // @ts-ignore
  XMLHttpRequest.prototype.open = function(...args) {
    // No arrow function.
    const url: string = args[1];
    beforeXHRSendCb(url);
    this.addEventListener('readystatechange', () => {
      // readyState 4 corresponds to 'DONE'
      if (this.readyState === 4) {
        onRequestCompletedCb(url);
      }
    });
    return open.apply(this, args);
  };
}

class RequestsMonitor {
  private queue: Map<string, number> = new Map();
  // private counters: Record<string, number> = {};
  // private lastCompletedTs1: Record<string, number> = {};
  private lastCompletedTs: number;
  // private logger = loggerFactory('RequestsMonitor');

  // Defines timestamp from which the requests should be monitored
  private tsPointer: number;

  push = (url: string, ts: number) => {
    this.queue.set(url, ts);
  };

  bumpTs = (ts: number) => {
    this.tsPointer = ts;
  };

  markComplete = (url: string) => {
    const endTs = performance.now();
    this.queue.delete(url);
    this.lastCompletedTs = endTs;
  };

  hasInFlightRequests = () => {
    const res = Array.from(this.queue.values()).filter(ts => {
      return ts > this.tsPointer;
    });
    return res.length > 0;
  };

  getLastCompletedRequest = (location: string) => {
    return this.lastCompletedTs;
  };
}

export class NavigationMonitor {
  private currentLocation: string | null = null;
  private requestsMonitor: RequestsMonitor;
  private threshold = 2000;
  private navigationInProgress = false;
  private lastCompletedLongTask: number;
  private lastCompletedLoadable: number;
  private navigationStartTs: number;
  // @ts-ignore
  private longTasksObserver;
  // @ts-ignore
  private loadableObserver;

  private navigationCounter = 0;
  private logger = loggerFactory('🧭 NavigationMonitor');
  private lastPerfMarkTs = 0;
  private loadableEntries: any[] = [];

  constructor() {
    this.requestsMonitor = new RequestsMonitor();
    patchXMLHTTPRequest(this.monitorRequest, this.stopMonitoringRequest);
    const now = performance.now();

    const entries = performance.getEntriesByType('mark');
    for (const entry of entries) {
      if (entry.startTime < now) {
        if (entry.name.startsWith('loadable')) {
          this.loadableEntries.push(entry);
          this.lastPerfMarkTs = entry.startTime;
        }
      }
    }

    // console.log('INtO', this.loadableEntries);
  }

  monitorRequest = (url: string) => {
    this.requestsMonitor.push(url, performance.now());
  };

  stopMonitoringRequest = (url: string) => {
    this.requestsMonitor.markComplete(url);
  };

  startMonitoringLocation = (location: string) => {
    const startTs = this.navigationCounter === 0 ? 0 : performance.now();
    this.navigationCounter++;

    if (this.navigationInProgress) {
      this.stopMonitoringLocation(location, this.navigationStartTs, performance.now(), true);
    }

    this.logger.info('started', location, startTs);
    this.navigationStartTs = startTs;
    this.requestsMonitor.bumpTs(startTs);

    this.longTasksObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      for (const entry of entries) {
        if (entry.startTime > startTs) {
          this.lastCompletedLongTask = entry.startTime + entry.duration;
        }
      }
    });

    this.loadableObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();

      const searchFrom = this.lastPerfMarkTs > startTs ? this.lastPerfMarkTs : startTs;

      for (const entry of entries) {
        if (entry.startTime > searchFrom) {
          if (entry.name.startsWith('loadable')) {
            this.loadableEntries.push(entry);
            this.lastPerfMarkTs = entry.startTime;
          }
        }
      }

      const finnishedCount = this.loadableEntries.filter(e => e.name.endsWith('finished'));
      if (finnishedCount.length === this.loadableEntries.length - finnishedCount.length) {
        this.lastCompletedLoadable = performance.now();
      }
    });

    this.navigationInProgress = true;
    this.currentLocation = location;
    this.longTasksObserver.observe({ entryTypes: ['longtask'] });
    this.loadableObserver.observe({ entryTypes: ['mark'] });
    requestAnimationFrame(() => this.validateStartedNavigation(startTs));
  };

  stopMonitoringLocation = (location: string, startTs: number, endTs: number, abandoned?: boolean) => {
    // debugger
    this.navigationInProgress = false;
    this.requestsMonitor.stopMonitoring(location);
    this.currentLocation = location;
    this.longTasksObserver.disconnect();
    this.longTasksObserver = null;
    this.lastCompletedLongTask = null;
    this.logger.info(`finished${abandoned ? '[Abandoned]' : ''}`, 'took: ', endTs - startTs, 'started at: ', startTs);
  };

  getLastLongTask = () => {
    let lastLongTaskTs = 0;
    // TODO: replace with TTI global object
    // @ts-ignore
    if (window.__navMonitor && window.__navMonitor.e.length > 0) {
      // @ts-ignore
      const entries = window.__navMonitor.e;
      for (const entry of entries) {
        if (entry.startTs + entry.duration > lastLongTaskTs) {
          lastLongTaskTs = entry.startTs + entry.duration;
        }
      }
    }

    if (lastLongTaskTs > this.lastCompletedLongTask) {
      this.lastCompletedLongTask = lastLongTaskTs;
    }
  };

  validateStartedNavigation = (startTs: number) => {
    const now = performance.now();
    let threshold = this.threshold;
    if (this.navigationInProgress) {
      if (this.navigationCounter === 1) {
        this.getLastLongTask();
        threshold = 5000;
      }

      const lastLongTaskTs = this.lastCompletedLongTask || startTs;
      const lastCompletedRequestTs = this.requestsMonitor.getLastCompletedRequest(this.currentLocation) || startTs;
      const lastLoadableTs = this.lastCompletedLoadable || startTs;
      const sinceLastLongTask = now - lastLongTaskTs;
      const sinceLastRequest = now - lastCompletedRequestTs;
      const sinceLastLoadable = now - lastLoadableTs;
      const hasInFlightRequests = this.requestsMonitor.hasInFlightRequests();
      let hasInFlightLoadables = true;
      const finnishedCount = this.loadableEntries.filter(e => e.name.endsWith('finished'));

      if (finnishedCount.length === this.loadableEntries.length - finnishedCount.length) {
        hasInFlightLoadables = false;
      } else {
        console.log('not finsihed loadbales');
      }

      // If there are any ongoing requests defer check to next frame
      if (hasInFlightRequests || hasInFlightLoadables) {
        requestAnimationFrame(() => this.validateStartedNavigation(startTs));
        return;
      }

      // if last request and last long frame happened later than the 1000ms threshold
      // we assume navigation has finished
      if (sinceLastLongTask > threshold && sinceLastRequest > threshold && sinceLastLoadable > threshold) {
        this.logger.info(`It\'s been quiet for some time ${threshold}`, { sinceLastLongTask, sinceLastRequest });
        this.stopMonitoringLocation(
          this.currentLocation,
          startTs,
          lastLongTaskTs > lastCompletedRequestTs ? lastLongTaskTs : lastCompletedRequestTs
        );
      } else {
        requestAnimationFrame(() => this.validateStartedNavigation(startTs));
      }
    } else {
      return;
    }
  };
}
