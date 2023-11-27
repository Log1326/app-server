import { Module } from '@nestjs/common'
import { SocketService } from './socket.service'
import { SocketGateway } from './socket.gateway'
import { PrismaService } from '../prisma/prisma.service'
import { JwtService } from '@nestjs/jwt'

@Module({
	providers: [SocketGateway, SocketService, PrismaService, JwtService]
})
export class SocketModule {}
