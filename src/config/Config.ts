import { CorsOptions } from 'cors';
import { ConfigSchema, DatabaseConfig, LoggerConfig, ServerConfig } from 'src/config/Types';

export default class Config {
    private static values: Record<string, string | number | boolean> = {};

    public static loadSchema(schema: ConfigSchema): void {
        Config.values = {};

        for (const key in schema) {
            const definition = schema[key];
            const value = process.env[key];

            if (value === undefined) {
                throw new Error(`Missing environment variable: ${key}`);
            }

            switch (definition) {
                case 'string': {
                    this.values[key] = value;
                    break;
                }
                case 'number': {
                    const numberValue = Number(value);
                    if (isNaN(numberValue)) {
                        throw new Error(`Invalid value for environment variable: ${key} - expected: number`);
                    }

                    Config.values[key] = numberValue;
                    break;
                }
                case 'boolean': {
                    const lowerValue = value.toLowerCase();

                    if (lowerValue !== 'true' && lowerValue !== 'false') {
                        throw new Error(`Invalid value for environment variable: ${key} - expected: boolean`);
                    }

                    Config.values[key] = lowerValue === 'true';
                    break;
                }
                default: {
                    throw new Error(
                        `Unsupported type for environment variable: ${key} - expected one of string, number, boolean`
                    );
                }
            }
        }
    }

    public static get<T extends string | number | boolean>(key: string): T {
        const value = Config.values[key];

        if (value === undefined) {
            throw new Error(`Missing requested environment variable: ${key}`);
        }

        return value as T;
    }

    public static getLoggerConfig(): LoggerConfig {
        return {
            level: Config.get<string>('LOG_LEVEL'),
            dir: Config.get<string>('LOG_DIR'),
        };
    }

    public static getDatabaseConfig(): DatabaseConfig {
        return {
            host: Config.get<string>('DB_HOST'),
            port: Config.get<number>('DB_PORT'),
            user: Config.get<string>('DB_USER'),
            password: Config.get<string>('DB_PASSWORD'),
            database: Config.get<string>('DB_NAME'),
            ssl: Config.get<boolean>('DB_SSL'),
            schema: Config.get<string>('DB_SCHEMA'),
        };
    }

    public static getServerConfig(): ServerConfig {
        return {
            port: 80,
            corsOptions: Config.getCorsOptions(),
        };
    }

    private static getCorsOptions(): CorsOptions {
        const whitelist = Config.get<string>('CORS_WHITELIST').split(',');

        const options: CorsOptions = {
            credentials: true,
            origin: (origin, callback) => {
                if (!origin || whitelist.indexOf(origin) !== -1) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'), false);
                }
            },
        };

        return options;
    }
}
