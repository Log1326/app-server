import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { User } from '@prisma/client'

export const CurrentUser = createParamDecorator(
	(data: keyof User, context: ExecutionContext) => {
		const req = context.switchToHttp().getRequest()
		const user = req.user
		return data ? user?.[data] : user
	}
)
