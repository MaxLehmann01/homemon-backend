type ConfigField = 'string' | 'number' | 'boolean';

type ConfigSchema = {
    [key: string]: ConfigField;
};

type LoggerConfig = {
    level: string;
    dir: string;
};

export { ConfigField, ConfigSchema, LoggerConfig };
