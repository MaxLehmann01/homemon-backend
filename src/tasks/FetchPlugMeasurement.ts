import { LoggerInterface } from 'src/components/logger/LoggerInterface';
import PlugRepository from 'src/repository/PlugRepository';
import AbstractTask from 'src/tasks/AbstractTask';
import { TaskInterface } from 'src/tasks/TaskInterface';

export default class FetchPlugMeasurementTask extends AbstractTask implements TaskInterface {
    private plugRepository: PlugRepository;

    constructor(logger: LoggerInterface, plugRepository: PlugRepository) {
        super(logger);
        this.plugRepository = plugRepository;
    }

    public async run(): Promise<void> {
        const plugs = await this.plugRepository.findAll();

        for (const plug of plugs) {
            const measurement = await this.plugRepository.fetchMeasurement(plug);
            if (!measurement) {
                continue;
            }

            await this.plugRepository.createMeasurement(plug.getId(), measurement);

            if (measurement) {
                this.logger.silly(`Fetched measurement for plug ${plug.getName()}:`, measurement);
            } else {
                this.logger.warn(`Failed to fetch measurement for plug ${plug.getName()}`);
            }
        }
    }
}
