import { NestFactory } from '@nestjs/core'
import { AppModule } from './app/app.module'
import { PrismaService } from './prisma/prisma.service'
import * as cookieParser from 'cookie-parser'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	const prismaService = app.get(PrismaService)
	await prismaService.enableShutdownHooks(app)
	app.use(cookieParser())
	app.setGlobalPrefix('api')
	app.enableCors({
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
		credentials: true,
		origin: '*'
	})
	await app.listen(process.env.PORT || 4200)
}
bootstrap()
