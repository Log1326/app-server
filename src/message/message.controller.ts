import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post
} from '@nestjs/common'
import { MessageService } from './message.service'
import { CreateMessageDto } from './dto/createMessage.dto'
import { UpdateMessageDto } from './dto/updateMessage.dto'
import { Auth } from '../auth/decorators/auth.decorator'
import { CurrentUser } from '../auth/decorators/user.decorator'
import {Message, User} from '@prisma/client'

@Auth()
@Controller('message')
export class MessageController {
	constructor(private readonly messageService: MessageService) {}

	@Post()
	create(@Body() createMessageDto: CreateMessageDto, @CurrentUser() user: User) {
		return this.messageService.create(createMessageDto, user)
	}

	@Get(':id')
	findOne(@Param('id') id: string):Promise<Message> {
		return this.messageService.findOneMessage(id)
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto):Promise<Message> {
		return this.messageService.update(id, updateMessageDto)
	}

	@Delete(':id')
	remove(@Param('id') id: string):Promise<{msg:string}> {
		return this.messageService.remove(id)
	}
}
