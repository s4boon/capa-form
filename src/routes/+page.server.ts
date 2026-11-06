import { type Actions, fail } from '@sveltejs/kit';
import { env } from 'cloudflare:workers';
import { sendFiche, FIELDS } from '../lib/server/mail';

export const actions: Actions = {
	default: async ({ request }) => {
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

		try {
			await sendFiche(values, {
				BREVO_API_KEY: env.BREVO_API_KEY,
				MAIL_FROM: env.MAIL_FROM,
				MAIL_TO: env.MAIL_TO
			});
		} catch (e) {
			console.error(e);
			return fail(500, {
				error: "L'envoi a échoué. Réessayez plus tard.",
				values
			});
		}

		return { success: true };
	}
};
