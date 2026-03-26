const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

class Logger {
  constructor() {
    this.level = LOG_LEVELS[process.env.LOG_LEVEL?.toLowerCase()] ?? LOG_LEVELS.info;
  }

  _log(level, message, context) {
    if (LOG_LEVELS[level] > this.level) return;
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context && Object.keys(context).length > 0 ? { context } : {}),
    };
    const out = level === 'error' ? process.stderr : process.stdout;
    out.write(JSON.stringify(entry) + '\n');
  }

  error(message, context) { this._log('error', message, context); }
  warn(message, context)  { this._log('warn',  message, context); }
  info(message, context)  { this._log('info',  message, context); }
  debug(message, context) { this._log('debug', message, context); }
}

export const logger = new Logger();
