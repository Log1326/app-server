import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Post,
	Redirect,
	Req,
	Res,
	UseGuards,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { Request, Response } from 'express'
import { User } from '@prisma/client'

import { AuthDto, LoginDto } from './dto/auth.dto'
import { ResultFn, TokensType } from './dto/types'

import { CurrentUser } from './decorators/user.decorator'
import { Cookies } from './decorators/cookie.decorator'
import { GoogleOAuthGuard } from './guard/google-oauth.guard'

import { AuthService } from './auth.service'
import { Auth } from './decorators/auth.decorator'
import { AuthGuardCookie } from './guard/auth.guard'

@Controller('auth')
export class AuthController {
	constructor(private readonly auth: AuthService) {}

	@Get('google')
	@UseGuards(GoogleOAuthGuard)
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	async googleAuth() {}

	@Get('google-redirect')
	@UseGuards(GoogleOAuthGuard)
	async googleAuthRedirect(
		@Req() req: Request,
		@Res() res: Response
	): Promise<void> {
		const user = await this.auth.googleAuthRegister(req)
		await this.auth.sendCookie(res, user.refreshToken)
		return res.redirect(
			`http://localhost:3000/auth/success?token=${user.accessToken}&exist=${user.exist}`
		)
	}
	@UsePipes(new ValidationPipe())
	@HttpCode(HttpStatus.CREATED)
	@Post('register')
	async register(
		@Res({ passthrough: true }) res: Response,
		@Body() dto: AuthDto
	): Promise<ResultFn> {
		const user = await this.auth.register(dto)
		await this.auth.sendCookie(res, user.refreshToken)
		return this.auth.fieldsUserIdToken(user)
	}
	@UsePipes(new ValidationPipe())
	@HttpCode(HttpStatus.OK)
	@Post('login')
	async login(
		@Res({ passthrough: true }) res: Response,
		@Body() dto: LoginDto
	): Promise<ResultFn> {
		console.log(dto)
		const user = await this.auth.login(dto)
		await this.auth.sendCookie(res, user.refreshToken)
		return this.auth.fieldsUserIdToken(user)
	}
	@UsePipes(new ValidationPipe())
	@HttpCode(HttpStatus.OK)
	@Get('access-token')
	@UseGuards(AuthGuardCookie)
	async updateTokens(
		@Cookies('refresh_token') refresh_token: string,
		@Res({ passthrough: true }) res: Response
	): Promise<TokensType> {
		const tokens = await this.auth.updateTokens(refresh_token)
		await this.auth.sendCookie(res, tokens.refreshToken)
		return { accessToken: tokens.accessToken }
	}
	@HttpCode(HttpStatus.OK)
	@Get('logout')
	@Auth()
	async logout(
		@CurrentUser() user: User,
		@Res({ passthrough: true }) res: Response
	): Promise<{ message: string }> {
		await this.auth.logout(user.id, user.email)
		res.clearCookie('refresh_token')
		return { message: 'success logout' }
	}

	@HttpCode(200)
	@Get('verify/:link')
	@Redirect('http://localhost:3000/', 302)
	async activate(@Param('link') link: string) {
		await this.auth.activateLink(link)
		return { message: 'success' }
	}
}
