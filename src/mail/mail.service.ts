import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'

@Injectable()
export class MailService {
	constructor(private mailerService: MailerService) {}

	async sendUserConfirmation(email: string, link: string) {
		await this.mailerService.sendMail({
			to: email,
			from: '"Support Team" <support@yourTestExample.com>',
			subject: 'Welcome to App! Confirm your Email',
			template: './confirmation', // `.hbs` extension is appended automatically
			context: {
				name: 'Dear User',
				url: link
			}
		})
	}
}
