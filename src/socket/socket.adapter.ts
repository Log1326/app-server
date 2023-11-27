import { IoAdapter } from '@nestjs/platform-socket.io'
import { AuthenticatedSocket } from './socket.service'
import { INestApplication, UnauthorizedException } from '@nestjs/common'
import * as socketIo from 'socket.io'
import { JwtService } from '@nestjs/jwt'

export class SocketAdapter extends IoAdapter {
	constructor(app: INestApplication, private jwt?: JwtService) {
		super(app)
	}
	createIOServer(port: number, options?: socketIo.ServerOptions) {
		const server = super.createIOServer(port, options)
		server.use(async (socket: AuthenticatedSocket, next) => {
			const accessToken = socket.handshake.headers.authorization
			if (!accessToken) return next(new UnauthorizedException())
			const userId = socket.handshake.query.userId
			try {
				await this.jwt?.verifyAsync(accessToken, {
					secret: process.env.JWT_TOKEN_SECRET
				})
			} catch (err) {
				return next(new UnauthorizedException())
			}
			socket.userId = userId.toString()
			return next()
		})
		return server
	}
}
