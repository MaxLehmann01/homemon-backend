import { LoggerInterface } from 'src/components/logger/LoggerInterface';
import { TPlugReport } from 'src/models/Plug';
import PlugRepository from 'src/repository/PlugRepository';
import AbstractTask from 'src/tasks/AbstractTask';
import { TaskInterface } from 'src/tasks/TaskInterface';

export default class CreatePlugReportTask extends AbstractTask implements TaskInterface {
    private plugRepository: PlugRepository;

    constructor(logger: LoggerInterface, plugRepository: PlugRepository) {
        super(logger);
        this.plugRepository = plugRepository;
    }

    public async run(): Promise<void> {
        try {
            const plugs = await this.plugRepository.findAll();
            const today = new Date();
            const oneDayAgo = new Date(today.getTime() - 24 * 60 * 60 * 1000);

            today.setHours(0, 0, 0, 0);
            oneDayAgo.setHours(0, 0, 0, 0);

            for (const plug of plugs) {
                const summaries = await this.plugRepository.getSummariesByPlugId(plug.getId(), oneDayAgo, today);
                const report = {
                    createdAt: today,
                    reportDate: oneDayAgo,
                    summaries: summaries,
                } as TPlugReport;

                if (await this.plugRepository.createReport(plug.getId(), report)) {
                    this.logger.info(`Inserted report for plug ${plug.getName()}`, report);
                } else {
                    this.logger.warn(`Failed to insert report for plug ${plug.getName()}`, { plugId: plug.getId() });
                }
            }
        } catch (err) {
            this.logger.error('Failed to create plug reports', { error: err });
        }
    }
}
