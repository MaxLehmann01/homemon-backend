import { TPlug } from 'src/models/Plug';

export default class Plug {
    private id: TPlug['id'];
    private name: TPlug['name'];
    private ip: TPlug['ip'];

    constructor(id: TPlug['id'], name: TPlug['name'], ip: TPlug['ip']) {
        this.id = id;
        this.name = name;
        this.ip = ip;
    }

    public getId(): TPlug['id'] {
        return this.id;
    }

    public getName(): TPlug['name'] {
        return this.name;
    }

    public getIp(): TPlug['ip'] {
        return this.ip;
    }
}
