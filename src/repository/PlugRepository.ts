import axios, { AxiosRequestConfig } from 'axios';
import Database from 'src/components/Database';
import Plug from 'src/entities/Plug';
import { TPlug, TPlugMeasurement, TPlugReport, TPlugSummary } from 'src/models/Plug';

export default class PlugRepository {
    private database: Database;

    constructor(database: Database) {
        this.database = database;
    }

    public async findAll(): Promise<Plug[]> {
        const result = await this.database.select(
            'plugs',
            ['id', 'name', 'url', 'protected', 'is_on', 'auto_shutdown_threshold'],
            undefined,
            'name ASC'
        );

        if (!result) {
            return [];
        }

        return result.map(
            (item) => new Plug(item.id, item.name, item.url, item.protected, item.is_on, item.auto_shutdown_threshold)
        );
    }

    public async update(plug: TPlug): Promise<Plug | null> {
        const result = await this.database.update(
            'plugs',
            {
                name: plug.name,
                url: plug.url,
                protected: plug.isProtected,
                is_on: plug.isOn,
                auto_shutdown_threshold: plug.autoShutdownThreshold,
            },
            'id = $1',
            [plug.id]
        );

        if (!result) {
            return null;
        }

        return new Plug(plug.id, plug.name, plug.url, plug.isProtected, plug.isOn, plug.autoShutdownThreshold);
    }

    public async toggle(plug: Plug): Promise<boolean | null> {
        try {
            const requestConfig: AxiosRequestConfig = {
                method: 'GET',
                url: `${plug.getUrl()}/rpc/Switch.Toggle?id=0`,
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            const response = await axios(requestConfig);
            const data = response.data as { was_on: boolean };

            return !data.was_on;
        } catch (_) {
            return null;
        }
    }

    public async fetchMeasurement(plug: Plug): Promise<(TPlugMeasurement & { isOn: boolean }) | null> {
        try {
            const requestConfig: AxiosRequestConfig = {
                method: 'GET',
                url: `${plug.getUrl()}/rpc/Switch.GetStatus?id=0`,
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            const response = await axios(requestConfig);
            const data = response.data as {
                output: boolean;
                apower: number;
                voltage: number;
                current: number;
                temperature: {
                    tC: number;
                    tF: number;
                };
            };

            return {
                isOn: data.output,
                power: data.apower,
                voltage: data.voltage,
                current: data.current,
                tempC: data.temperature.tC,
                tempF: data.temperature.tF,
                createdAt: new Date(),
            };
        } catch (_) {
            return null;
        }
    }

    public async getMeasurementsByPlugId(plugId: TPlug['id'], from: Date, to: Date): Promise<TPlugMeasurement[]> {
        const result = await this.database.select(
            'measurements',
            ['created_at', 'power', 'voltage', 'current', 'temp_c', 'temp_f'],
            'plug_id = $1 AND created_at BETWEEN $2 AND $3',
            'created_at ASC',
            [plugId, from, to]
        );

        if (!result) {
            return [];
        }

        return result.map((item) => ({
            power: item.power,
            voltage: item.voltage,
            current: item.current,
            tempC: item.temp_c,
            tempF: item.temp_f,
            createdAt: new Date(item.created_at),
        }));
    }

    public async createMeasurement(plugId: TPlug['id'], measurement: TPlugMeasurement): Promise<boolean> {
        const now = new Date(measurement.createdAt);
        now.setMilliseconds(0);

        const result = await this.database.insert(
            'measurements',
            {
                plug_id: plugId,
                created_at: now,
                power: measurement.power,
                voltage: measurement.voltage,
                current: measurement.current,
                temp_c: measurement.tempC,
                temp_f: measurement.tempF,
            },
            'id'
        );

        return !!result;
    }

    public async deleteMeasurementsByPlugId(plugId: TPlug['id'], from: Date, to: Date): Promise<boolean> {
        const result = await this.database.delete('measurements', 'plug_id = $1 AND created_at BETWEEN $2 AND $3', [
            plugId,
            from,
            to,
        ]);

        return !!result;
    }

    public async getSummariesByPlugId(plugId: TPlug['id'], from: Date, to: Date): Promise<TPlugSummary[]> {
        const result = await this.database.select(
            'summaries',
            [
                'created_at',
                'start_at',
                'end_at',
                'count_measurements',
                'power_sum',
                'power_avg',
                'voltage_avg',
                'current_avg',
                'temp_c_avg',
                'temp_f_avg',
            ],
            'plug_id = $1 AND start_at >= $2 AND end_at <= $3',
            'start_at ASC',
            [plugId, from, to]
        );

        if (!result) {
            return [];
        }

        return result.map((item) => ({
            createdAt: new Date(item.created_at),
            startAt: new Date(item.start_at),
            endAt: new Date(item.end_at),
            countMeasurements: item.count_measurements,
            powerSum: item.power_sum,
            powerAvg: item.power_avg,
            voltageAvg: item.voltage_avg,
            currentAvg: item.current_avg,
            tempCAvg: item.temp_c_avg,
            tempFAvg: item.temp_f_avg,
        }));
    }

    public async createSummary(plugId: TPlug['id'], summary: TPlugSummary): Promise<boolean> {
        const now = new Date();
        now.setMilliseconds(0);

        const result = await this.database.insert(
            'summaries',
            {
                plug_id: plugId,
                created_at: now,
                start_at: summary.startAt,
                end_at: summary.endAt,
                count_measurements: summary.countMeasurements,
                power_sum: summary.powerSum,
                power_avg: summary.powerAvg,
                voltage_avg: summary.voltageAvg,
                current_avg: summary.currentAvg,
                temp_c_avg: summary.tempCAvg,
                temp_f_avg: summary.tempFAvg,
            },
            'id'
        );

        return !!result;
    }

    public async createReport(plugId: TPlug['id'], report: TPlugReport): Promise<boolean> {
        const now = new Date();
        now.setMilliseconds(0);

        const result = await this.database.insert(
            'reports',
            {
                plug_id: plugId,
                created_at: now,
                report_date: report.reportDate,
                summaries: JSON.stringify(report.summaries),
            },
            'id'
        );

        return !!result;
    }

    public async getPlugReport(
        plugId: TPlug['id'],
        reportDate: TPlugReport['reportDate']
    ): Promise<TPlugReport | null> {
        const result = await this.database.select(
            'reports',
            ['id', 'created_at', 'report_date', 'summaries'],
            'plug_id = $1 AND report_date = $2',
            'id ASC',
            [plugId, reportDate]
        );

        if (!result || result.length === 0) {
            return null;
        }

        return {
            createdAt: new Date(result[0].created_at),
            reportDate: new Date(result[0].report_date),
            summaries: result[0].summaries,
        };
    }
}
