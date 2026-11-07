import { PDFDocument, StandardFonts, rgb, type PDFFont } from 'pdf-lib';

/** [form field name, label shown in the email] */

export const FIELDS: [string, string][] = [
	['wilaya', 'Wilaya'],

	['session', 'Session'],

	['atelier', 'Atelier choisi'],

	['nom', 'Nom et prénom'],

	['age', 'Âge'],

	['sexe', 'Sexe'],

	['telephone', 'Téléphone'],

	['email', 'Email'],

	['commune', 'Commune de résidence'],

	['profil', 'Profil / catégorie'],

	['domaine', "Domaine d'activité"],

	['nature', "Nature de l'activité"],

	['entreprise', 'Entreprise / coopérative (dénomination)'],

	['responsable', 'Nom et prénom du responsable'],

	['fonction', 'Fonction']
];

const LABELS: Record<string, string> = Object.fromEntries(FIELDS);

const SECTIONS: { title: string; keys: string[] }[] = [
	{ title: 'Inscription', keys: ['wilaya', 'session', 'atelier'] },

	{
		title: 'Candidat',

		keys: ['nom', 'age', 'sexe', 'telephone', 'email', 'commune']
	},

	{
		title: 'Activité',

		keys: ['profil', 'domaine', 'nature', 'entreprise', 'responsable', 'fonction']
	}
];

