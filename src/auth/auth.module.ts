import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { getJwtConfig } from '../configJwt/jwt.config'
import { JwtStrategy } from './jwt/jwt.strategy'
import { PrismaService } from '../prisma/prisma.service'
import { UserService } from '../user/user.service'

@Module({
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy, PrismaService, UserService],
	imports: [
		ConfigModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getJwtConfig
		})
	]
})
export class AuthModule {}
