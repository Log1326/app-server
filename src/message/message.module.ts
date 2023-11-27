import { Module } from '@nestjs/common'
import { MessageService } from './message.service'
import { MessageController } from './message.controller'
import { PrismaService } from '../prisma/prisma.service'
import { SocketGateway } from '../socket/socket.gateway'
import { SocketService } from '../socket/socket.service'
import { JwtService } from '@nestjs/jwt'

@Module({
	controllers: [MessageController],
	providers: [
		MessageService,
		PrismaService,
		SocketGateway,
		SocketService,
		JwtService
	]
})
export class MessageModule {}
