import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { UserService } from './user.service'
import { CurrentUser } from '../auth/decorators/user.decorator'
import { Auth } from '../auth/decorators/auth.decorator'
import { UserDtoUpdate } from './dto/user.dto'

@Controller('user')
export class UserController {
	constructor(private readonly user: UserService) {}
	@HttpCode(HttpStatus.OK)
	@Get('profile')
	@Auth()
	async getProfile(@CurrentUser('id') id: string) {
		return this.user.userById(id)
	}
	@HttpCode(HttpStatus.OK)
	@Delete('delete')
	@Auth()
	async deleteProfile(@CurrentUser('id') id: string) {
		await this.user.deleteUser(id)
		return { message: 'remove success' }
	}
	@UsePipes(new ValidationPipe())
	@HttpCode(HttpStatus.OK)
	@Post('update')
	@Auth()
	async updateProfile(
		@CurrentUser('email') email: string,
		@Body() dto: UserDtoUpdate
	) {
		return this.user.updateUser(dto, email)
	}
}
