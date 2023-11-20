import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { UserDto, UserDtoUpdate } from './dto/user.dto'
import * as bcrypt from 'bcrypt'
import { User } from '@prisma/client'

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}
	async deleteUser(id: string) {
		return this.prisma.user.delete({ where: { id } })
	}
	async updateUser(
		dto: UserDtoUpdate,
		email: string
	): Promise<
		Omit<
			UserDtoUpdate,
			'previousPassword' | 'newPassword' | 'emailVerified' | 'accessToken'
		>
	> {
		const previousProfile = await this.findUserEmail(email)
		const updatePassword = await this.updatePassword(
			dto.previousPassword,
			dto.newPassword,
			previousProfile.hashedPassword
		)
		const {
			previousPassword,
			newPassword,
			emailVerified,
			accessToken,
			...otherDto
		} = dto
		const user = await this.prisma.user.update({
			where: { email },
			data: { ...otherDto, hashedPassword: updatePassword }
		})
		return this.ResponseField(user)
	}
	async userById(
		id: string
	): Promise<Omit<User, 'hashedPassword' | 'accessToken'>> {
		const user = await this.prisma.user.findUnique({
			where: { id }
		})
		if (!user) throw new NotFoundException('User not found')
		return this.ResponseField(user)
	}
	async createNewUser(dto: UserDto): Promise<User> {
		const hashedPassword = dto.hashedPassword
			? await bcrypt.hash(dto.hashedPassword, 7)
			: null
		const emailVerify = dto.emailVerified ? dto.emailVerified : false
		const data = {
			...dto,
			accessToken: null,
			emailVerified: emailVerify,
			hashedPassword
		}
		return this.prisma.user.create({
			data
		})
	}
	async validatePassword(
		password: string,
		userPassword: string
	): Promise<boolean> {
		const isValidPassword = await bcrypt.compare(password, userPassword)
		if (!isValidPassword) throw new BadRequestException('Invalid credentials')
		return !!isValidPassword
	}
	async updatePassword(
		previousPassword: string,
		newPassword: string,
		previousUserPassword: string
	): Promise<string> {
		if (!previousPassword && !newPassword) return
		if (previousPassword)
			await this.validatePassword(previousPassword, previousUserPassword)
		return newPassword ? await bcrypt.hash(newPassword, 7) : undefined
	}
	async userByEmail(email: string): Promise<User> {
		const user = await this.prisma.user.findUnique({
			where: { email }
		})
		if (!user) throw new NotFoundException('User not found')
		return user
	}
	async findUserEmail(email: string): Promise<User> {
		return this.prisma.user.findUnique({
			where: { email }
		})
	}
	async isOldUserEmail(email: string): Promise<null | BadRequestException> {
		const oldUser = await this.prisma.user.findUnique({ where: { email } })
		if (oldUser) throw new BadRequestException('User already exist')
		return null
	}
	async emailVerified(email: string): Promise<User> {
		return this.prisma.user.update({
			where: { email: email },
			data: {
				emailVerified: true
			}
		})
	}
	private ResponseField(
		user: User
	): Omit<User, 'hashedPassword' | 'accessToken'> {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { hashedPassword, accessToken, ...other } = user
		return other
	}
}
