import http from 'http';
import { Server, Socket } from 'socket.io';

import logger from '@src/logger';
import { findOrCreateDocument, saveDocument } from '@src/models/Document';

export default class Editor {
  private io: Server;
  private clientsCount: number;

  constructor(private httpServer?: http.Server) {
    this.io = new Server(this.httpServer, {
      cors: {
        origin: 'http://localhost',
        methods: ['GET', 'POST'],
      },
    });

    this.clientsCount = 0;
  }

  init() {
    this.setupEvents();
  }

  private setupEvents() {
    this.clientConnectEvent();
    this.errorEvent();
  }

  private clientConnectHandler(client: Socket) {
    logger.info(`client ID:${client.id} connected`);

    this.clientsCount++;

    this.clientsCountEvent();
    this.clientDisconnectEvent(client);
    this.getDocumentEvent(client);
  }

  private clientConnectEvent() {
    this.io.on('connection', (client: Socket) => {
      this.clientConnectHandler(client);
    });
  }

  private clientDisconnectHandler(client: Socket) {
    logger.info(`client ID:${client.id} disconnected`);

    if (this.clientsCount > 0) {
      this.clientsCount--;
    }

    this.clientsCountEvent();
  }

  private clientDisconnectEvent(client: Socket) {
    client.on('disconnect', () => {
      this.clientDisconnectHandler(client);
    });
  }

  public getQuantityClientsConnected(): number {
    return this.clientsCount;
  }

  private clientsCountHandler() {
    const quantityClients = this.getQuantityClientsConnected();

    logger.info(`${quantityClients} client(s) connected`);

    return quantityClients;
  }

  private clientsCountEvent() {
    this.io.emit('count', this.clientsCountHandler());
  }

  private errorHandler(error: Error) {
    logger.error(error.message);
  }

  private errorEvent() {
    this.io.on('error', (error: Error) => {
      this.errorHandler(error);
    });
  }

  private async getDocument(client: Socket, documentId: string) {
    const document = await findOrCreateDocument(documentId);

    client.join(documentId);

    this.loadDocumentEvent(client, document);
    this.sendDocumentEvent(client, documentId);
    this.saveDocumentEvent(client, documentId);
  }

  public loadDocumentEvent(client: Socket, document: any) {
    client.emit('load-document', document.data);
  }

  public getDocumentEvent(client: Socket) {
    client.on('get-document', documentId => {
      this.getDocument(client, documentId);
    });
  }

  public saveDocumentEvent(client: Socket, documentId: string) {
    client.on('save-document', data => saveDocument(documentId, data));
  }

  public sendDocumentEvent(client: Socket, documentId: string) {
    client.on('send-changes', delta => {
      this.documentSubmissionHandler(client, documentId, delta);
    });
  }

  private documentSubmissionHandler(
    client: Socket,
    documentId: string,
    delta: any,
  ) {
    client.broadcast.to(documentId).emit('receive-changes', delta);
  }
}
