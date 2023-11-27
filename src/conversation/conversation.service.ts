import { Injectable } from '@nestjs/common'
import { CreateConversationDto } from './dto/create-conversation.dto'
import { UpdateConversationDto } from './dto/update-conversation.dto'
import { PrismaService } from '../prisma/prisma.service'
import { User } from '@prisma/client'

@Injectable()
export class ConversationService {
	constructor(private prisma: PrismaService) {}
	async createConversation(
		createConversationDto: CreateConversationDto,
		user: User
	) {
		if (createConversationDto.isGroup) {
			const newConversation = await this.prisma.conversationRoom.create({
				data: {
					name: createConversationDto.name,
					isGroup: createConversationDto.isGroup,
					users: {
						connect: [
							...createConversationDto.members.map(member => ({
								id: member.id
							})),
							{ id: user.id }
						]
					}
				},
				include: { users: true }
			})
			//socket add
			return newConversation
		}
		const existConversation = await this.prisma.conversationRoom.findMany({
			where: {
				OR: [
					{ userIds: { equals: [user.id, createConversationDto.userId] } },
					{ userIds: { equals: [createConversationDto.userId, user.id] } }
				]
			}
		})
		const singleConversation = existConversation[0]
		if (singleConversation) return singleConversation
		const newConversation = await this.prisma.conversationRoom.create({
			data: {
				users: {
					connect: [{ id: user.id }, { id: createConversationDto.userId }]
				}
			},
			include: { users: true }
		})
		//socket add
		return newConversation
	}

	getConversationId(id: string) {
		return this.validateConversation(id)
	}

	async updateConversationId(
		id: string,
		updateConversationDto: UpdateConversationDto
	) {
		const conversation = await this.validateConversation(id)
		return this.prisma.conversationRoom.update({
			where: { id: conversation.id },
			data: updateConversationDto
		})
	}

	async removeConversationId(id: string) {
		await this.validateConversation(id)
		return this.prisma.conversationRoom.delete({ where: { id } })
	}
	private async validateConversation(id: string) {
		const item = await this.prisma.conversationRoom.findUnique({
			where: { id }
		})
		if (!item) throw new Error('not found')
		return item
	}
}
