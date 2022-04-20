import mongoose, { Mongoose } from 'mongoose';

import config from '~/src/config';

export const connect = async (): Promise<Mongoose> =>
  await mongoose.connect(config.App.database.mongoUrl);

export const close = (): Promise<void> => mongoose.connection.close();
