import app from './app';
// @ts-ignore
import ttiPolyfill from 'tti-polyfill';

import { getPerformanceConsumer } from './core/services/echo/consumers/PerformanceConsumer';
import { setEchoMeta, reportPerformance, registerEchoConsumer } from './core/services/echo/EchoSrv';
import { NavigationMonitor } from './core/utils/patchXHR';

ttiPolyfill.getFirstConsistentlyInteractive().then((tti: any) => {
  reportPerformance('tti', tti);
});

setEchoMeta({
  screenSize: {
    width: window.innerWidth,
    height: window.innerHeight,
  },
  windowSize: {
    width: window.screen.width,
    height: window.screen.height,
  },
  userAgent: window.navigator.userAgent,
  url: window.location.href,
});

// TODO: Pass url from env
registerEchoConsumer(getPerformanceConsumer({ url: '/api/metrics' }));

window.addEventListener('DOMContentLoaded', () => {
  reportPerformance('dcl', Math.round(performance.now()));
});

app.init();
//  ಠ_ಠ
// Literally - ignore the global madness for now (｡ŏ﹏ŏ)
// (ノಠ益ಠ)
// @ts-ignore
window.navMonitor = new NavigationMonitor();
// @ts-ignore
window.navMonitor.startMonitoringLocation(window.location.href);
