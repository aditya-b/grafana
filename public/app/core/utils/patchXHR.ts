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

// class RequestsMonitor {
//   private queue: Record<string, Map<string, { startTs: number; endTs: number | null; duration: number | null }>> = {};
//   private counters: Record<string, number> = {};
//   private lastCompletedTs: Record<string, number> = {};
//   private logger = loggerFactory('RequestsMonitor');

//   push = (location: string, url: string, ts: number) => {
//     if (!this.queue[location]) {
//       this.queue[location] = new Map();
//     }
//     if (this.counters[location] === undefined) {
//       this.counters[location] = 0;
//     }
//     this.counters[location]++;
//     this.queue[location].set(url, {
//       startTs: ts,
//       endTs: null,
//       duration: null,
//     });
//   };

//   stopMonitoring = (location: string) => {
//     this.queue[location] = null;
//     this.logger.log('stopped monitoring', location, this.queue);
//   };

//   markComplete = (location: string, url: string) => {
//     const endTs = performance.now();

//     if (this.queue[location]) {
//       const inFlight = this.queue[location].get(url);
//       this.queue[location].set(url, {
//         ...inFlight,
//         endTs,
//         duration: endTs - inFlight.startTs,
//       });
//       this.lastCompletedTs[location] = endTs;
//       this.counters[location]--;
//     }
//   };

//   hasInFlightRequests = (location: string) => {
//     return this.counters[location] !== undefined && this.counters[location] !== 0;
//   };

//   getLastCompletedRequest = (location: string) => {
//     return this.lastCompletedTs[location];
//   };
// }

export class NavigationMonitor {
  private currentLocation: string | null = null;
  private requestsMonitor: RequestsMonitor;
  private threshold = 2000;
  private navigationInProgress = false;
  private lastCompletedLongTask: number;
  private navigationStartTs: number;
  // @ts-ignore
  private longTasksObserver;

  private navigationCounter = 0;
  private logger = loggerFactory('🧭 NavigationMonitor');

  constructor() {
    this.requestsMonitor = new RequestsMonitor();
    patchXMLHTTPRequest(this.monitorRequest, this.stopMonitoringRequest);
  }

  monitorRequest = (url: string) => {
    this.requestsMonitor.push(this.currentLocation, url, performance.now());
  };

  stopMonitoringRequest = (url: string, abandoned?: boolean) => {
    this.requestsMonitor.markComplete(this.currentLocation, url);
  };

  startMonitoringLocation = (location: string) => {
    const startTs = this.navigationCounter === 0 ? 0 : performance.now();
    this.navigationCounter++;
    if (this.navigationInProgress) {
      this.stopMonitoringLocation(location, this.navigationStartTs, performance.now(), true);
    }

    this.logger.info('started', location, startTs);
    this.navigationStartTs = startTs;
    this.longTasksObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      for (const entry of entries) {
        if (entry.startTime > startTs) {
          this.lastCompletedLongTask = entry.startTime + entry.duration;
        }
      }
    });

    this.navigationInProgress = true;
    this.currentLocation = location;
    this.longTasksObserver.observe({ entryTypes: ['longtask'] });
    requestAnimationFrame(() => this.validateStartedNavigation(startTs));
  };

  stopMonitoringLocation = (location: string, startTs: number, endTs: number, abandoned?: boolean) => {
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

    if (this.navigationInProgress) {
      if (this.navigationCounter === 1) {
        this.getLastLongTask();
      }

      const lastLongTaskTs = this.lastCompletedLongTask || startTs;
      const lastCompletedRequestTs = this.requestsMonitor.getLastCompletedRequest(this.currentLocation) || startTs;
      const sinceLastLongTask = now - lastLongTaskTs;
      const sinceLastRequest = now - lastCompletedRequestTs;
      const hasInFlightRequests = this.requestsMonitor.hasInFlightRequests(this.currentLocation);

      // If there are any ongoing requests defer check to next frame
      if (hasInFlightRequests) {
        requestAnimationFrame(() => this.validateStartedNavigation(startTs));
        return;
      }

      // if last request and last long frame happened later than the 1000ms threshold
      // we assume navigation has finished
      if (sinceLastLongTask > this.threshold && sinceLastRequest > this.threshold) {
        this.logger.info(`It\'s been quiet for some time`, { sinceLastLongTask, sinceLastRequest });
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
