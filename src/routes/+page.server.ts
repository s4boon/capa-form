import { type Actions, fail } from '@sveltejs/kit';
import { env } from 'cloudflare:workers';
import { sendFiche, FIELDS } from '../lib/server/mail';
import { ATELIERS, SEXES, PROFILS, FONCTIONS } from '../lib/options';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d\s().-]+$/;

/** A listed option, or "Autre : <précision>" (a bare "Autre" is not accepted). */
const optionOrOther = (value: string, list: string[]) =>
	list.filter((o) => o !== 'Autre').includes(value) || /^Autre : .+/.test(value);

function validate(v: Record<string, string>): string | null {
	if (FIELDS.some(([key]) => !v[key])) return 'Tous les champs sont obligatoires.';

	if (!ATELIERS.includes(v.session)) return 'Session invalide.';
	if (!SEXES.includes(v.sexe)) return 'Sexe invalide.';
	if (!optionOrOther(v.profil, PROFILS)) return 'Profil invalide.';
	if (!optionOrOther(v.fonction, FONCTIONS)) return 'Fonction invalide.';

	if (!/^\d{1,2}$/.test(v.age) || Number(v.age) < 1) return 'Âge invalide.';

	const digits = (v.telephone.match(/\d/g) ?? []).length;
	if (!PHONE_RE.test(v.telephone) || digits < 8 || digits > 15)
		return 'Numéro de téléphone invalide.';

	if (v.email.length > 254 || !EMAIL_RE.test(v.email)) return 'Adresse e-mail invalide.';

	return null;
}

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();

		const values: Record<string, string> = {};
		for (const [key] of FIELDS) {
			values[key] = String(data.get(key) ?? '')
				.trim()
				.slice(0, 300);
		}

		const error = validate(values);
		if (error) return fail(400, { error, values });

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
