import { IsEnum, IsOptional, IsString } from 'class-validator'
import { MessageType } from '@prisma/client'

export class UpdateMessageDto {
	@IsString()
	content: string
	@IsString()
	@IsEnum(MessageType)
	@IsOptional()
	type: MessageType
}
