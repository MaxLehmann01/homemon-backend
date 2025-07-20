import { ConfigSchema } from 'src/config/Types';

export default {
    NODE_ENV: 'string',
    LOG_LEVEL: 'string',
    LOG_DIR: 'string',
    DB_HOST: 'string',
    DB_PORT: 'number',
    DB_USER: 'string',
    DB_PASSWORD: 'string',
    DB_NAME: 'string',
    DB_SSL: 'boolean',
    DB_SCHEMA: 'string',
    CORS_WHITELIST: 'string',
} as ConfigSchema;
