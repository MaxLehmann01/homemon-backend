import { LoggerConfig } from 'src/config/Types';
import Logger from 'src/components/logger/Logger';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

describe('Logger', () => {
    const baseDir = '/homemon-backend';

    describe('constructor', () => {
        it('should register two DailyRotateFile transports when level is not silly', () => {
            const config: LoggerConfig = { level: 'info', dir: baseDir };
            const logger = new Logger(config);
            const winstonLogger = logger['logger'] as winston.Logger;
            const [infoTransport, errorTransport] = winstonLogger.transports as DailyRotateFile[];

            expect(infoTransport).toBeInstanceOf(winston.transports.DailyRotateFile);
            expect(infoTransport.level).toBe('info');
            expect(infoTransport.filename).toBe('combined-%DATE%.log');
            expect(infoTransport.dirname).toBe(path.join(baseDir, 'info'));

            expect(errorTransport).toBeInstanceOf(winston.transports.DailyRotateFile);
            expect(errorTransport.level).toBe('error');
            expect(errorTransport.filename).toBe('combined-%DATE%.log');
            expect(errorTransport.dirname).toBe(path.join(baseDir, 'error'));
        });

        it('should add a Console transport when level is silly', () => {
            const config: LoggerConfig = { level: 'silly', dir: baseDir };
            const logger = new Logger(config);
            const winstonLogger = logger['logger'] as winston.Logger;

            const transports = winstonLogger.transports;
            const consoleTransport = transports.filter((t) => t instanceof winston.transports.Console)[0];

            expect(transports).toHaveLength(3);
            expect(consoleTransport).toBeDefined();
            expect(consoleTransport.level).toBe('silly');
            expect(consoleTransport.format).toBeDefined();
        });
    });

    describe('logger.fileFormat', () => {
        beforeAll(() => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2025-01-01:00:00:00Z'));
        });
        afterAll(() => {
            jest.useRealTimers();
        });

        it('should format the log message without meta', () => {
            const config: LoggerConfig = { level: 'info', dir: baseDir };
            const logger = new Logger(config);
            const winstonLogger = logger['logger'] as winston.Logger;
            const [infoTransport, errorTransport] = winstonLogger.transports as DailyRotateFile[];

            const transformedInfo = infoTransport.format?.transform({
                level: 'info',
                message: 'Test message',
            }) as winston.Logform.TransformableInfo;

            const transformedError = errorTransport.format?.transform({
                level: 'error',
                message: 'Test message',
            }) as winston.Logform.TransformableInfo;

            const outputInfo = transformedInfo[Symbol.for('message')] as string;
            const outputError = transformedError[Symbol.for('message')] as string;

            expect(outputInfo).toBe('2025-01-01 00:00:00 [info] Test message ');
            expect(outputError).toBe('2025-01-01 00:00:00 [error] Test message ');
        });

        it('should format the log message with meta', () => {
            const config: LoggerConfig = { level: 'info', dir: baseDir };
            const logger = new Logger(config);
            const winstonLogger = logger['logger'] as winston.Logger;
            const [infoTransport, errorTransport] = winstonLogger.transports as DailyRotateFile[];

            const transformedInfo = infoTransport.format?.transform({
                level: 'info',
                message: 'Test message',
                timestamp: '2025-01-01 00:00:00', // gets overtaken by jest.setSystemTime
                key: 'value',
            }) as winston.Logform.TransformableInfo;

            const transformedError = errorTransport.format?.transform({
                level: 'error',
                message: 'Test message',
                timestamp: '2025-01-01 00:00:00', // gets overtaken by jest.setSystemTime
                key: 'value',
            }) as winston.Logform.TransformableInfo;

            const outputInfo = transformedInfo[Symbol.for('message')] as string;
            const outputError = transformedError[Symbol.for('message')] as string;

            expect(outputInfo).toBe('2025-01-01 00:00:00 [info] Test message {"key":"value"}');
            expect(outputError).toBe('2025-01-01 00:00:00 [error] Test message {"key":"value"}');
        });
    });

    describe('logger.consoleFormat', () => {
        beforeAll(() => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2025-01-01:00:00:00Z'));

            const colorizer = winston.format.colorize({ all: true });
            colorizer.transform = (info) => info;
            jest.spyOn(winston.format, 'colorize').mockReturnValue(colorizer);
        });
        afterAll(() => {
            jest.useRealTimers();
            jest.resetAllMocks();
        });

        it('should format the log message without meta', () => {
            const config: LoggerConfig = { level: 'silly', dir: baseDir };
            const logger = new Logger(config);
            const winstonLogger = logger['logger'] as winston.Logger;
            const transports = winstonLogger.transports;
            const consoleTransport = transports.filter((t) => t instanceof winston.transports.Console)[0];

            const transformed = consoleTransport.format?.transform({
                level: 'info',
                message: 'Test message',
            }) as winston.Logform.TransformableInfo;

            const output = transformed[Symbol.for('message')] as string;
            expect(output).toBe('2025-01-01 00:00:00 [info] Test message ');
        });

        it('should format the log message with meta', () => {
            const config: LoggerConfig = { level: 'silly', dir: baseDir };
            const logger = new Logger(config);
            const winstonLogger = logger['logger'] as winston.Logger;
            const transports = winstonLogger.transports;
            const consoleTransport = transports.filter((t) => t instanceof winston.transports.Console)[0];

            const transformed = consoleTransport.format?.transform({
                level: 'info',
                message: 'Test message',
                timestamp: '2025-01-01 00:00:00', // gets overtaken by jest.setSystemTime
                key: 'value',
            }) as winston.Logform.TransformableInfo;

            const output = transformed[Symbol.for('message')] as string;
            expect(output).toBe('2025-01-01 00:00:00 [info] Test message {"key":"value"}');
        });
    });

    describe('log methods', () => {
        let logger: Logger;
        let winstonLogger: winston.Logger;

        beforeEach(() => {
            const config: LoggerConfig = { level: 'info', dir: baseDir };
            logger = new Logger(config);
            winstonLogger = logger['logger'] as winston.Logger;
        });

        it('should log info messages', () => {
            const infoSpy = jest.spyOn(winstonLogger, 'info');
            logger.info('Info message');
            expect(infoSpy).toHaveBeenCalledWith('Info message', undefined);
        });

        it('should log error messages', () => {
            const errorSpy = jest.spyOn(winstonLogger, 'error');
            logger.error('Error message');
            expect(errorSpy).toHaveBeenCalledWith('Error message', undefined);
        });

        it('should log warn messages', () => {
            const warnSpy = jest.spyOn(winstonLogger, 'warn');
            logger.warn('Warn message');
            expect(warnSpy).toHaveBeenCalledWith('Warn message', undefined);
        });

        it('should log debug messages', () => {
            const debugSpy = jest.spyOn(winstonLogger, 'debug');
            logger.debug('Debug message');
            expect(debugSpy).toHaveBeenCalledWith('Debug message', undefined);
        });

        it('should log silly messages', () => {
            const sillySpy = jest.spyOn(winstonLogger, 'silly');
            logger.silly('Silly message');
            expect(sillySpy).toHaveBeenCalledWith('Silly message', undefined);
        });
    });
});
