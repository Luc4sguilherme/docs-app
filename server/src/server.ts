import cors from 'cors';
import express, { Application, Express } from 'express';
import helmet from 'helmet';
import http from 'http';

import Editor from '@src/clients/Editor';
import * as database from '@src/database';

import logger from './logger';

export class Server {
  private server?: http.Server;
  private app: Express;
  private editor: Editor;

  constructor(private port = 3333) {
    this.app = express();
    this.server = http.createServer(this.app);
    this.editor = new Editor(this.server);
  }

  public async init(): Promise<void> {
    this.setupExpress();
    this.setupEditor();

    await this.databaseSetup();
  }

  private setupExpress(): void {
    this.app.use(express.json());
    this.app.use(helmet());
    this.app.use(
      cors({
        origin: '*',
      }),
    );
  }

  private setupEditor() {
    this.editor.init();
  }

  private async databaseSetup(): Promise<void> {
    await database.connect();
  }

  public getApp(): Application {
    return this.app;
  }

  public async close(): Promise<void> {
    if (this.server) {
      await new Promise((resolve, reject) => {
        this.server?.close(err => {
          if (err) {
            return reject(err);
          }
          resolve(true);
        });
      });
    }
  }

  public start(): void {
    this.server?.listen(this.port, () => {
      logger.info('Server listening on port: ' + this.port);
    });
  }
}
