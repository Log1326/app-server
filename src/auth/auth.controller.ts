import {
	Body,
	Controller,
	HttpCode,
	Post,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthDto, LoginDto } from './dto/auth.dto'
import { TokenDto } from './dto/token.dto'
import { ResultFn, TokensType } from './dto/types'

@Controller('auth')
export class AuthController {
	constructor(private readonly auth: AuthService) {}
	@UsePipes(new ValidationPipe())
	@HttpCode(201)
	@Post('register')
	async register(@Body() dto: AuthDto): Promise<ResultFn> {
		return this.auth.register(dto)
	}
	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('login')
	async login(@Body() dto: LoginDto): Promise<ResultFn> {
		return this.auth.login(dto)
	}
	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('access-token')
	async updateTokens(@Body() dto: TokenDto): Promise<TokensType> {
		return this.auth.updateTokens(dto)
	}
}
