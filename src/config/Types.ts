type ConfigField = 'string' | 'number' | 'boolean';

type ConfigSchema = {
    [key: string]: ConfigField;
};

export { ConfigField, ConfigSchema };
