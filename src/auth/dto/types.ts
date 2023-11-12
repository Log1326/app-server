import { User } from '@prisma/client'

export type TokensType = {
	accessToken: string
	refreshToken: string
}
export interface ResultFn extends TokensType {
	user: Pick<User, 'id' | 'email'>
}
export interface ILogin {
	email: string
	hashedPassword: string
}
