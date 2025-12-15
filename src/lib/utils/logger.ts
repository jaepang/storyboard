/**
 * 로깅 유틸리티
 *
 * 서버 측 에러 및 이벤트를 로깅합니다.
 * 프로덕션 환경에서는 외부 로깅 서비스 (Sentry, LogRocket 등)와 통합 가능합니다.
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogContext {
  [key: string]: unknown;
}

/**
 * 로그 메타데이터
 */
interface LogMetadata {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * 로그 포맷팅
 */
function formatLog(metadata: LogMetadata): string {
  const { timestamp, level, message, context, error } = metadata;

  let log = `[${timestamp}] [${level}] ${message}`;

  if (context && Object.keys(context).length > 0) {
    log += `\nContext: ${JSON.stringify(context, null, 2)}`;
  }

  if (error) {
    log += `\nError: ${error.name}: ${error.message}`;
    if (error.stack) {
      log += `\nStack: ${error.stack}`;
    }
  }

  return log;
}

/**
 * 로그 출력
 */
function log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
  const timestamp = new Date().toISOString();

  const metadata: LogMetadata = {
    timestamp,
    level,
    message,
    context,
    ...(error && {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    }),
  };

  const formattedLog = formatLog(metadata);

  // 개발 환경에서는 콘솔에 출력
  if (process.env.NODE_ENV === 'development') {
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedLog);
        break;
      case LogLevel.INFO:
        console.info(formattedLog);
        break;
      case LogLevel.WARN:
        console.warn(formattedLog);
        break;
      case LogLevel.ERROR:
        console.error(formattedLog);
        break;
    }
  } else {
    // 프로덕션 환경에서는 외부 로깅 서비스로 전송
    // TODO: Sentry, LogRocket 등과 통합
    console.log(formattedLog);
  }
}

/**
 * 디버그 로그
 */
export function debug(message: string, context?: LogContext): void {
  log(LogLevel.DEBUG, message, context);
}

/**
 * 정보 로그
 */
export function info(message: string, context?: LogContext): void {
  log(LogLevel.INFO, message, context);
}

/**
 * 경고 로그
 */
export function warn(message: string, context?: LogContext): void {
  log(LogLevel.WARN, message, context);
}

/**
 * 에러 로그
 */
export function error(message: string, err?: Error, context?: LogContext): void {
  log(LogLevel.ERROR, message, context, err);
}

/**
 * API 요청 로그
 */
export function logApiRequest(
  method: string,
  path: string,
  statusCode: number,
  duration: number,
  context?: LogContext
): void {
  info(`API ${method} ${path} - ${statusCode} (${duration}ms)`, context);
}

/**
 * API 에러 로그
 */
export function logApiError(method: string, path: string, err: Error, context?: LogContext): void {
  error(`API ${method} ${path} failed`, err, context);
}

/**
 * 데이터베이스 에러 로그
 */
export function logDatabaseError(operation: string, err: Error, context?: LogContext): void {
  error(`Database ${operation} failed`, err, context);
}

/**
 * 파일 업로드 에러 로그
 */
export function logUploadError(fileName: string, err: Error, context?: LogContext): void {
  error(`File upload failed: ${fileName}`, err, context);
}

/**
 * 인증 에러 로그
 */
export function logAuthError(message: string, context?: LogContext): void {
  warn(`Authentication failed: ${message}`, context);
}
