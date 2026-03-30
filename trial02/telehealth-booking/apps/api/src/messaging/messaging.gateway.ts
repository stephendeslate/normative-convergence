import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { MessagingService } from './messaging.service';

@WebSocketGateway({
  namespace: '/messaging',
  cors: { origin: '*' },
})
export class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(MessagingGateway.name);

  constructor(private messagingService: MessagingService) {}

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: { appointmentId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `appointment:${data.appointmentId}`;
    await client.join(room);
    this.logger.debug(`Client ${client.id} joined ${room}`);
    return { event: 'joinedRoom', data: { room } };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: { appointmentId: string; senderId: string; content: string; type?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messagingService.sendMessage(data.senderId, {
      appointmentId: data.appointmentId,
      content: data.content,
      type: (data.type as any) || 'TEXT',
    });

    const room = `appointment:${data.appointmentId}`;
    this.server.to(room).emit('newMessage', message);
    return message;
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @MessageBody() data: { appointmentId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `appointment:${data.appointmentId}`;
    await client.leave(room);
    this.logger.debug(`Client ${client.id} left ${room}`);
  }
}
