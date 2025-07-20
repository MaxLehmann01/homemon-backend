export type TPlug = {
    id: number;
    name: string;
    url: string;
};

export type TPlugMeasurement = {
    power: number;
    voltage: number;
    current: number;
    tempC: number;
    tempF: number;
    isOn: boolean;
};
