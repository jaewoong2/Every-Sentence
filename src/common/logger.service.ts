import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

function formatTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // getMonth()는 0부터 시작
  const day = now.getDate();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  return `[${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}]`;
}

@Injectable()
export class LoggerService implements NestLoggerService {
  constructor() {}

  debug(message: any, ...optionalParams: any[]) {
    console.debug(
      `%c🐛 [DEBUG] - ${formatTimestamp()} - ${message}`,
      'color: gray;',
      ...optionalParams,
    );
  }

  warn(message: any, ...optionalParams: any[]) {
    console.warn(
      `%c🚨 [WARNING] - ${formatTimestamp()} - ${message}`,
      'color: orange;',
      ...optionalParams,
    );
  }

  log(message: any, ...optionalParams: any[]) {
    console.log(
      `%c🪵 [LOG] - ${formatTimestamp()} - ${message}`,
      'color: blue;',
      ...optionalParams,
    );
  }

  error(message: any, ...optionalParams: any[]) {
    console.error(
      `%c💥 [ERROR] - ${formatTimestamp()} - ${message}`,
      'color: red;',
      ...optionalParams,
    );
  }
}
