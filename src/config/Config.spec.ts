import Config from 'src/config/Config';
import { ConfigSchema } from 'src/config/Types';

describe('Config', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    describe('loadSchema', () => {
        it('should load environment variables with correct types', () => {
            process.env.STRING_VAR = 'test';
            process.env.NUMBER_VAR = '123';
            process.env.BOOLEAN_VAR = 'true';

            const schema: ConfigSchema = {
                STRING_VAR: 'string',
                NUMBER_VAR: 'number',
                BOOLEAN_VAR: 'boolean',
            };

            expect(() => Config.loadSchema(schema)).not.toThrow();
            expect(Config.get<string>('STRING_VAR')).toBe('test');
            expect(Config.get<number>('NUMBER_VAR')).toBe(123);
            expect(Config.get<boolean>('BOOLEAN_VAR')).toBe(true);
        });

        it('should throw an error for missing environment variables', () => {
            const schema: ConfigSchema = {
                STRING_VAR: 'string',
            };

            expect(() => Config.loadSchema(schema)).toThrow('Missing environment variable: STRING_VAR');
        });

        it('should throw an error for invalid type - expected number', () => {
            process.env.NUMBER_VAR = 'not_a_number';

            const schema: ConfigSchema = {
                NUMBER_VAR: 'number',
            };

            expect(() => Config.loadSchema(schema)).toThrow(
                'Invalid value for environment variable: NUMBER_VAR - expected: number'
            );
        });

        it('should throw an error for invalid type - expected boolean', () => {
            process.env.BOOLEAN_VAR = 'not_a_boolean';

            const schema: ConfigSchema = {
                BOOLEAN_VAR: 'boolean',
            };

            expect(() => Config.loadSchema(schema)).toThrow(
                'Invalid value for environment variable: BOOLEAN_VAR - expected: boolean'
            );
        });

        it('should throw an error for unsupported type', () => {
            process.env.UNSUPPORTED_VAR = 'value';

            const schema: ConfigSchema = {
                UNSUPPORTED_VAR: 'object',
            } as never;

            expect(() => Config.loadSchema(schema)).toThrow(
                'Unsupported type for environment variable: UNSUPPORTED_VAR - expected one of string, number, boolean'
            );
        });
    });

    describe('get', () => {
        it('should throw an error for missing requested environment variable', () => {
            process.env.EXISTING_VAR = 'value';

            const schema: ConfigSchema = {
                EXISTING_VAR: 'string',
            };

            expect(() => Config.loadSchema(schema)).not.toThrow();
            expect(() => Config.get<string>('MISSING_VAR')).toThrow(
                'Missing requested environment variable: MISSING_VAR'
            );
        });
    });

    describe('getLoggerConfig', () => {
        it('should return the logger configuration', () => {
            process.env.LOG_LEVEL = 'info';
            process.env.LOG_DIR = '/var/logs';

            const schema: ConfigSchema = {
                LOG_LEVEL: 'string',
                LOG_DIR: 'string',
            };

            expect(() => Config.loadSchema(schema)).not.toThrow();
            expect(Config.getLoggerConfig()).toEqual({
                level: 'info',
                dir: '/var/logs',
            });
        });
    });

    describe('getDatabaseConfig', () => {
        it('should return the database configuration', () => {
            process.env.DB_HOST = 'localhost';
            process.env.DB_PORT = '5432';
            process.env.DB_USER = 'user';
            process.env.DB_PASSWORD = 'password';
            process.env.DB_NAME = 'database';
            process.env.DB_SSL = 'false';
            process.env.DB_SCHEMA = 'public';

            const schema: ConfigSchema = {
                DB_HOST: 'string',
                DB_PORT: 'number',
                DB_USER: 'string',
                DB_PASSWORD: 'string',
                DB_NAME: 'string',
                DB_SSL: 'boolean',
                DB_SCHEMA: 'string',
            };

            expect(() => Config.loadSchema(schema)).not.toThrow();
            expect(Config.getDatabaseConfig()).toEqual({
                host: 'localhost',
                port: 5432,
                user: 'user',
                password: 'password',
                database: 'database',
                ssl: false,
                schema: 'public',
            });
        });
    });

    describe('Config.getServerConfig', () => {
        it('should return the correct server configuration', () => {
            process.env.CORS_WHITELIST = 'http://example1.com,http://example2.com';

            const schema: ConfigSchema = {
                CORS_WHITELIST: 'string',
            };

            expect(() => Config.loadSchema(schema)).not.toThrow();
            const serverConfig = Config.getServerConfig();
            expect(serverConfig.port).toBe(80);
            expect(serverConfig.corsOptions).toBeInstanceOf(Object);

            const origin = serverConfig.corsOptions.origin;

            if (typeof origin === 'function') {
                const allowedCallback = jest.fn();
                origin('http://example1.com', allowedCallback);
                expect(allowedCallback).toHaveBeenCalledWith(null, true);

                const disallowedCallback = jest.fn();
                origin('http://notallowed.com', disallowedCallback);
                expect(disallowedCallback).toHaveBeenCalledWith(expect.any(Error), false);

                const missingCallback = jest.fn();
                origin(undefined, missingCallback);
                expect(missingCallback).toHaveBeenCalledWith(null, true);
            } else {
                throw new Error('Expected corsOptions.origin to be a function');
            }
        });
    });
});
