import { type Actions, fail } from '@sveltejs/kit';
import { sendFiche, FIELDS } from '../lib/server/mail';

export const actions: Actions = {
	default: async ({ request, platform }) => {
		const data = await request.formData();

		const values: Record<string, string> = {};

		for (const [key] of FIELDS) {
			values[key] = String(data.get(key) ?? '')
				.trim()
				.slice(0, 300);
		}

		if (FIELDS.some(([key]) => !values[key])) {
			return fail(400, {
				error: 'Tous les champs sont obligatoires.',
				values
			});
		}

		if (!platform?.env) {
			console.error('Cloudflare environment is unavailable.');

			return fail(500, {
				error: "Le service d'envoi est indisponible.",
				values
			});
		}

		try {
			await sendFiche(values, {
				BREVO_API_KEY: platform.env.BREVO_API_KEY,
				MAIL_FROM: platform.env.MAIL_FROM,
				MAIL_TO: platform.env.MAIL_TO
			});
		} catch (e) {
			console.error('Email sending failed:', e);

			return fail(500, {
				error: "L'envoi a échoué. Réessayez plus tard.",
				values
			});
		}

		return { success: true };
	}
};
