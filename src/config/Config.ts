import { ConfigSchema } from 'src/config/Types';

export default class Config {
    private static values: Record<string, string | number | boolean> = {};

    public static loadSchema(schema: ConfigSchema): void {
        Config.values = {};

        for (const key in schema) {
            const definition = schema[key];
            const value = process.env[key];

            if (value === undefined) {
                throw new Error(`Missing environment variable: ${key}`);
            }

            switch (definition) {
                case 'string': {
                    this.values[key] = value;
                    break;
                }
                case 'number': {
                    const numberValue = Number(value);
                    if (isNaN(numberValue)) {
                        throw new Error(`Invalid value for environment variable: ${key} - expected: number`);
                    }

                    Config.values[key] = numberValue;
                    break;
                }
                case 'boolean': {
                    const lowerValue = value.toLowerCase();

                    if (lowerValue !== 'true' && lowerValue !== 'false') {
                        throw new Error(`Invalid value for environment variable: ${key} - expected: boolean`);
                    }

                    Config.values[key] = lowerValue === 'true';
                    break;
                }
            }
        }
    }

    public static get<T extends string | number | boolean>(key: string): T {
        const value = Config.values[key];

        if (value === undefined) {
            throw new Error(`Missing requested environment variable: ${key}`);
        }

        return value as T;
    }
}
