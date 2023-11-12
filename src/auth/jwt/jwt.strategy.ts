import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { AuthService } from '../auth.service'
import { User } from '@prisma/client'
import { ILogin } from '../dto/types'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private configService: ConfigService, private auth: AuthService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get('JWT_TOKEN_SECRET')
		})
	}
	async validate(dto: ILogin): Promise<User> {
		const user = await this.auth.validateAuth(dto)
		if (!user) throw new UnauthorizedException()
		return user
	}
}
