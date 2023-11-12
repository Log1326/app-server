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
	async validateUser(email: string): Promise<User> {
		const user = await this.prisma.user.findUnique({
			where: { email }
		})
		if (!user) throw new NotFoundException('User not found')
		return user
	}
	async isUserByEmail(email: string): Promise<null | BadRequestException> {
		const oldUser = await this.prisma.user.findUnique({ where: { email } })
		if (oldUser) throw new BadRequestException('User already exist')
		return null
	}
	async userById(id: string): Promise<User> {
		const user = await this.prisma.user.findUnique({
			where: { id }
		})
		if (!user) throw new NotFoundException('User not found')
		return user
	}
	async create(dto: UserDto) {
		const hashedPassword = await bcrypt.hash(dto.hashedPassword, 7)
		const data = {
			firstName: dto.firstName,
			lastName: dto.lastName,
			email: dto.email,
			emailVerified: false,
			picture: dto.picture,
			hashedPassword
		}
		return this.prisma.user.create({
			data
		})
	}
}
