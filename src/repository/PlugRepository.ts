import Database from 'src/components/Database';
import Plug from 'src/entities/Plug';
import { TPlug } from 'src/models/Plug';

export default class PlugRepository {
    private database: Database;

    constructor(database: Database) {
        this.database = database;
    }

    public async findAll(): Promise<Plug[]> {
        const result = await this.database.select<TPlug>('plugs', ['id', 'name', 'ip']);

        if (!result) {
            return [];
        }

        return result.map((item) => new Plug(item.id, item.name, item.ip));
    }
}
