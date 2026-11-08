<script lang="ts">
	import '@fontsource-variable/source-sans-3';
	import { enhance } from '$app/forms';

	let { form } = $props();

	const blank = () => ({
		chambre: '',
		wilaya: '',
		session: '',
		nom: '',
		age: '',
		sexe: '',
		telephone: '',
		email: '',
		commune: '',
		profil: '',
		profilAutre: '',
		domaine: '',
		nature: '',
		entreprise: '',
		responsable: '',
		fonction: '',
		fonctionAutre: ''
	});

	let f = $state(blank());
	let sending = $state(false);

	// What actually gets submitted: "Autre : <précision>" when "Autre" is selected.
	const profilValue = $derived(f.profil === 'Autre' ? `Autre : ${f.profilAutre.trim()}` : f.profil);
	const fonctionValue = $derived(
		f.fonction === 'Autre' ? `Autre : ${f.fonctionAutre.trim()}` : f.fonction
	);

	const ATELIERS = ['Tipaza - 02 Décembre 2026', 'Boumerdès - 07, 08 Décembre 2026'];

	// const DOMAINES = [
	// 	'Startups',
	// 	'Entreprise artisanale',
	// 	'Entreprise',
	// 	'Porteur de projet',
	// 	'Stagiaire ou étudiant'
	// ];

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

	const inputClass =
		'mt-1.5 block w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/15';

	const labelClass = 'block text-sm font-semibold text-slate-700';

	const sectionClass = 'rounded-lg border border-slate-200 bg-white p-5 sm:p-6';

	const required = '<span class="text-red-600">*</span>';
</script>

<svelte:head>
	<title>Fiche d'inscription | CAPA</title>
	<meta
		name="description"
		content="Fiche d'inscription de la Chambre algérienne de la pêche et de l’aquaculture."
	/>
	<meta name="color-scheme" content="light" />
</svelte:head>

<main
	class="min-h-screen bg-[#f7f8f6] px-4 py-8 text-slate-800 antialiased sm:py-12"
	style="font-family: 'Source Sans 3 Variable', sans-serif; color-scheme: light;"
