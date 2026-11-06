<script lang="ts">
	import '@fontsource-variable/inter';
	import { enhance } from '$app/forms';

	let { form } = $props();

	const ATELIERS = ['Tipaza', 'Boumerdès'];

	const DOMAINES = [
		'Startups',
		'Entreprise artisanale',
		'Entreprise',
		'Porteur de projet',
		'Stagiaire ou étudiant'
	];

	const PROFILS = [
		'Étudiants',
		'Jeunes diplômés',
		'Jeunes porteurs de projets',
		'Femmes porteuses de projets',
		'Femmes entrepreneures',
		'Microentreprises',
		'Autre'
	];

	const FONCTIONS = [
		'Gérant',
		'Président de coopérative',
		'Responsable de production',
		'Jeunes diplômés',
		'Jeunes porteurs de projets',
		'Femmes porteuses de projets',
		'Autre'
	];

	let sending = $state(false);
	const blank = () => ({
		chambre: '', wilaya: '', session: '', atelier: '', nom: '', age: '', sexe: '',
		telephone: '', email: '', commune: '', profil: '', domaine: '', nature: '',
		entreprise: '', responsable: '', fonction: ''
	});
	let f = $state(blank());
</script>

<main>
	<header>
		<h1>Chambre algérienne de la pêche et de l’aquaculture</h1>
		<p class="project">
			Projet de coopération entre la Chambre algérienne de la pêche et de l’aquaculture et la FAO
			intitulé « Autonomisation économique des femmes et des jeunes dans les chaînes de valeur de la
			pêche en Algérie ».
		</p>
		<h2>Fiche de recensement des candidats aux actions de formation</h2>
	</header>

	<form
		method="POST"
		use:enhance={() => {
			sending = true;
			return async ({ result, update }) => {
				await update({ reset: result.type === 'success' });
				sending = false;
			};
		}}
	>
		{#if form?.success}
			<p class="notice ok" role="status">La fiche a été envoyée.</p>
		{:else}
			<div class="grid">
				<div class="field">
					<label for="chambre">Chambre</label>
					<input id="chambre" name="chambre" bind:value={f.chambre} required />
				</div>

				<div class="field">
					<label for="wilaya">Wilaya</label>
					<input id="wilaya" name="wilaya" bind:value={f.wilaya} required />
				</div>

				<div class="field">
					<label for="session">Session</label>
					<input id="session" name="session" bind:value={f.session} required />
				</div>

				<div class="field">
					<label for="atelier">Atelier qui vous intéresse</label>
					<select id="atelier" name="atelier" bind:value={f.atelier} required>
						<option value="">Choisir…</option>
						{#each ATELIERS as a}<option>{a}</option>{/each}
					</select>
				</div>

				<div class="field wide">
					<label for="nom">Nom et prénom</label>
					<input id="nom" name="nom" bind:value={f.nom} autocomplete="name" required />
				</div>

				<div class="field">
					<label for="age">Âge</label>
					<input id="age" name="age" type="number" min="1" max="99" bind:value={f.age} required />
				</div>

				<div class="field">
					<label for="sexe">Sexe</label>
					<select id="sexe" name="sexe" bind:value={f.sexe} required>
						<option value="">Choisir…</option>
						<option>Homme</option>
						<option>Femme</option>
					</select>
				</div>

				<div class="field">
					<label for="telephone">Téléphone</label>
					<input id="telephone" name="telephone" type="tel" bind:value={f.telephone} autocomplete="tel" required />
				</div>

				<div class="field">
					<label for="email">Email</label>
					<input id="email" name="email" type="email" bind:value={f.email} autocomplete="email" required />
				</div>

				<div class="field">
					<label for="commune">Commune de résidence</label>
					<input id="commune" name="commune" bind:value={f.commune} required />
				</div>

				<div class="field">
					<label for="profil">Profil / catégorie</label>
					<select id="profil" name="profil" bind:value={f.profil} required>
						<option value="">Choisir…</option>
						{#each PROFILS as p}<option>{p}</option>{/each}
					</select>
				</div>

				<div class="field">
					<label for="domaine">Domaine d’activité</label>
					<select id="domaine" name="domaine" bind:value={f.domaine} required>
						<option value="">Choisir…</option>
						{#each DOMAINES as d}<option>{d}</option>{/each}
					</select>
				</div>

				<div class="field">
					<label for="nature">Nature de l’activité</label>
					<input
						id="nature"
						name="nature"
						bind:value={f.nature}
						placeholder="Ex. : valorisation de déchets de poisson, transformation…"
						required
					/>
				</div>

				<div class="field wide">
					<label for="entreprise">Entreprise / coopérative (dénomination)</label>
					<input id="entreprise" name="entreprise" bind:value={f.entreprise} required />
				</div>

				<div class="field">
					<label for="responsable">Nom et prénom du responsable</label>
					<input id="responsable" name="responsable" bind:value={f.responsable} required />
				</div>

				<div class="field">
					<label for="fonction">Fonction</label>
					<select id="fonction" name="fonction" bind:value={f.fonction} required>
						<option value="">Choisir…</option>
						{#each FONCTIONS as fn}<option>{fn}</option>{/each}
					</select>
				</div>
			</div>

			<button type="submit" disabled={sending}>{sending ? 'Envoi…' : 'Envoyer'}</button>

			{#if form?.error}
				<p class="notice err" role="alert">{form.error}</p>
			{/if}

			<p class="foot">
				Profils concernés : Jeune | Femme rurale | Porteur(se) de projet | MPME | Coopérative de
				pêche et d’aquaculture | Autre
			</p>
		{/if}
	</form>
</main>

<style>
	/* Colors: soft off-white background, dark-grey (not pure black) text,
	   and an automatic dark theme that follows the device setting. */
	:global(:root) {
		color-scheme: light dark;
		--bg: #f3f5f7;
		--card: #ffffff;
		--ink: #1f2933;
		--muted: #52606d;
		--line: #c5d0d9;
		--field: #ffffff;
		--accent: #1f497d;
		--accent-ink: #ffffff;
		--ring: rgba(31, 73, 125, 0.28);
		--ok-bg: #e6f4ea;
		--ok-line: #2e7d32;
		--err-bg: #fdecea;
		--err-line: #b3261e;
		--err-ink: #8a1c16;
	}

	@media (prefers-color-scheme: dark) {
		:global(:root) {
			--bg: #12181d;
			--card: #1a2229;
			--ink: #e6edf2;
			--muted: #a9b8c4;
			--line: #3a4955;
			--field: #121a20;
			--accent: #8fbbe8;
			--accent-ink: #0d1a26;
			--ring: rgba(143, 187, 232, 0.35);
			--ok-bg: #16301c;
			--ok-line: #4caf50;
			--err-bg: #3a1a18;
			--err-line: #ef6a62;
			--err-ink: #ffb4ae;
		}
	}

	:global(body) {
		margin: 0;
		background: var(--bg);
		color: var(--ink);
		font-family: 'Inter Variable', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
		font-size: 16px;
		line-height: 1.55;
		-webkit-font-smoothing: antialiased;
	}

	main {
		max-width: 48rem;
		margin: 0 auto;
		padding: 2rem 1rem 3.5rem;
	}

	header {
		text-align: center;
		margin-bottom: 1.5rem;
	}
	h1 {
		color: var(--accent);
		font-size: 1.4rem;
		font-weight: 700;
		line-height: 1.3;
		letter-spacing: -0.01em;
		margin: 0 0 0.75rem;
	}
	.project {
		margin: 0;
		color: var(--muted);
		font-size: 0.95rem;
	}
	h2 {
		font-size: 1.05rem;
		font-weight: 600;
		margin: 1.25rem 0 0;
	}

	form {
		background: var(--card);
		border: 1px solid var(--line);
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.04);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem 1.1rem;
		margin-bottom: 1.5rem;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}
	.wide {
		grid-column: 1 / -1;
	}

	label {
		font-size: 0.875rem;
		font-weight: 600;
	}

	input,
	select {
		font: inherit;
		color: var(--ink);
		background: var(--field);
		min-width: 0;
		min-height: 2.75rem;
		box-sizing: border-box;
		padding: 0.6rem 0.75rem;
		border: 1px solid var(--line);
		border-radius: 8px;
		transition: border-color 0.15s, box-shadow 0.15s;
	}
	input::placeholder {
		color: var(--muted);
		opacity: 0.75;
	}
	input:hover,
	select:hover {
		border-color: var(--muted);
	}
	input:focus-visible,
	select:focus-visible {
		outline: none;
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--ring);
	}
	input:user-invalid,
	select:user-invalid {
		border-color: var(--err-line);
	}

	button {
		font: inherit;
		font-weight: 600;
		width: 100%;
		min-height: 3rem;
		cursor: pointer;
		padding: 0.7rem 1.2rem;
		border: 0;
		border-radius: 8px;
		background: var(--accent);
		color: var(--accent-ink);
		transition: filter 0.15s, box-shadow 0.15s;
	}
	button:hover:not(:disabled) {
		filter: brightness(1.08);
	}
	button:focus-visible {
		outline: none;
		box-shadow: 0 0 0 3px var(--ring);
	}
	button:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}

	.foot {
		font-size: 0.8rem;
		color: var(--muted);
		margin: 1.25rem 0 0;
	}

	.notice {
		padding: 0.75rem 1rem;
		border-radius: 8px;
		margin: 1rem 0 0;
	}
	.ok {
		margin: 0;
		padding: 1.25rem 1rem;
		text-align: center;
		font-weight: 600;
		background: var(--ok-bg);
		border: 1px solid var(--ok-line);
	}
	.err {
		background: var(--err-bg);
		border: 1px solid var(--err-line);
		color: var(--err-ink);
	}

	@media (max-width: 34rem) {
		main {
			padding-top: 1.25rem;
		}
		form {
			padding: 1.1rem;
		}
		.grid {
			grid-template-columns: 1fr;
		}
	}
</style>