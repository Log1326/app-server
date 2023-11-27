import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer
} from '@nestjs/websockets'
import { Server } from 'socket.io'
import { AuthenticatedSocket, SocketService } from './socket.service'

@WebSocketGateway({
	cors: {
		origin: [process.env.FRONT_API],
		credentials: true
	},
	pingInterval: 10000,
	pingTimeout: 15000
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	private server: Server
	constructor(private readonly socketService: SocketService) {}

	handleConnection(socket: AuthenticatedSocket): void {
		this.socketService.setUserSocket(socket.userId, socket)
		socket.emit('connection', {})
	}
	handleDisconnect(socket: AuthenticatedSocket) {
		this.socketService.removeUserSocket(socket.userId)
		socket.emit('disconnection', {})
	}
	@SubscribeMessage('join-room')
	joinRoom(
		@MessageBody() roomId: string,
		@ConnectedSocket() socket: AuthenticatedSocket
	) {
		socket.join(roomId)
		socket.emit('joined-room', {})
	}
	@SubscribeMessage('send-msg')
	handleMessage(@MessageBody() message: { to: string; data: any }) {
		this.socketService
			.getUserSocket(message.to)
			.emit('receive-msg', message.data)
	}
}
