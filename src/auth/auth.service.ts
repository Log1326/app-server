import { User } from '@prisma/client'

import { Injectable, UnauthorizedException } from '@nestjs/common'

import { JwtService } from '@nestjs/jwt'
import { Request, Response } from 'express'

import { AuthDto } from './dto/auth.dto'
import { ExpiresIn, ILogin, ResultFn, TokensType } from './dto/types'

import { UserService } from '../user/user.service'
import { MailService } from '../mail/mail.service'

@Injectable()
export class AuthService {
	constructor(
		private jwt: JwtService,
		private user: UserService,
		private mail: MailService
	) {}
	async googleAuthRegister(
		req: Request
	): Promise<ResultFn & { exist: boolean }> {
		const userGoogle = req.user as AuthDto
		const userExist = await this.user.findUserEmail(userGoogle.email)
		if (userExist) {
			const tokens = await this.issueTokens(userExist.id, userExist.email, {
				access: '1d',
				refresh: '2d'
			})
			return {
				exist: true,
				user: this.returnUserFields(userExist),
				...tokens
			}
		} else {
			const user = await this.user.createNewUser(userGoogle)
			const tokens = await this.issueTokens(user.id, user.email, {
				access: '1d',
				refresh: '2d'
			})
			return {
				exist: false,
				user: this.returnUserFields(user),
				...tokens
			}
		}
	}
	async register(dto: AuthDto): Promise<ResultFn> {
		await this.user.isOldUserEmail(dto.email)
		await this.mail.sendUserConfirmation(
			dto.email,
			`${process.env.API_URL}/auth/verify/${dto.email}`
		)
		const user = await this.user.createNewUser(dto)
		const tokens = await this.issueTokens(user.id, user.email, {
			access: '1d',
			refresh: '2d'
		})
		return {
			user: this.returnUserFields(user),
			...tokens
		}
	}
	async login(dto: ILogin): Promise<ResultFn> {
		const user = await this.validateAuth(dto)
		const tokens = await this.issueTokens(user.id, user.email, {
			access: '1d',
			refresh: '2d'
		})
		return {
			user: this.returnUserFields(user),
			...tokens
		}
	}
	async activateLink(link: string): Promise<User> {
		await this.user.userByEmail(link)
		return this.user.emailVerified(link)
	}
	async updateTokens(refreshToken: string): Promise<TokensType> {
		try {
			const result: { id: string } = await this.jwt.verifyAsync(refreshToken)
			const user = await this.user.userById(result.id)
			return this.issueTokens(user.id, user.email, {
				access: '1d',
				refresh: '2d'
			})
		} catch (err) {
			throw new UnauthorizedException('Invalid token', err)
		}
	}
	async sendCookie(res: Response, token: string): Promise<Response> {
		return res.cookie('refresh_token', token, {
			httpOnly: true, //if true you cannot use cookie in front
			secure: false, // only http
			expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
		})
	}
	async validateAuth(dto: ILogin): Promise<User> {
		const user = await this.user.userByEmail(dto.email)
		const isValidPassword = await this.user.validatePassword(
			dto.hashedPassword,
			user.hashedPassword
		)
		if (user && isValidPassword) return user
		else return null
	}
	async logout(id: string, email: string): Promise<void> {
		await this.issueTokens(id, email, {
			access: '1s',
			refresh: '1s'
		})
	}
	private async issueTokens(
		id: string,
		email: string,
		expiresTime: ExpiresIn
	): Promise<TokensType> {
		const payload = { id, email }
		const accessToken = this.jwt.sign(payload, {
			expiresIn: expiresTime.access
		})
		const refreshToken = this.jwt.sign(payload, {
			expiresIn: expiresTime.refresh
		})
		return { accessToken, refreshToken }
	}
	private returnUserFields(user: User): Pick<User, 'id' | 'email'> {
		return {
			id: user.id,
			email: user.email
		}
	}
	fieldsUserIdToken(user: ResultFn): ResultFn {
		return {
			user: {
				id: user.user.id,
				email: user.user.email
			},
			accessToken: user.accessToken
		}
	}
}
