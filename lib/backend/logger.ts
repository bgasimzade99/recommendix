// Structured logging for production-grade backend
type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  duration?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  private formatLog(entry: LogEntry): string {
    const { timestamp, level, message, context, duration, error } = entry;

    let logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    if (duration !== undefined) {
      logMessage += ` (${duration.toFixed(2)}ms)`;
    }

    if (context) {
      logMessage += ` | Context: ${JSON.stringify(context)}`;
    }

    if (error) {
      logMessage += ` | Error: ${error.name}: ${error.message}`;
      if (this.isDevelopment && error.stack) {
        logMessage += `\n${error.stack}`;
      }
    }

    return logMessage;
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };

    const formatted = this.formatLog(entry);

    // In production, you might want to send logs to external service
    switch (level) {
      case "error":
        console.error(formatted);
        break;
      case "warn":
        console.warn(formatted);
        break;
      case "info":
        console.info(formatted);
        break;
      default:
        console.log(formatted);
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      this.log("debug", message, context);
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log("info", message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log("warn", message, context);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: "error",
      message,
      context,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
    };

    const formatted = this.formatLog(entry);
    console.error(formatted);
  }

  performance(
    operation: string,
    startTime: number,
    context?: Record<string, unknown>
  ): void {
    const duration = performance.now() - startTime;
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: "debug",
      message: `Performance: ${operation}`,
      context,
      duration,
    };

    const formatted = this.formatLog(entry);
    console.log(formatted);
  }
}

export const logger = new Logger();

