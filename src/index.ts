import Config from 'src/config/Config';
import ConfigSchema from 'src/config/Schema';
import Logger from 'src/components/logger/Logger';
import Database from 'src/components/Database';

Config.loadSchema(ConfigSchema);

const logger = new Logger(Config.getLoggerConfig());

logger.info('Application started', {
    env: Config.get<string>('NODE_ENV'),
});

Database.setConfig(Config.getDatabaseConfig());
const database = Database.getInstance(logger);
database
    .start()
    .then(async () => {
        logger.info('Database connection established');
    })
    .catch((error) => {
        logger.error('Failed to connect to the database', { error });
    });
