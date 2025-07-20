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

export { ConfigField, ConfigSchema, LoggerConfig, DatabaseConfig };