>
	<div class="mx-auto max-w-3xl">
		<!-- Header -->
		<header class="mb-8 text-center">
			<!-- <div class="mx-auto mb-5 flex items-center justify-center gap-3">
				<a
					href="https://capaalgerie.dz"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="Site officiel de la CAPA"
					class="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-sm"
				>
					<img src="/logo.svg" alt="Logo de la CAPA" class="h-full w-full object-contain" />
				</a>

				<div
					class="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-sm"
				>
					<img
						src="/flag.webp"
						alt="Drapeau de l’Algérie"
						class="h-full w-full rounded-lg border border-slate-400/20 object-cover"
					/>
				</div>
			</div> -->

			<!-- <p class="mb-2 text-xs font-semibold tracking-[0.18em] text-[#173B5E] uppercase">
				Chambre algérienne de la pêche et de l’aquaculture
			</p>

			<div class="mx-auto mb-3 h-0.5 w-10 rounded-full bg-[#173B5E]"></div> -->

			<h1 class="text-2xl font-bold tracking-tight text-slate-700 sm:text-3xl">
				Fiche d'inscription
			</h1>

			<p class="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
				Projet de coopération entre l’organisation des nations unies pour l’Alimentation et
				l’Agriculture (FAO) et la Direction Générale de la Pêche et de l’Aquaculture (DGPA)
			</p>
		</header>

		<!-- Form -->
		<form
			method="POST"
			use:enhance={() => {
				sending = true;

				return async ({ result, update }) => {
					try {
						await update({ reset: result.type === 'success' });

						if (result.type === 'success') {
							f = blank();
						}
					} finally {
						sending = false;
					}
				};
			}}
			class="space-y-5"
		>
			<!-- Submitted values for the two selects that have an "Autre" option -->
			<input type="hidden" name="profil" value={profilValue} />
			<input type="hidden" name="fonction" value={fonctionValue} />

			<!-- Introduction -->
			<div class="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
				<p class="text-sm leading-6 text-slate-600">
					Veuillez renseigner les informations ci-dessous afin de compléter votre inscription. Les
					champs marqués d'un astérisque sont obligatoires.
				</p>
				<p class="mt-3 text-xs font-medium text-red-600">* Champs obligatoires</p>
			</div>

			<!-- Event information -->
			<section class={sectionClass}>
				<div class="mb-5">
					<h2 class="text-base font-bold text-slate-900">Informations relatives à la formation</h2>
					<p class="mt-1 text-sm text-slate-500">
						Précisez les informations concernant votre participation.
					</p>
				</div>

				<div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
					<!-- <div>
						<label for="chambre" class={labelClass}>
							Chambre <span class="text-red-600">*</span>
						</label>
						<input
							id="chambre"
							name="chambre"
							bind:value={f.chambre}
							required
							class={inputClass}
							placeholder="Votre chambre"
						/>
					</div> -->

					<div>
						<label for="wilaya" class={labelClass}>
							Wilaya <span class="text-red-600">*</span>
						</label>
						<input
							id="wilaya"
							name="wilaya"
							bind:value={f.wilaya}
							required
							class={inputClass}
							placeholder="Votre wilaya"
						/>
					</div>

					<div>
						<label for="session" class={labelClass}>
							Session <span class="text-red-600">*</span>
						</label>
						<select id="session" name="session" bind:value={f.session} required class={inputClass}>
							<option value="" disabled>Choisir une session</option>
							{#each ATELIERS as atelier}
								<option value={atelier}>{atelier}</option>
							{/each}
						</select>
					</div>
				</div>
			</section>

			<!-- Personal information -->
			<section class={sectionClass}>
				<div class="mb-5">
					<h2 class="text-base font-bold text-slate-900">Informations personnelles</h2>
					<p class="mt-1 text-sm text-slate-500">Vos coordonnées et informations personnelles.</p>
				</div>

				<div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
					<div class="sm:col-span-2">
						<label for="nom" class={labelClass}>
							Nom et prénom <span class="text-red-600">*</span>
						</label>
						<input
							id="nom"
							name="nom"
							bind:value={f.nom}
							required
							class={inputClass}
							placeholder="Votre nom complet"
							autocomplete="name"
						/>
					</div>

					<div>
						<label for="age" class={labelClass}>
							Âge <span class="text-red-600">*</span>
						</label>
						<input
							id="age"
							name="age"
							type="number"
							min="1"
							bind:value={f.age}
							required
							class={inputClass}
							placeholder="Votre âge"
						/>
					</div>

					<div>
						<label for="sexe" class={labelClass}>
							Sexe <span class="text-red-600">*</span>
						</label>
						<select id="sexe" name="sexe" bind:value={f.sexe} required class={inputClass}>
							<option value="" disabled>Sélectionner</option>
							<option value="Homme">Homme</option>
							<option value="Femme">Femme</option>
						</select>
					</div>

					<div>
						<label for="telephone" class={labelClass}>
							Téléphone <span class="text-red-600">*</span>
						</label>
						<input
							id="telephone"
							name="telephone"
							type="tel"
							bind:value={f.telephone}
							required
							class={inputClass}
							placeholder="Numéro de téléphone"
							autocomplete="tel"
						/>
					</div>

					<div>
						<label for="email" class={labelClass}>
							Adresse e-mail <span class="text-red-600">*</span>
						</label>
						<input
							id="email"
							name="email"
							type="email"
							bind:value={f.email}
							required
							class={inputClass}
							placeholder="exemple@email.com"
							autocomplete="email"
						/>
					</div>

					<div class="sm:col-span-2">
						<label for="commune" class={labelClass}>
							Commune de résidence <span class="text-red-600">*</span>
						</label>
						<input
							id="commune"
							name="commune"
							bind:value={f.commune}
							required
							class={inputClass}
							placeholder="Votre commune"
						/>
					</div>
				</div>
			</section>

			<!-- Professional information -->
			<section class={sectionClass}>
				<div class="mb-5">
					<h2 class="text-base font-bold text-slate-900">Informations professionnelles</h2>
					<p class="mt-1 text-sm text-slate-500">Précisez votre profil et votre activité.</p>
				</div>

				<div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
					<div>
						<label for="profil" class={labelClass}>
							Profil / catégorie <span class="text-red-600">*</span>
						</label>
						<!-- No name: the value is submitted through the hidden "profil" input above -->
						<select id="profil" bind:value={f.profil} required class={inputClass}>
							<option value="" disabled>Sélectionner votre profil</option>
							{#each PROFILS as profil}
								<option value={profil}>{profil}</option>
							{/each}
						</select>
					</div>

					<div>
						<label for="domaine" class={labelClass}>
							Domaine <span class="text-red-600">*</span>
						</label>
						<input
							id="domaine"
							type="text"
							placeholder="Précisez votre domaine d'activité"
							name="domaine"
							bind:value={f.domaine}
							required
							class={inputClass}
						/>
					</div>

					{#if f.profil === 'Autre'}
						<div class="sm:col-span-2">
							<label for="profilAutre" class={labelClass}>
								Précisez votre profil <span class="text-red-600">*</span>
							</label>
							<input
								id="profilAutre"
								type="text"
								bind:value={f.profilAutre}
								required
								maxlength="100"
								class={inputClass}
								placeholder="Votre profil / catégorie"
							/>
						</div>
					{/if}

					<div class="sm:col-span-2">
						<label for="nature" class={labelClass}>
							Nature de l'activité / du projet
							<span class="text-red-600">*</span>
						</label>
						<input
							id="nature"
							name="nature"
							bind:value={f.nature}
							required
							class={inputClass}
							placeholder="Précisez la nature de votre activité ou projet"
						/>
					</div>

					<div>
						<label for="entreprise" class={labelClass}>
							Entreprise <span class="text-red-600">*</span>
						</label>
						<input
							id="entreprise"
							name="entreprise"
							bind:value={f.entreprise}
							required
							class={inputClass}
							placeholder="Nom de l'entreprise"
						/>
					</div>

					<div>
						<label for="responsable" class={labelClass}>
							Responsable <span class="text-red-600">*</span>
						</label>
						<input
							id="responsable"
							name="responsable"
							bind:value={f.responsable}
							required
							class={inputClass}
							placeholder="Nom du responsable"
						/>
					</div>

					<div class="sm:col-span-2">
						<label for="fonction" class={labelClass}>
							Fonction <span class="text-red-600">*</span>
						</label>
						<!-- No name: the value is submitted through the hidden "fonction" input above -->
						<select id="fonction" bind:value={f.fonction} required class={inputClass}>
							<option value="" disabled>Sélectionner votre fonction</option>
							{#each FONCTIONS as fonction}
								<option value={fonction}>{fonction}</option>
							{/each}
						</select>
					</div>

					{#if f.fonction === 'Autre'}
						<div class="sm:col-span-2">
							<label for="fonctionAutre" class={labelClass}>
								Précisez votre fonction <span class="text-red-600">*</span>
							</label>
							<input
								id="fonctionAutre"
								type="text"
								bind:value={f.fonctionAutre}
								required
								maxlength="100"
								class={inputClass}
								placeholder="Votre fonction"
							/>
						</div>
					{/if}
				</div>
			</section>

			<!-- Feedback -->
			{#if form?.error}
				<div
					role="alert"
					class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
				>
					{form.error}
				</div>
			{/if}

			{#if form?.success}
				<div
					role="status"
					class="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
				>
					La fiche a été envoyée avec succès.
				</div>
			{/if}

			<!-- Submit -->
			<div class="pt-1">
				<button
					type="submit"
					disabled={sending}
					class="flex w-full items-center justify-center rounded-md bg-slate-800 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
				>
					{#if sending}
						Envoi en cours...
					{:else}
						Envoyer la fiche
					{/if}
				</button>

				<!-- Both fine-print lines stay centered; the logo sits at the right edge,
				     vertically centered across the two lines. Equal side padding on the text
				     keeps it centered and clear of the logo. -->
				<div class="relative mt-3">
					<div class="space-y-3 px-16 text-center text-xs text-slate-500">
						<p>Veuillez vérifier vos informations avant de soumettre le formulaire.</p>
						<p>
							Profils concernés : Jeune | Femme rurale | Porteur(se) de projet | MPME | Coopérative
							de pêche et d’aquaculture | Autre
						</p>
					</div>
					<a
						href="https://capaalgerie.dz"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Site officiel de la CAPA"
						class="absolute top-1/2 right-0 -translate-y-1/2"
					>
						<img src="/logo.svg" alt="Logo de la CAPA" class="h-14 w-14 object-contain" />
					</a>
				</div>
			</div>
		</form>
	</div>
</main>
