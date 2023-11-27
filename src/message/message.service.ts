import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { SocketGateway } from '../socket/socket.gateway'
import { CreateMessageDto } from './dto/createMessage.dto'
import { UpdateMessageDto } from './dto/updateMessage.dto'
import {Message, User} from '@prisma/client'

@Injectable()
export class MessageService {
	constructor(
		private prisma: PrismaService,
		private socketGateway: SocketGateway
	) {}
	async create(dto: CreateMessageDto, user: User) {
		const newMessage = await this.prisma.message.create({
			data: {
				content: dto.content,
				type: dto.type,
				messageStatus: 'send',
				sender: { connect: { id: user.id } },
				received: { connect: { id: dto.receivedId } },
				conversationRoom: { connect: { id: dto.conversationId } }
			},
			include: {
				sender: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						picture: true,
						receiveMessagesId: true
					}
				},
				received: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						picture: true,
						receiveMessagesId: true
					}
				}
			}
		})
		this.socketGateway.handleMessage({
			to: newMessage.received.at(-1).id,
			data: newMessage
		})
		return { message: newMessage }
	}
	async findOneMessage(id: string):Promise<Message> {
		const message = await this.validateMessage(id)
		if (!message) throw new Error('not found')
		return message
	}

	async update(id: string, dto: UpdateMessageDto):Promise<Message> {
		await this.validateMessage(id)
		return this.prisma.message.update({
			where: { id },
			data: { content: dto.content, type: dto.type }
		})
	}

	async remove(id: string):Promise<{msg:string}> {
		await this.validateMessage(id)
		await this.prisma.message.delete({ where: { id } })
		return { msg: `message with id: ${id} was deleted` }
	}
	private async validateMessage(id: string):Promise<Message> {
		const item = await this.prisma.message.findFirst({ where: { id } })
		if (!item) throw new Error('not found')
		return item
	}
}