const esc = (s: string) =>
	s

		.replace(/&/g, '&amp;')

		.replace(/</g, '&lt;')

		.replace(/>/g, '&gt;')

		.replace(/"/g, '&quot;');

/* ------------------------------------------------------------------ */

/* HTML + text email                                                   */

/* ------------------------------------------------------------------ */

function renderValue(key: string, value: string): string {
	const safe = esc(value);

	if (key === 'email')
		return `<a href="mailto:${safe}" style="color:#1f497d;text-decoration:none">${safe}</a>`;

	if (key === 'telephone')
		return `<a href="tel:${safe.replace(/\s+/g, '')}" style="color:#1f497d;text-decoration:none">${safe}</a>`;

	return safe;
}

function renderHtml(v: Record<string, string>, date: string): string {
	const font = "-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

	const sections = SECTIONS.map(({ title, keys }) => {
		const rows = keys

			.map((k, i) => {
				const border = i ? 'border-top:1px solid #e6edf1;' : '';

				return `

<tr>

  <td style="padding:9px 14px;width:38%;font-size:13px;color:#5b6b75;vertical-align:top;${border}">${esc(LABELS[k])}</td>

  <td style="padding:9px 14px;font-size:14px;color:#1a1a1a;font-weight:500;vertical-align:top;${border}">${renderValue(k, v[k])}</td>

</tr>`;
			})

			.join('');

		return `

<tr><td style="padding:20px 24px 0">

  <div style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#1f497d;margin-bottom:8px">${esc(title)}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #d5e1e8;border-radius:6px;border-collapse:separate;background:#ffffff">${rows}</table>

</td></tr>`;
	}).join('');

	return `<!doctype html>

<html lang="fr"><body style="margin:0;padding:0;background:#eef3f6;font-family:${font}">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef3f6;padding:24px 12px">

<tr><td align="center">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#f8fbfc;border-radius:8px;overflow:hidden;border:1px solid #d5e1e8">

  <tr><td style="background:#1f497d;padding:22px 24px">

    <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#b9d3ea">Nouvelle inscription</div>

    <div style="font-size:20px;font-weight:700;color:#ffffff;margin-top:4px">Candidature à un atelier de formation</div>

  </td></tr>

  <tr><td style="padding:20px 24px 0">

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#dbeef3;border-radius:6px">

      <tr><td style="padding:14px 16px">

        <div style="font-size:16px;font-weight:700;color:#12304f">${esc(v.nom)}</div>

        <div style="font-size:13px;color:#33536b;margin-top:3px">Atelier de ${esc(v.atelier)} · ${esc(v.session)}</div>

      </td></tr>

    </table>

  </td></tr>

  ${sections}

  <tr><td style="padding:20px 24px 24px;font-size:11px;color:#7a8a94">Reçu le ${esc(date)} · La fiche complète est jointe en PDF.</td></tr>

</table>

</td></tr>

</table>

</body></html>`;
}

function renderText(v: Record<string, string>): string {
	const body = SECTIONS.map(
		({ title, keys }) =>
			`${title.toUpperCase()}\n` + keys.map((k) => `  ${LABELS[k]} : ${v[k]}`).join('\n')
	).join('\n\n');

	return `NOUVELLE CANDIDATURE À UN ATELIER DE FORMATION\n\n${body}`;
}

/* ------------------------------------------------------------------ */

/* PDF attachment (pdf-lib: pure JS, works on Cloudflare Workers)      */

/* ------------------------------------------------------------------ */

const NAVY = rgb(0.122, 0.286, 0.49); // #1f497d

const LIGHT = rgb(0.859, 0.933, 0.953); // #dbeef3

const BORDER = rgb(0.78, 0.84, 0.88);

const MUTED = rgb(0.36, 0.42, 0.46);

const INK = rgb(0.1, 0.1, 0.1);

const WHITE = rgb(1, 1, 1);

function wrap(text: string, font: PDFFont, size: number, maxW: number) {
	const lines: string[] = [];

	let line = '';

	for (const raw of text.split(' ')) {
		let word = raw;

		// split words that are wider than the column

		while (font.widthOfTextAtSize(word, size) > maxW) {
			let i = word.length;

			while (i > 1 && font.widthOfTextAtSize(word.slice(0, i), size) > maxW) i--;

			if (line) {
				lines.push(line);

				line = '';
			}

			lines.push(word.slice(0, i));

			word = word.slice(i);
		}

		const test = line ? `${line} ${word}` : word;

		if (font.widthOfTextAtSize(test, size) <= maxW) line = test;
		else {
			lines.push(line);

			line = word;
		}
	}

	if (line) lines.push(line);

	return lines.length ? lines : [''];
}

export async function renderPdf(
	v: Record<string, string>,

	date: string
): Promise<string> {
	const pdf = await PDFDocument.create();

	const regular = await pdf.embedFont(StandardFonts.Helvetica);

	const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

	// Standard PDF fonts only cover Latin (WinAnsi) characters:

	// anything else (e.g. Arabic) is replaced by "?" instead of crashing.

	const supported = new Set(regular.getCharacterSet());

	const clean = (s: string) =>
		Array.from(s.replace(/\s+/g, ' '))

			.map((ch) => (supported.has(ch.codePointAt(0)!) ? ch : '?'))

			.join('');

	const fit = (s: string, font: PDFFont, size: number, maxW: number) => {
		if (font.widthOfTextAtSize(s, size) <= maxW) return s;

		while (s.length > 1 && font.widthOfTextAtSize(s + '…', size) > maxW) s = s.slice(0, -1);

		return s + '…';
	};

	const W = 595.28;

	const H = 841.89;

	const M = 48;

	const CW = W - 2 * M;

	const LABEL_W = 175;

	let page = pdf.addPage([W, H]);

	// Header band

	page.drawRectangle({ x: 0, y: H - 96, width: W, height: 96, color: NAVY });

	page.drawText('NOUVELLE INSCRIPTION', {
		x: M,

		y: H - 40,

		size: 9,

		font: regular,

		color: rgb(0.73, 0.83, 0.92)
	});

	page.drawText('Candidature à un atelier de formation', {
		x: M,

		y: H - 66,

		size: 20,

		font: bold,

		color: WHITE
	});

	// Summary box

	let y = H - 96 - 24;

	const boxH = 54;

	page.drawRectangle({
		x: M,

		y: y - boxH,

		width: CW,

		height: boxH,

		color: LIGHT
	});

	page.drawText(fit(clean(v.nom), bold, 14, CW - 28), {
		x: M + 14,

		y: y - 24,

		size: 14,

		font: bold,

		color: rgb(0.07, 0.19, 0.31)
	});

	page.drawText(
		fit(clean(`Atelier de ${v.atelier} · ${v.session}`), regular, 10, CW - 28),

		{
			x: M + 14,

			y: y - 42,

			size: 10,

			font: regular,

			color: rgb(0.2, 0.33, 0.42)
		}
	);

	y -= boxH + 26;

	// Sections

	for (const { title, keys } of SECTIONS) {
		if (y < 120) {
			page = pdf.addPage([W, H]);

			y = H - M;
		}

		page.drawText(title.toUpperCase(), {
			x: M,

			y,

			size: 9,

			font: bold,

			color: NAVY
		});

		y -= 10;

		for (const k of keys) {
			const labelLines = wrap(clean(LABELS[k]), regular, 9.5, LABEL_W - 20);

			const valueLines = wrap(clean(v[k]), bold, 10.5, CW - LABEL_W - 20);

			const rowH = Math.max(labelLines.length, valueLines.length) * 14 + 12;

			if (y - rowH < M + 30) {
				page = pdf.addPage([W, H]);

				y = H - M;
			}

			page.drawRectangle({
				x: M,

				y: y - rowH,

				width: LABEL_W,

				height: rowH,

				color: LIGHT,

				borderColor: BORDER,

				borderWidth: 0.6
			});

			page.drawRectangle({
				x: M + LABEL_W,

				y: y - rowH,

				width: CW - LABEL_W,

				height: rowH,

				color: WHITE,

				borderColor: BORDER,

				borderWidth: 0.6
			});

			labelLines.forEach((l, i) =>
				page.drawText(l, {
					x: M + 10,

					y: y - 18 - i * 14,

					size: 9.5,

					font: regular,

					color: MUTED
				})
			);

			valueLines.forEach((l, i) =>
				page.drawText(l, {
					x: M + LABEL_W + 10,

					y: y - 18 - i * 14,

					size: 10.5,

					font: bold,

					color: INK
				})
			);

			y -= rowH;
		}

		y -= 22;
	}

	if (y < M + 20) {
		page = pdf.addPage([W, H]);

		y = H - M;
	}

	page.drawText(clean(`Reçu le ${date}`), {
		x: M,

		y,

		size: 8.5,

		font: regular,

		color: MUTED
	});

	return await pdf.saveAsBase64();
}

/* ------------------------------------------------------------------ */

/* Sending                                                             */

/* ------------------------------------------------------------------ */

const slug = (s: string) =>
	s

		.normalize('NFD')

		.replace(/[\u0300-\u036f]/g, '')

		.toLowerCase()

		.replace(/[^a-z0-9]+/g, '-')

		.replace(/^-+|-+$/g, '') || 'candidat';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type MailConfig = {
	BREVO_API_KEY: string;
	MAIL_FROM: string;
	MAIL_TO: string;
};

export async function sendFiche(v: Record<string, string>, config: MailConfig) {
	const { BREVO_API_KEY, MAIL_FROM, MAIL_TO } = config;

	if (!BREVO_API_KEY || !MAIL_FROM || !MAIL_TO) {
		throw new Error('Missing email configuration');
	}

	const date = new Date().toLocaleString('fr-DZ', {
		dateStyle: 'full',

		timeStyle: 'short',

		timeZone: 'Africa/Algiers'
	});

	// If the PDF fails for any reason, still send the email without it.

	let attachment: { name: string; content: string }[] | undefined;

	try {
		attachment = [{ name: `fiche-${slug(v.nom)}.pdf`, content: await renderPdf(v, date) }];
	} catch (e) {
		console.error('PDF generation failed', e);
	}

	const response = await fetch('https://api.brevo.com/v3/smtp/email', {
		method: 'POST',

		headers: {
			accept: 'application/json',

			'api-key': BREVO_API_KEY,

			'content-type': 'application/json'
		},

		body: JSON.stringify({
			sender: {
				name: 'Chambre Algérienne de la Pêche et de l’Aquaculture',

				email: MAIL_FROM
			},

			to: [{ email: MAIL_TO }],

			...(typeof v.email === 'string' && EMAIL_RE.test(v.email)
				? { replyTo: { email: v.email, name: v.nom } }
				: {}),

			subject: `Nouvelle candidature – ${v.nom} · Atelier de ${v.atelier}`,

			htmlContent: renderHtml(v, date),

			textContent: renderText(v),

			...(attachment ? { attachment } : {})
		})
	});

	if (!response.ok) {
		const error = await response.text();

		throw new Error(`Brevo API error (${response.status}): ${error}`);
	}
}
