import { TPlug } from 'src/models/Plug';

export default class Plug {
    private id: TPlug['id'];
    private name: TPlug['name'];
    private url: TPlug['url'];

    constructor(id: TPlug['id'], name: TPlug['name'], url: TPlug['url']) {
        this.id = id;
        this.name = name;
        this.url = url;
    }

    public getId(): TPlug['id'] {
        return this.id;
    }

    public getName(): TPlug['name'] {
        return this.name;
    }

    public getUrl(): TPlug['url'] {
        return this.url;
    }
}
