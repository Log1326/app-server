import { NestFactory } from '@nestjs/core'
import { AppModule } from './app/app.module'
import { PrismaService } from './prisma/prisma.service'
import * as cookieParser from 'cookie-parser'
import { SocketAdapter } from './socket/socket.adapter'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	const prismaService = app.get(PrismaService)
	await prismaService.enableShutdownHooks(app)
	const adapter = new SocketAdapter(app)
	app.useWebSocketAdapter(adapter)
	app.use(cookieParser())
	app.setGlobalPrefix('api')
	app.enableCors({
		credentials: true,
		origin: process.env.FRONT_API
	})
	await app.listen(process.env.PORT || 4200)
}
bootstrap()
