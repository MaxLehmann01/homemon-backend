import Config from 'src/config/Config';
import ConfigSchema from 'src/config/Schema';
import Logger from 'src/components/logger/Logger';
import Database from 'src/components/Database';
import Server from 'src/components/server/Server';
import Scheduler from 'src/components/Scheduler';
import PlugRepository from 'src/repository/PlugRepository';
import FetchPlugMeasurementTask from './tasks/FetchPlugMeasurement';
import CreatePlugSummaryTask from './tasks/CreatePlugSummary';
import CreatePlugReportTask from './tasks/CreatePlugReports';
import IndexController from './controllers/IndexController';
import PlugController from './controllers/PlugController';

Config.loadSchema(ConfigSchema);

const logger = new Logger(Config.getLoggerConfig());

Database.setConfig(Config.getDatabaseConfig());
Server.setConfig(Config.getServerConfig());

const database = Database.getInstance(logger);
const server = Server.getInstance(logger);

const plugRepository = new PlugRepository(database);

const indexController = new IndexController(logger);
const plugController = new PlugController(logger, plugRepository);

database
    .start()
    .then(async () => {
        logger.info('Database connection established');
    })
    .catch((error) => {
        logger.error('Failed to connect to the database', { error });
    });

server.useRouter('/', indexController.getRouter());
server.useRouter('/plug', plugController.getRouter());
server
    .start()
    .then(() => {
        logger.info('Server started successfully');
    })
    .catch((error) => {
        logger.error('Failed to start the server', { error });
    });

const scheduler = Scheduler.getInstance(logger);
scheduler.addTask('fetch-plug-measurement', '* * * * * *', () =>
    new FetchPlugMeasurementTask(logger, plugRepository).run()
);
scheduler.addTask('create-plug-summary', '0 * * * * *', () => new CreatePlugSummaryTask(logger, plugRepository).run());
scheduler.addTask('create-plug-report', '0 0 * * * *', () => new CreatePlugReportTask(logger, plugRepository).run());

(async () => {
    // new CreatePlugReportTask(logger, plugRepository).run();
    // await new CreatePlugSummaryTask(logger, plugRepository).run();
})();
