import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post
} from '@nestjs/common'
import { ConversationService } from './conversation.service'
import { CreateConversationDto } from './dto/create-conversation.dto'
import { UpdateConversationDto } from './dto/update-conversation.dto'
import { CurrentUser } from '../auth/decorators/user.decorator'
import { User } from '@prisma/client'
import { Auth } from '../auth/decorators/auth.decorator'

@Auth()
@Controller('conversation')
export class ConversationController {
	constructor(private readonly conversationService: ConversationService) {}

	@Post()
	create(@Body() body: CreateConversationDto, @CurrentUser() user: User) {
		return this.conversationService.createConversation(body, user)
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.conversationService.getConversationId(id)
	}

	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body() updateConversationDto: UpdateConversationDto
	) {
		return this.conversationService.updateConversationId(
			id,
			updateConversationDto
		)
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.conversationService.removeConversationId(id)
	}
}
