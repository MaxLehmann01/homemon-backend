import { LoggerInterface } from 'src/components/logger/LoggerInterface';
import { TPlugMeasurement, TPlugSummary } from 'src/models/Plug';
import PlugRepository from 'src/repository/PlugRepository';
import AbstractTask from 'src/tasks/AbstractTask';
import { TaskInterface } from 'src/tasks/TaskInterface';

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
        oneMinutesAgo.setMilliseconds(0);

        for (const plug of plugs) {
            const measurements = await this.plugRepository.getMeasurementsByPlugId(plug.getId(), oneMinutesAgo, now);
            const summary = this.summarizeMeasurements(measurements);

            console.log(summary);

            //     const measurement = await this.plugRepository.fetchMeasurement(plug);
            //     if (!measurement) {
            //         continue;
            //     }
            //     await this.plugRepository.createMeasurement(plug.getId(), measurement);
            //     if (measurement) {
            //         this.logger.silly(`Fetched measurement for plug ${plug.getName()}:`, measurement);
            //     } else {
            //         this.logger.warn(`Failed to fetch measurement for plug ${plug.getName()}`);
            //     }
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

        return {
            createdAt: new Date(),
            startAt: new Date(measurements[0].createdAt),
            endAt: new Date(measurements[measurements.length - 1].createdAt),
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
