import { Injectable } from '@nestjs/common'
import { Socket } from 'socket.io'

export interface AuthenticatedSocket extends Socket {
	userId?: string
}
export interface IGatewaySessionManager {
	getUserSocket(id: string): AuthenticatedSocket
	setUserSocket(id: string, socket: AuthenticatedSocket): void
	removeUserSocket(id: string): void
	getSockets(): Map<string, AuthenticatedSocket>
}
@Injectable()
export class SocketService implements IGatewaySessionManager {
	private readonly sessions: Map<string, AuthenticatedSocket> = new Map()

	getUserSocket(id: string) {
		return this.sessions.get(id)
	}

	setUserSocket(userId: string, socket: AuthenticatedSocket) {
		this.sessions.set(userId, socket)
	}
	removeUserSocket(userId: string) {
		this.sessions.delete(userId)
	}
	getSockets(): Map<string, AuthenticatedSocket> {
		return this.sessions
	}
}
