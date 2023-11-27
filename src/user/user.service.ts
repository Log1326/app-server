import * as bcrypt from 'bcrypt'

import {
	BadRequestException,
	Inject,
	Injectable,
	NotFoundException
} from '@nestjs/common'

import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'

import { User } from '@prisma/client'

import { PrismaService } from '../prisma/prisma.service'
import { UserDto, UserDtoUpdate } from './dto/user.dto'

@Injectable()
export class UserService {
	constructor(
		private prisma: PrismaService,
		@Inject(CACHE_MANAGER) private cache: Cache
	) {}
	async deleteUser(id: string):Promise<User> {
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
		const cacheUser = await this.cache.get<User>(id)
		if (!cacheUser) {
			const user = await this.prisma.user.findUnique({
				where: { id }
			})
			if (!user) throw new NotFoundException('User not found')
			await this.cache.set(id, user, 24 * 60 * 60 * 1000)
			return this.ResponseField(user)
		}
		return this.ResponseField(cacheUser)
	}
	async createNewUser(dto: UserDto): Promise<User> {
		const hashedPassword = dto.hashedPassword
			? await bcrypt.hash(dto.hashedPassword, 7)
			: null
		const emailVerify = dto.emailVerified ? dto.emailVerified : false
		const data = {
			...dto,
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
		const { hashedPassword, ...other } = user
		return other
	}
	clearCache():Promise<void> {
		return this.cache.reset()
	}
}
