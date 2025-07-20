import Config from 'src/config/Config';
import ConfigSchema from 'src/config/Schema';

Config.loadSchema(ConfigSchema);
console.log(`Node environment: ${Config.get<string>('NODE_ENV')}`);
