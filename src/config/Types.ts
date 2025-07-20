import { CorsOptions } from 'cors';

type ConfigField = 'string' | 'number' | 'boolean';

type ConfigSchema = {
    [key: string]: ConfigField;
};

type LoggerConfig = {
    level: string;
    dir: string;
};

type DatabaseConfig = {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    ssl: boolean;
    schema: string;
};

type ServerConfig = {
    port: number;
    corsOptions: CorsOptions;
};

export { ConfigField, ConfigSchema, LoggerConfig, DatabaseConfig, ServerConfig };
