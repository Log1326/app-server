import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { UserDto } from './dto/user.dto'
import * as bcrypt from 'bcrypt'
import { User } from '@prisma/client'

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	async userById(id: string): Promise<User> {
		const user = await this.prisma.user.findUnique({
			where: { id }
		})
		if (!user) throw new NotFoundException('User not found')
		return user
	}
	async createNewUser(dto: UserDto) {
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
	async validateUser(email: string): Promise<User> {
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
	async isUserEmail(email: string): Promise<null | BadRequestException> {
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
}
