import Config from 'src/config/Config';
import ConfigSchema from 'src/config/Schema';
import Logger from 'src/components/logger/Logger';
import Database from 'src/components/Database';
import Server from 'src/components/server/Server';

Config.loadSchema(ConfigSchema);

const logger = new Logger(Config.getLoggerConfig());

Database.setConfig(Config.getDatabaseConfig());
Server.setConfig(Config.getServerConfig());

const database = Database.getInstance(logger);
const server = Server.getInstance(logger);

database
    .start()
    .then(async () => {
        logger.info('Database connection established');
    })
    .catch((error) => {
        logger.error('Failed to connect to the database', { error });
    });

server
    .start()
    .then(() => {
        logger.info('Server started successfully');
    })
    .catch((error) => {
        logger.error('Failed to start the server', { error });
    });
