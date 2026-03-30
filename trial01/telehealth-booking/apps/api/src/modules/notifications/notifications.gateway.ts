import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';
// socket.io types provided transitively via @nestjs/platform-socket.io
type Server = any;
import type { WsNotification } from '@medconnect/shared';
import { NotificationsService } from './notifications.service';

@WebSocketGateway({ namespace: '/notifications', cors: { origin: '*' } })
export class NotificationsGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(private readonly notificationsService: NotificationsService) {}

  afterInit() {
    this.notificationsService.setGateway(this);
  }

  pushNotification(userId: string, notification: WsNotification) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }

  handleConnection(client: any) {
    const userId = client.handshake?.query?.userId as string;
    if (userId) {
      client.join(`user:${userId}`);
    }
  }
}
