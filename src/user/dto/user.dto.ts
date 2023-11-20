import { Prisma } from '@prisma/client'
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator'

export class UserDto implements Prisma.UserUpdateInput {
	@IsEmail()
	@IsOptional()
	email: string
	@IsString()
	@IsOptional()
	picture: string
	@IsString()
	@IsOptional()
	hashedPassword: string
	@IsBoolean()
	@IsOptional()
	emailVerified: boolean
	@IsString()
	@IsOptional()
	firstName: string
	@IsString()
	@IsOptional()
	lastName: string
	@IsString()
	@IsOptional()
	accessToken: string
}
export class UserDtoUpdate implements Prisma.UserUpdateInput {
	@IsEmail()
	@IsOptional()
	email: string
	@IsString()
	@IsOptional()
	picture: string
	@IsString()
	@IsOptional()
	previousPassword: string
	@IsString()
	@IsOptional()
	newPassword: string
	@IsString()
	@IsOptional()
	accessToken: string
	@IsBoolean()
	@IsOptional()
	emailVerified: boolean
	firstName: string
	@IsString()
	@IsOptional()
	lastName: string
}
