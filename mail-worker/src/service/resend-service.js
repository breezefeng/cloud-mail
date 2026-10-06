import emailService from './email-service';
import { emailConst } from '../const/entity-const';

const resendService = {

	async webhooks(c, body) {

		const params = {
			resendEmailId: body.data.email_id,
			status: emailConst.status.SENT
		}

		if (body.type === 'email.delivered') {
			params.status = emailConst.status.DELIVERED
			params.message = null
		}

		if (body.type === 'email.complained') {
			params.status = emailConst.status.COMPLAINED
			params.message = null
		}

		if (body.type === 'email.bounced') {
			let bounce = body.data.bounce
			bounce = JSON.stringify(bounce);
			params.status = emailConst.status.BOUNCED
			params.message = bounce
		}

		if (body.type === 'email.delivery_delayed') {
			params.status = emailConst.status.DELAYED
			params.message = null
		}

		if (body.type === 'email.failed') {
			params.status = emailConst.status.FAILED
			params.message = body.data.failed.reason
		}

		const emailRow = await emailService.updateEmailStatus(c, params)

		// Resend webhooks are account-wide. The same Resend account can send mail
		// for applications that do not store their messages in this database, so
		// an unknown email ID is expected and must still be acknowledged. Returning
		// a non-2xx response makes Resend retry and eventually disable the endpoint.
		if (!emailRow) {
			console.warn('Ignored Resend event for an unknown email ID', {
				type: body.type,
				resendEmailId: params.resendEmailId
			});
			return false;
		}

		return true;

	}
}

export default resendService
