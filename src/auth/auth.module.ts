import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { getJwtConfig } from '../configJwt/jwt.config'

import { PrismaService } from '../prisma/prisma.service'

import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'

import { UserService } from '../user/user.service'

import { MailModule } from '../mail/mail.module'

import { GoogleStrategy } from './strategy/google.strategy'
import { JwtStrategy } from './strategy/jwt.strategy'

@Module({
	controllers: [AuthController],
	providers: [
		AuthService,
		JwtStrategy,
		GoogleStrategy,
		PrismaService,
		UserService
	],
	imports: [
		MailModule,
		ConfigModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getJwtConfig
		})
	]
})
export class AuthModule {}
