import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator'

export class AuthDto {
	@IsEmail()
	email: string
	@IsString()
	firstName: string
	@IsString()
	lastName: string
	@IsBoolean()
	@IsOptional()
	emailVerified: boolean
	@IsString()
	@IsOptional()
	picture: string
	@IsString()
	@IsOptional()
	hashedPassword: string
}

export class LoginDto {
	@IsEmail()
	email: string
	@IsString()
	hashedPassword: string
}
