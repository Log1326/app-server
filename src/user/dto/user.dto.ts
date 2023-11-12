import { Prisma } from '@prisma/client'
import { IsEmail, IsOptional, IsString } from 'class-validator'

export class UserDto implements Prisma.UserUpdateInput {
	@IsEmail()
	email: string
	@IsString()
	@IsOptional()
	picture: string
	@IsString()
	@IsOptional()
	hashedPassword: string
	@IsString()
	@IsOptional()
	emailVerified: boolean
	@IsString()
	@IsOptional()
	firstName: string
	@IsString()
	@IsOptional()
	lastName: string
}
