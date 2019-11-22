import app from './app';
import { NavigationMonitor } from './core/utils/patchXHR';

app.init();
//  ಠ_ಠ
// Literally - ignore the global madness for now (｡ŏ﹏ŏ)
// (ノಠ益ಠ)
// @ts-ignore
window.navMonitor = new NavigationMonitor();
// @ts-ignore
window.navMonitor.startMonitoringLocation(window.location.href);
