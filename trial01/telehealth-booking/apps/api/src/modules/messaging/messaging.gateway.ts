import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
// socket.io types provided transitively via @nestjs/platform-socket.io
type Server = any;
type Socket = any;
import { MessagingService } from './messaging.service';

@WebSocketGateway({ namespace: '/messaging', cors: { origin: '*' } })
export class MessagingGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly messagingService: MessagingService) {}

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { appointmentId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`appointment:${data.appointmentId}`);
    return { event: 'joinedRoom', data: { appointmentId: data.appointmentId } };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    data: {
      appointmentId: string;
      receiverId: string;
      content: string;
      type?: string;
      senderId: string;
      practiceId: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messagingService.sendMessage(
      {
        appointmentId: data.appointmentId,
        receiverId: data.receiverId,
        content: data.content,
        type: (data.type as any) || 'TEXT',
      },
      data.senderId,
      data.practiceId,
    );

    this.server
      .to(`appointment:${data.appointmentId}`)
      .emit('newMessage', message);

    return { event: 'messageSent', data: message };
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() data: { appointmentId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`appointment:${data.appointmentId}`);
    return { event: 'leftRoom', data: { appointmentId: data.appointmentId } };
  }
}
