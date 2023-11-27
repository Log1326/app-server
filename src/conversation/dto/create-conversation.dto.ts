import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator'
import { User } from '@prisma/client'

export class CreateConversationDto {
	@IsBoolean()
	@IsOptional()
	isGroup: boolean
	@IsArray()
	@IsOptional()
	members: User[]
	@IsString()
	@IsOptional()
	name: string
	@IsString()
	@IsOptional()
	userId: string
}
