import { start } from 'repl';
import { LoggerInterface } from 'src/components/logger/LoggerInterface';
import { TPlugMeasurement, TPlugSummary } from 'src/models/Plug';
import PlugRepository from 'src/repository/PlugRepository';
import AbstractTask from 'src/tasks/AbstractTask';
import { TaskInterface } from 'src/tasks/TaskInterface';
import { log } from 'winston';

export default class CreatePlugSummaryTask extends AbstractTask implements TaskInterface {
    private plugRepository: PlugRepository;

    constructor(logger: LoggerInterface, plugRepository: PlugRepository) {
        super(logger);
        this.plugRepository = plugRepository;
    }

    public async run(): Promise<void> {
        const plugs = await this.plugRepository.findAll();
        const now = new Date();
        const oneMinutesAgo = new Date(now.getTime() - 1 * 60 * 1000);

        now.setMilliseconds(0);
        now.setSeconds(0);
        oneMinutesAgo.setMilliseconds(0);
        oneMinutesAgo.setSeconds(0);

        console.log({
            now: now,
            oneMinutesAgo: oneMinutesAgo,
        });

        for (const plug of plugs) {
            const measurements = await this.plugRepository.getMeasurementsByPlugId(plug.getId(), oneMinutesAgo, now);
            const summary = this.summarizeMeasurements(measurements);

            if (!summary) {
                this.logger.warn('Failed to create summary for plug', {
                    plugId: plug.getId(),
                    plugName: plug.getName(),
                });
                continue;
            }

            if (await this.plugRepository.createSummary(plug.getId(), summary)) {
                this.logger.info(`Inserted summary for plug ${plug.getName()}`, summary);

                if (await this.plugRepository.deleteMeasurementsByPlugId(plug.getId(), oneMinutesAgo, now)) {
                    this.logger.info(`Deleted measurements for plug ${plug.getName()} after summary creation`, {
                        plugId: plug.getId(),
                    });
                } else {
                    this.logger.warn(
                        `Failed to delete measurements for plug ${plug.getName()} after summary creation`,
                        {
                            plugId: plug.getId(),
                        }
                    );
                }
            } else {
                this.logger.warn(`Failed to insert summary for plug ${plug.getName()}`, { plugId: plug.getId() });
            }
        }
    }

    private summarizeMeasurements(measurements: TPlugMeasurement[]): TPlugSummary | null {
        if (measurements.length === 0) {
            return null;
        }

        const count = measurements.length;

        const powerSum = measurements.reduce((sum, m) => sum + Number(m.power), 0);
        const powerAvg = count > 0 ? powerSum / count : 0;
        const currentAvg = count > 0 ? measurements.reduce((sum, m) => sum + Number(m.current), 0) / count : 0;
        const voltageAvg = count > 0 ? measurements.reduce((sum, m) => sum + Number(m.voltage), 0) / count : 0;
        const tempCAvg = count > 0 ? measurements.reduce((sum, m) => sum + Number(m.tempC), 0) / count : 0;
        const tempFAvg = count > 0 ? measurements.reduce((sum, m) => sum + Number(m.tempF), 0) / count : 0;

        console.log({
            startAt: measurements[0].createdAt,
            endAt: measurements[measurements.length - 1].createdAt,
            startAtWithoutMs: new Date(measurements[0].createdAt).setMilliseconds(0),
            endAtWithoutMs: new Date(measurements[measurements.length - 1].createdAt).setMilliseconds(0),
        });

        const startAt = new Date(measurements[0].createdAt);
        startAt.setMilliseconds(0);

        const endAt = new Date(measurements[measurements.length - 1].createdAt);
        endAt.setMilliseconds(0);

        return {
            createdAt: new Date(),
            startAt,
            endAt,
            countMeasurements: count,
            powerSum,
            powerAvg,
            voltageAvg,
            currentAvg,
            tempCAvg,
            tempFAvg,
        };
    }
}
