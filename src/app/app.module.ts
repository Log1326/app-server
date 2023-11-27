import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { ConfigModule } from '@nestjs/config'
import { PrismaService } from '../prisma/prisma.service'
import { UserModule } from '../user/user.module'
import { CacheModule } from '@nestjs/cache-manager'
import { SocketModule } from '../socket/socket.module'
import { MessageModule } from '../message/message.module'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ConversationModule } from '../conversation/conversation.module'

@Module({
	imports: [
		AuthModule,
		UserModule,
		MessageModule,
		SocketModule,
		ConversationModule,
		ConfigModule.forRoot(),
		EventEmitterModule.forRoot(),
		CacheModule.register({ isGlobal: true })
	],
	providers: [PrismaService]
})
export class AppModule {}
