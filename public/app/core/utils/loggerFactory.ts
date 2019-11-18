export type ConsoleMethod = 'log' | 'info' | 'warn' | 'error';

const log = (method: ConsoleMethod, ...args: any) => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
  console[method](...args);
};

export const loggerFactory = (namespace: string) => ({
  log: (...args: any) => log('log', `${namespace}[@${Math.round(performance.now())}]:`, ...args),
  info: (...args: any) => log('info', `${namespace}[@${Math.round(performance.now())}]:`, ...args),
  warn: (...args: any) => log('warn', `${namespace}[@${Math.round(performance.now())}]:`, ...args),
  error: (...args: any) => log('error', `${namespace}[@${Math.round(performance.now())}]:`, ...args),
});
