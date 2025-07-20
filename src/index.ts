import Config from 'src/config/Config';
import ConfigSchema from 'src/config/Schema';
import Logger from 'src/components/Logger';

Config.loadSchema(ConfigSchema);

const logger = new Logger(Config.getLoggerConfig());

logger.info('Application started', {
    env: Config.get<string>('NODE_ENV'),
});
