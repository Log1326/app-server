import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private jwtService: JwtService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest()
		const token = this.extractJWTFromCookie(request)
		if (!token) throw new UnauthorizedException()
		try {
			await this.jwtService.verifyAsync(token, {
				secret: process.env.JWT_TOKEN_SECRET
			})
		} catch {
			throw new UnauthorizedException()
		}
		return true
	}
	private extractJWTFromCookie(req: Request): string | null {
		if (req.cookies && req.cookies.refresh_token)
			return req.cookies.refresh_token
		return null
	}
}
