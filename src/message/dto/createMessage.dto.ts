import { IsEnum, IsString } from 'class-validator'
import { MessageStatus, MessageType } from '@prisma/client'

export class CreateMessageDto {
	@IsString()
	content: string
	@IsString()
	@IsEnum(MessageType)
	type: MessageType
	@IsString()
	@IsEnum(MessageStatus)
	messageStatus: MessageStatus
	@IsString()
	receivedId: string
	@IsString()
	conversationId: string
}
