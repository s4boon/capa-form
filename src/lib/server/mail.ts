import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';

/** [form field name, label shown in the email / PDF] */
export const FIELDS: [string, string][] = [
	['wilaya', 'Wilaya'],
	['session', 'Session'],
	['nom', 'Nom et prénom'],
	['age', 'Âge'],
	['sexe', 'Sexe'],
	['telephone', 'Téléphone'],
	['email', 'Adresse e-mail'],
	['commune', 'Commune de résidence'],
	['profil', 'Profil / catégorie'],
	['domaine', "Domaine d'activité"],
	['nature', "Nature de l'activité / du projet"],
	['entreprise', 'Entreprise'],
	['responsable', 'Responsable'],
	['fonction', 'Fonction']
];

const LABELS: Record<string, string> = Object.fromEntries(FIELDS);

// Same sections and wording as the form.
const SECTIONS: { title: string; subtitle: string; keys: string[] }[] = [
	{
		title: 'Informations relatives à la formation',
		subtitle: 'Précisez les informations concernant votre participation.',
		keys: ['wilaya', 'session']
	},
	{
		title: 'Informations personnelles',
		subtitle: 'Vos coordonnées et informations personnelles.',
		keys: ['nom', 'age', 'sexe', 'telephone', 'email', 'commune']
	},
	{
		title: 'Informations professionnelles',
		subtitle: 'Précisez votre profil et votre activité.',
		keys: ['profil', 'domaine', 'nature', 'entreprise', 'responsable', 'fonction']
	}
];

