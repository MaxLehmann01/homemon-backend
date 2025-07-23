import { TPlug } from 'src/models/Plug';

export default class Plug {
    private id: TPlug['id'];
    private name: TPlug['name'];
    private url: TPlug['url'];
    private isProtected: TPlug['isProtected'];
    private isOn: TPlug['isOn'];
    private autoShutdownThreshold: TPlug['autoShutdownThreshold'];

    constructor(
        id: TPlug['id'],
        name: TPlug['name'],
        url: TPlug['url'],
        isProtected: TPlug['isProtected'],
        isOn: TPlug['isOn'],
        autoShutdownThreshold: TPlug['autoShutdownThreshold']
    ) {
        this.id = id;
        this.name = name;
        this.url = url;
        this.isProtected = isProtected;
        this.isOn = isOn;
        this.autoShutdownThreshold = autoShutdownThreshold;
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

    public getIsProtected(): TPlug['isProtected'] {
        return this.isProtected;
    }

    public getIsOn(): TPlug['isOn'] {
        return this.isOn;
    }

    public getAutoShutdownThreshold(): TPlug['autoShutdownThreshold'] {
        return this.autoShutdownThreshold;
    }
}
