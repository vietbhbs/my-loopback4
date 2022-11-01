import {ApplicationConfig, Lb4Application} from './application';
import * as mongoose from 'mongoose';
import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import { schema } from './schema/schema';
import { resolver } from './resolver';
export * from './application';

export async function main(options: ApplicationConfig = {}) {
  try {
    await mongoose.connect('mongodb://localhost:27017/nodejs_bms');
    console.log('Mongoose connect successfully!');
  } catch (error) {
    console.log('Mongoose connect failure!');
  }

  const appExpress = express();
  appExpress.use(
    '/graphql',
    graphqlHTTP(() => ({
      schema,
      rootValue: resolver,
      graphiql: true,
      customFormatErrorFn: (err: any) => {
        if (!err.originalError) {
          return err;
        }
        const { data } = err.originalError;
        const message = err.message || 'An error occurred.';
        const code = err.originalError.code || 500;
        return {
          message: message,
          status: code,
          data: data,
        };
      },
    })),
  );

  const app = new Lb4Application(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}

if (require.main === module) {
  // Run the application
  const config = {
    rest: {
      port: +(process.env.PORT ?? 3000),
      host: process.env.HOST,
      // The `gracePeriodForClose` provides a graceful close for http/https
      // servers with keep-alive clients. The default value is `Infinity`
      // (don't force-close). If you want to immediately destroy all sockets
      // upon stop, set its value to `0`.
      // See https://www.npmjs.com/package/stoppable
      gracePeriodForClose: 5000, // 5 seconds
      openApiSpec: {
        // useful when used with OpenAPI-to-GraphQL to locate your application
        setServersFromRequest: true,
      },
    },
  };
  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
