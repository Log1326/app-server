import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { JwtService } from '@nestjs/jwt'
import { UserService } from '../user/user.service'
import { User } from '@prisma/client'
import { AuthDto } from './dto/auth.dto'
import { ILogin, ResultFn, TokensType } from './dto/types'
import { TokenDto } from './dto/token.dto'
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private jwt: JwtService,
		private user: UserService
	) {}
	async register(dto: AuthDto): Promise<ResultFn> {
		await this.user.isUserByEmail(dto.email)
		const user = await this.user.create(dto)
		const tokens = await this.issueTokens(user.id, user.email)
		return {
			user: this.returnUserFields(user),
			...tokens
		}
	}
	async login(dto: ILogin): Promise<ResultFn> {
		const user = await this.validateAuth(dto)
		const tokens = await this.issueTokens(user.id, user.email)
		return {
			user: this.returnUserFields(user),
			...tokens
		}
	}
	async updateTokens(refreshToken: TokenDto): Promise<TokensType> {
		try {
			const result: { id: string } = await this.jwt.verifyAsync(
				refreshToken.refreshToken
			)
			const user = await this.user.userById(result.id)
			const tokens = await this.issueTokens(user.id, user.email)
			return { ...tokens }
		} catch (err) {
			throw new UnauthorizedException('Invalid token', err)
		}
	}
	async validateAuth(dto: ILogin): Promise<User> {
		const user = await this.user.validateUser(dto.email)
		const isValidPassword = await bcrypt.compare(
			dto.hashedPassword,
			user.hashedPassword
		)
		if (!isValidPassword) throw new UnauthorizedException('Invalid credentials')
		if (user && isValidPassword) return user
		return null
	}
	private async issueTokens(
		id: string,
		email: string
	): Promise<{ accessToken: string; refreshToken: string }> {
		const data = { id, email }
		const accessToken = this.jwt.sign(data, { expiresIn: '1d' })
		const refreshToken = this.jwt.sign(data, { expiresIn: '2d' })
		return { accessToken, refreshToken }
	}
	private returnUserFields(user: User): Pick<User, 'id' | 'email'> {
		return {
			id: user.id,
			email: user.email
		}
	}
}
