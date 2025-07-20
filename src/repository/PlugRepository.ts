import axios, { AxiosRequestConfig } from 'axios';
import Database from 'src/components/Database';
import Plug from 'src/entities/Plug';
import { TPlug, TPlugMeasurement } from 'src/models/Plug';

export default class PlugRepository {
    private database: Database;

    constructor(database: Database) {
        this.database = database;
    }

    public async findAll(): Promise<Plug[]> {
        const result = await this.database.select<TPlug>('plugs', ['id', 'name', 'url']);

        if (!result) {
            return [];
        }

        return result.map((item) => new Plug(item.id, item.name, item.url));
    }

    public async fetchMeasurement(plug: Plug): Promise<TPlugMeasurement | null> {
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
        const result = await this.database.insert(
            'measurements',
            {
                plug_id: plugId,
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

    // public async fetchMeasurement(plug: Plug): Promise<Measurement | null> {
    //     try {
    //         const requestConfig: AxiosRequestConfig = {
    //             method: 'GET',
    //             url: `${plug.getUrl()}/rpc/Switch.GetStatus?id=0`,
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //         };

    //         const response = await axios(requestConfig);
    //         const data = response.data as {
    //             output: boolean;
    //             apower: number;
    //             voltage: number;
    //             current: number;
    //             temperature: {
    //                 tC: number;
    //                 tF: number;
    //             };
    //         };

    //         return new Measurement(
    //             plug.getId(),
    //             data.apower,
    //             data.voltage,
    //             data.current,
    //             data.temperature.tC,
    //             data.temperature.tF,
    //             data.output,
    //             new Date()
    //         );

    //         // return {
    //         //     power: data.apower,
    //         //     voltage: data.voltage,
    //         //     current: data.current,
    //         //     tempC: data.temperature.tC,
    //         //     tempF: data.temperature.tF,
    //         //     isOn: data.output,
    //         // };
    //     } catch (_) {
    //         return null;
    //     }
    // }

    // public async createMeasurement(plugId: TPlug['id'], measurement: TPlugMeasurement): Promise<boolean> {
    //     const result = await this.database.insert(
    //         'measurements',
    //         {
    //             plug_id: plugId,
    //             power: measurement.power,
    //             voltage: measurement.voltage,
    //             current: measurement.current,
    //             temp_c: measurement.tempC,
    //             temp_f: measurement.tempF,
    //         },
    //         'id'
    //     );

    //     if (!result) {
    //         return false;
    //     }

    //     return true;
    // }
}