const esc = (s: unknown) =>
	String(s ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');

/* ------------------------------------------------------------------ */
/* HTML + text email (same look as the form: slate on soft off-white)  */
/* ------------------------------------------------------------------ */

function renderValue(key: string, value: string): string {
	const safe = esc(value);
	if (key === 'email')
		return `<a href="mailto:${safe}" style="color:#0f172a;text-decoration:underline">${safe}</a>`;
	if (key === 'telephone')
		return `<a href="tel:${safe.replace(/\s+/g, '')}" style="color:#0f172a;text-decoration:underline">${safe}</a>`;
	return safe;
}

function renderHtml(v: Record<string, string>, date: string): string {
	const font = "'Source Sans 3','Segoe UI',-apple-system,Roboto,Helvetica,Arial,sans-serif";

	const sections = SECTIONS.map(({ title, subtitle, keys }) => {
		const rows = keys
			.map((k, i) => {
				const border = i ? 'border-top:1px solid #eef2f6;' : '';
				return `
<tr>
  <td style="padding:10px 0;width:36%;font-size:14px;line-height:1.4;font-weight:600;color:#475569;vertical-align:top;${border}">${esc(LABELS[k])}</td>
  <td style="padding:10px 0;font-size:15px;line-height:1.4;color:#0f172a;vertical-align:top;${border}">${renderValue(k, v[k] ?? '')}</td>
</tr>`;
			})
			.join('');
		return `
<tr><td style="padding:16px 0 0">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;border-collapse:separate">
    <tr><td style="padding:20px 22px">
      <div style="font-size:16px;font-weight:700;color:#0f172a">${esc(title)}</div>
      <div style="font-size:14px;color:#64748b;margin:4px 0 10px">${esc(subtitle)}</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
    </td></tr>
  </table>
</td></tr>`;
	}).join('');

	return `<!doctype html>
<html lang="fr"><body style="margin:0;padding:0;background:#f7f8f6;font-family:${font};color:#1e293b">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f8f6;padding:28px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">
  <tr><td style="text-align:center;padding:0 0 4px">
    <div style="font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#64748b">Nouvelle inscription</div>
    <div style="font-size:26px;font-weight:700;letter-spacing:-.01em;color:#334155;margin-top:6px">Fiche d’inscription</div>
    <div style="font-size:16px;font-weight:600;color:#0f172a;margin-top:12px">${esc(v.nom)}</div>
    <div style="font-size:14px;color:#64748b;margin-top:2px">${esc(v.session)}</div>
  </td></tr>
  ${sections}
  <tr><td style="padding:20px 0 0;text-align:center;font-size:12px;line-height:1.5;color:#64748b">
    Reçu le ${esc(date)}<br>La fiche complète est jointe en PDF.
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

function renderText(v: Record<string, string>): string {
	const body = SECTIONS.map(
		({ title, keys }) =>
			`${title.toUpperCase()}\n` + keys.map((k) => `  ${LABELS[k]} : ${v[k] ?? ''}`).join('\n')
	).join('\n\n');
	return `NOUVELLE INSCRIPTION – FICHE D’INSCRIPTION\n\n${body}`;
}

/* ------------------------------------------------------------------ */
/* PDF attachment (pdf-lib: pure JS, works on Cloudflare Workers)      */
/* ------------------------------------------------------------------ */

const BG = rgb(0.969, 0.973, 0.965); // #f7f8f6
const WHITE = rgb(1, 1, 1);
const CARD_BORDER = rgb(0.886, 0.91, 0.941); // #e2e8f0
const DIVIDER = rgb(0.933, 0.949, 0.965); // #eef2f6
const SLATE_900 = rgb(0.059, 0.09, 0.165); // #0f172a
const SLATE_700 = rgb(0.2, 0.255, 0.333); // #334155
const SLATE_600 = rgb(0.278, 0.333, 0.412); // #475569
const SLATE_500 = rgb(0.392, 0.455, 0.545); // #64748b

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

/** SVG path of a rounded rectangle with its top-left corner at (0, 0), y pointing down. */
const roundedRect = (w: number, h: number, r: number) =>
	`M ${r} 0 H ${w - r} Q ${w} 0 ${w} ${r} V ${h - r} Q ${w} ${h} ${w - r} ${h} H ${r} Q 0 ${h} 0 ${h - r} V ${r} Q 0 0 ${r} 0 Z`;

export async function renderPdf(v: Record<string, string>, date: string): Promise<string> {
	const pdf = await PDFDocument.create();
	const regular = await pdf.embedFont(StandardFonts.Helvetica);
	const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

	// Standard PDF fonts only cover Latin (WinAnsi) characters:
	// anything else (e.g. Arabic) is replaced by "?" instead of crashing.
	const supported = new Set(regular.getCharacterSet());
	const clean = (s: unknown) =>
		Array.from(String(s ?? '').replace(/\s+/g, ' '))
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
	const PAD = 20;
	const LABEL_W = 160;
	const LH = 13.5;
	const ROW_PAD = 6.5;
	const HEADER_H = 52;

	const newPage = (): PDFPage => {
		const p = pdf.addPage([W, H]);
		p.drawRectangle({ x: 0, y: 0, width: W, height: H, color: BG });
		return p;
	};

	const centered = (
		p: PDFPage,
		text: string,
		y: number,
		size: number,
		font: PDFFont,
		color: ReturnType<typeof rgb>
	) => {
		const t = fit(text, font, size, CW);
		p.drawText(t, { x: (W - font.widthOfTextAtSize(t, size)) / 2, y, size, font, color });
	};

	let page = newPage();

	// Title block
	centered(page, 'NOUVELLE INSCRIPTION', H - 58, 8.5, bold, SLATE_500);
	centered(page, 'Fiche d’inscription', H - 88, 24, bold, SLATE_700);
	centered(page, clean(v.nom), H - 114, 13, bold, SLATE_900);
	centered(page, clean(v.session), H - 130, 10.5, regular, SLATE_500);

	let y = H - 130 - 24;

	for (const { title, subtitle, keys } of SECTIONS) {
		// Measure the card first so it never splits across pages.
		const rows = keys.map((k) => {
			const labelLines = wrap(clean(LABELS[k]), bold, 9.5, LABEL_W - 12);
			const valueLines = wrap(clean(v[k]), regular, 10.5, CW - 2 * PAD - LABEL_W);
			const h = Math.max(labelLines.length, valueLines.length) * LH + ROW_PAD * 2;
			return { labelLines, valueLines, h };
		});
		const cardH = HEADER_H + rows.reduce((s, r) => s + r.h, 0) + 8;

		if (y - cardH < 56) {
			page = newPage();
			y = H - M;
		}

		// Card
		page.drawSvgPath(roundedRect(CW, cardH, 8), {
			x: M,
			y,
			color: WHITE,
			borderColor: CARD_BORDER,
			borderWidth: 0.8
		});
		page.drawText(clean(title), {
			x: M + PAD,
			y: y - PAD - 8,
			size: 12.5,
			font: bold,
			color: SLATE_900
		});
		page.drawText(clean(subtitle), {
			x: M + PAD,
			y: y - PAD - 24,
			size: 9.5,
			font: regular,
			color: SLATE_500
		});

		// Rows
		let ry = y - HEADER_H;
		rows.forEach((r, i) => {
			if (i > 0) {
				page.drawLine({
					start: { x: M + PAD, y: ry },
					end: { x: M + CW - PAD, y: ry },
					thickness: 0.7,
					color: DIVIDER
				});
			}
			r.labelLines.forEach((l, j) =>
				page.drawText(l, {
					x: M + PAD,
					y: ry - ROW_PAD - 9 - j * LH,
					size: 9.5,
					font: bold,
					color: SLATE_600
				})
			);
			r.valueLines.forEach((l, j) =>
				page.drawText(l, {
					x: M + PAD + LABEL_W,
					y: ry - ROW_PAD - 9 - j * LH,
					size: 10.5,
					font: regular,
					color: SLATE_900
				})
			);
			ry -= r.h;
		});

		y -= cardH + 12;
	}

	centered(page, clean(`Reçu le ${date}`), 34, 8.5, regular, SLATE_500);

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

	const date = new Date().toLocaleString('fr-FR', {
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
			...(EMAIL_RE.test(v.email ?? '') ? { replyTo: { email: v.email, name: v.nom } } : {}),
			subject: `Nouvelle inscription – ${v.nom} · ${v.session}`,
			htmlContent: renderHtml(v, date),
			textContent: renderText(v),
			...(attachment ? { attachment } : {})
		}),
		signal: AbortSignal.timeout(15_000)
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Brevo API error (${response.status}): ${error}`);
	}
}
