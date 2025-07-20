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
});
