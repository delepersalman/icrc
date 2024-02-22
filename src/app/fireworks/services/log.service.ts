import { NGXLoggerMonitor, NGXLogInterface } from 'ngx-logger';

export class FireworksLoggerMonitor implements NGXLoggerMonitor {
  onLog(log: NGXLogInterface) {
    console.log('LoggerMonitor', log);
  }
}
