import { LoggerInterface } from 'src/components/logger/LoggerInterface';
import PlugRepository from 'src/repository/PlugRepository';
import AbstractTask from 'src/tasks/AbstractTask';
import { TaskInterface } from 'src/tasks/TaskInterface';

export default class AutoShutdownPlugTask extends AbstractTask implements TaskInterface {
    private plugRepository: PlugRepository;

    constructor(logger: LoggerInterface, plugRepository: PlugRepository) {
        super(logger);
        this.plugRepository = plugRepository;
    }

    public async run(): Promise<void> {
        const plugs = await this.plugRepository.findAll();

        for (const plug of plugs) {
            const autoShutdownThreshold = plug.getAutoShutdownThreshold();

            if (autoShutdownThreshold === null || !plug.getIsOn()) {
                this.logger.debug(`Skipping auto shutdown for plug ${plug.getName()} as it is either null or off.`);
                continue;
            }

            const now = new Date();
            const tenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

            now.setMilliseconds(0);
            now.setSeconds(0);

            tenMinutesAgo.setMilliseconds(0);
            tenMinutesAgo.setSeconds(0);

            const summaries = await this.plugRepository.getSummariesByPlugId(plug.getId(), tenMinutesAgo, now);
            const powerAvg =
                summaries.length > 0
                    ? summaries.reduce((sum, summary) => sum + Number(summary.powerAvg), 0) / summaries.length
                    : 0;

            if (powerAvg <= autoShutdownThreshold) {
                this.logger.info(`Auto shutdown triggered for plug ${plug.getName()} due to low power consumption.`);
                const success = await this.plugRepository.toggle(plug);

                if (success === true) {
                    this.logger.info(`Plug ${plug.getName()} has been turned off successfully.`);
                } else {
                    this.logger.error(`Failed to turn off plug ${plug.getName()}.`);
                }
            } else {
                this.logger.debug(
                    `Plug ${plug.getName()} - ${plug.getAutoShutdownThreshold()} is consuming sufficient power (${powerAvg} W), no action taken.`
                );
            }
        }
    }
}
