import { resolve } from 'path';
import pino from 'pino';

import config from '~/src/config';

const path = resolve(__dirname, '../');

export default pino({
  enabled: config.App.logger.enabled,
  transport: {
    targets: [
      {
        level: config.App.logger.level as pino.LevelWithSilent,
        target: 'pino-pretty',
        options: {
          colorize: true,
          levelFirst: true,
          translateTime: 'yyyy-dd-mm, h:MM:ss TT',
        },
      },
      {
        level: 'trace',
        target: 'pino/file',
        options: { destination: `${path}/info.log` },
      },
    ],
  },
});
