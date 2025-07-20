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
    createdAt: Date;
};

export type TPlugSummary = {
    createdAt: Date;
    startAt: Date;
    endAt: Date;
    countMeasurements: number;
    powerSum: number;
    powerAvg: number;
    voltageAvg: number;
    currentAvg: number;
    tempCAvg: number;
    tempFAvg: number;
};
