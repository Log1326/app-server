import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'
import { User } from '@prisma/client'

import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private configService: ConfigService,
		private prisma: PrismaService
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				JwtStrategy.extractJWTFromCookie
			]),
			ignoreExpiration: false,
			secretOrKey: configService.get('JWT_TOKEN_SECRET')
		})
	}

	async validate({ email }: Pick<User, 'email'>): Promise<User> {
		const user = await this.prisma.user.findUnique({ where: { email } })
		if (!user) throw new UnauthorizedException()
		return user
	}
	private static extractJWTFromCookie(req: Request): string | null {
		if (req.cookies && req.cookies.refresh_token)
			return req.cookies.refresh_token
		return null
	}
}
