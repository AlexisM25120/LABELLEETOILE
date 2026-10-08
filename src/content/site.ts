// =============================================================================
// TOUS LES TEXTES DU SITE — Carrosserie La Belle Étoile
// Corriger ici, jamais dans les composants. Les espaces insécables de la
// typographie française (avant ? ! : ; et dans « ») sont ajoutées
// automatiquement à l'affichage : tapez des espaces normales.
// Tout ce qui est marqué [À VALIDER] est listé dans A-VALIDER.md.
// =============================================================================

/** Bloc « Être rappelé » dans la section finale (mode démo, aucun envoi). */
export const SHOW_CALLBACK = false;

export const contact = {
	name: "Carrosserie La Belle Étoile",
	shortName: "La Belle Étoile",
	legalName: "SARL La Belle Étoile",
	manager: "Sébastien Cavigneaux",
	managerFirstName: "Sébastien",
	since: 2017,
	phone: "06 52 78 36 23",
	phoneHref: "tel:+33652783623",
	phoneIntl: "+33652783623",
	email: "carrosserielabelleetoile@gmail.com",
	street: "25 rue de la Gare",
	postalCode: "25140",
	city: "Charquemont",
	department: "Doubs",
	region: "Bourgogne-Franche-Comté",
	// Coordonnées de Charquemont (centre du village) [À VALIDER : position exacte de l'atelier]
	geo: { lat: 47.2142, lng: 6.8194 },
	directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=25%20rue%20de%20la%20Gare%2C%2025140%20Charquemont",
	facebookUrl: "https://www.facebook.com/p/Carrosserie-La-Belle-Etoile-Charquemont-100063802879254/",
	// [À VALIDER] remplacer par le lien de la fiche Google (bouton « Partager » de la fiche)
	googleReviewsUrl: "https://www.google.com/search?q=Carrosserie+La+Belle+Etoile+Charquemont+avis",
	rating: { value: 4.8, count: 37 },
	// [À VALIDER] horaires relevés sur Pages Jaunes
	hours: [
		{ days: "Lundi – vendredi", time: "8 h – 12 h · 14 h – 18 h" },
		{ days: "Samedi", time: "8 h – 12 h" },
		{ days: "Dimanche", time: "Fermé" },
	],
	// Pour le JSON-LD (format schema.org)
	hoursSchema: [
		{ days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "12:00" },
		{ days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "14:00", closes: "18:00" },
		{ days: ["Saturday"], opens: "08:00", closes: "12:00" },
	],
	siret: "à compléter",
};

export const meta = {
	title: "Carrosserie La Belle Étoile · Carrosserie et peinture à Charquemont (Doubs)",
	description:
		"Carrosserie-peinture à Charquemont, à 6 minutes de Maîche. Peinture et redressage haut de gamme, toutes marques, débosselage sans peinture, cabine de peinture, véhicule de courtoisie. Estimation à l'atelier : 06 52 78 36 23.",
	ogAlt: "Façade de la Carrosserie La Belle Étoile, rue de la Gare à Charquemont",
};

export const banner = {
	full: "MAQUETTE — préparée pour la Carrosserie La Belle Étoile · textes et photos à valider ensemble · non publiée",
	short: "MAQUETTE · à valider ensemble · non publiée",
};

export const nav = [
	{ href: "#realisations", label: "Réalisations" },
	{ href: "#prestations", label: "Prestations" },
	{ href: "#avis", label: "Avis" },
	{ href: "#contact", label: "Contact" },
];

export const actions = {
	call: "Appeler",
	callLong: `Appeler le ${contact.phone}`,
	directions: "Itinéraire",
	estimate: "Appeler pour une estimation",
};

export const loader = {
	skip: "Passer l'intro",
	status: "Chargement du site de la Carrosserie La Belle Étoile",
};

export const hero = {
	eyebrow: "Carrosserie · Peinture · Charquemont (25)",
	h1: ["Carrosserie & peinture", "à Charquemont"],
	sub: "Peinture et redressage haut de gamme, toutes marques, depuis 2017. À 6 minutes de Maîche.",
	scrollHint: "Faites défiler",
	motto: ["Exigence", "Qualité", "Passion"],
	sceneLabel: "La porte de l'atelier s'ouvre, la voiture sort.",
};

export const reassurance = {
	label: "En bref",
	items: [
		{ kind: "number", value: 4.8, decimals: 1, suffix: "/5", label: "37 avis Google", labelCount: 37 },
		{ kind: "number", value: 2017, prefix: "Depuis", label: "à Charquemont" },
		{ kind: "text", text: "Cabine de peinture", label: "peinture complète ou partielle" },
		{ kind: "text", text: "Toutes marques", label: "de la citadine à la Porsche" },
	],
};

export const realisations = {
	label: "Réalisations",
	title: "Ça sort de l'atelier",
	intro: "Les voitures passées entre nos mains ces derniers mois.",
	swipeHint: "Faites glisser",
	before: "Avant",
	after: "Après",
	sliderLabel: "Comparer avant et après",
	placeholder: "Photo à venir",
	// `id` = préfixe des photos Facebook (assets/photos/facebook/<id>-1.jpg…).
	// `photo` = photo de secours dans assets/photos/ (nom sans extension).
	// [À VALIDER] textes et mois des réalisations
	projects: [
		{
			id: "bmw-estoril",
			model: "BMW Série 3",
			detail: "Bleu Estoril",
			work: "Reprise d'aile et de portière, raccord teinte",
			date: "septembre 2026",
			beforeAfter: {
				before: "aile-rayee",
				after: "bleu-estoril",
				caption: "BMW Série 3 · reprise d'aile et de portière, teinte bleu Estoril",
				altBefore: "Aile et portière bleues rayées, avant réparation",
				altAfter: "BMW Série 3 bleu Estoril terminée, à l'atelier",
			},
		},
		{
			id: "bmw-525i",
			model: "BMW 525i",
			detail: "1990",
			work: "Peinture complète d'une ancienne",
			date: "décembre 2025",
			photo: "bmw-525i",
			alt: "BMW 525i de 1990 masquée dans la cabine, prête à peindre",
		},
		{ id: "bmw-e30", model: "BMW E30", detail: "Cabriolet", work: "Préparation et peinture", alt: "BMW E30 cabriolet à l'atelier" },
		{ id: "panamera-gts", model: "Porsche Panamera", detail: "GTS", work: "Réparation et raccord de peinture", alt: "Porsche Panamera GTS après réparation" },
		{ id: "super5-gt", model: "Renault Super 5", detail: "GT", work: "Restauration de carrosserie", alt: "Renault Super 5 GT en restauration" },
		{ id: "ducati-996", model: "Ducati 996", detail: "Moto", work: "Peinture du carénage", date: "mars 2026", alt: "Carénage de Ducati 996 repeint" },
		{
			id: "cabine",
			model: "Cabine de peinture",
			detail: "L'atelier",
			work: "Voiture protégée, prête à peindre",
			photo: "cabine-protegee",
			alt: "Voiture entièrement protégée dans la cabine de peinture",
		},
		{
			id: "pieces",
			model: "Pièces peintes",
			detail: "En cabine",
			work: "Éléments peints à part, avant remontage",
			photo: "pieces-cabine",
			alt: "Pièces de carrosserie fraîchement peintes dans la cabine",
		},
	],
	facebook: {
		title: "Plus de réalisations sur notre page Facebook",
		text: "Sébastien y publie les voitures qui sortent de l'atelier.",
		cta: "Voir la page",
	},
};

export const prestations = {
	label: "Prestations",
	title: "Ce qu'on fait à l'atelier",
	intro: "De la petite rayure à la restauration complète. Chaque estimation se fait en voyant la voiture.",
	// [À VALIDER] descriptions courtes de chaque prestation
	items: [
		{ icon: "paint", title: "Peinture et redressage haut de gamme", text: "Tôle redressée, apprêt, teinte refaite en cabine. Le raccord ne se voit pas." },
		{ icon: "repair", title: "Réparation toutes marques", text: "Citadine, utilitaire, berline allemande ou sportive : même méthode, même soin." },
		{ icon: "hail", title: "Débosselage sans peinture", tag: "Grêle", text: "La tôle est remise en forme par l'arrière. La peinture d'origine reste intacte." },
		{ icon: "windshield", title: "Pare-brise", text: "Impact ou fissure : réparation ou remplacement, avec votre assurance bris de glace." },
		{ icon: "headlight", title: "Rénovation d'optiques", text: "Phares jaunis ou ternis remis à neuf. Plus clairs la nuit, nets au contrôle technique." },
		{ icon: "frame", title: "Passage au marbre", text: "Après un choc, on contrôle le châssis et on le remet aux cotes du constructeur." },
		{ icon: "moto", title: "Peinture moto", text: "Réservoir, carénage, garde-boue : démontage, préparation et peinture en cabine." },
		{ icon: "classic", title: "Voitures anciennes et restauration", text: "Reprise de tôle, traitement, peinture complète. Pour celles qui ont une histoire." },
		{
			icon: "courtesy",
			title: "Véhicule de courtoisie",
			tagline: "Vous ne restez pas sans voiture",
			text: "Pendant les travaux, une voiture de prêt, sur réservation.",
			featured: true,
		},
	],
};

export const pourquoi = {
	label: "Pourquoi la Belle Étoile",
	title: "Le travail bien fait, sans détour",
	imageAlt: "BMW Série 3 sur le pont, en préparation à l'atelier",
	items: [
		{ title: "Une finition qu'on ne voit pas", text: "Teinte refaite en cabine, raccords invisibles. Votre voiture ressort comme si rien ne s'était passé." },
		{ title: "De la Clio à la Panamera", text: "Même exigence quelle que soit la voiture. Une citadine mérite le même soin qu'une sportive." },
		{ title: "Un seul interlocuteur", text: "Sébastien voit votre voiture, fait le devis et suit la réparation. Vous savez à qui parler." },
		{ title: "Vous repartez roulant", text: "Véhicule de courtoisie pendant les travaux. Votre quotidien ne s'arrête pas." },
	],
};

export const etapes = {
	label: "Une réparation, étape par étape",
	title: "Comment ça se passe",
	steps: [
		{ title: "Vous appelez ou vous passez", text: `${contact.phone}, rue de la Gare à Charquemont.` },
		{ title: "Estimation à l'atelier", text: "Sébastien regarde la voiture avec vous, en dix minutes." },
		{ title: "Devis écrit", text: "Clair, détaillé, sans surprise." },
		{ title: "Réparation", text: "Véhicule de courtoisie si besoin." },
		{ title: "Restitution", text: "Contrôle final avec vous." },
	],
};

export const avis = {
	label: "Avis Google",
	title: "Ils en parlent mieux que nous",
	ratingText: "sur 37 avis Google",
	cta: "Lire tous les avis",
	source: "Avis Google",
	// Avis réels, mot pour mot. N'en ajouter aucun qui ne soit pas publié.
	reviews: [
		{ text: "Ma voiture a été repeinte avec un résultat bluffant : on dirait qu'elle a encore la peinture d'origine.", author: "Pavel C." },
		{ text: "Debosselage de grêle fait à la perfection et nous sommes heureux du résultat.", author: "Teddy" },
		{ text: "Très professionnel et super sympa. J'avais une infiltration d'eau au niveau du toit ouvrant.", author: "Bernard N." },
		{ text: "Très bon accueil. Travail rapide et pro.", author: "Grégory T." },
	],
};

export const atelier = {
	label: "L'atelier et l'équipe",
	title: "Rue de la Gare, depuis 2017",
	// [À VALIDER] parcours de Sébastien
	text: "Sébastien Cavigneaux a ouvert la Carrosserie La Belle Étoile en 2017, rue de la Gare. Carrossier-peintre de métier, il traite chaque voiture comme la sienne, de la petite rayure à la restauration complète.",
	imageAlt: "Pièces de carrosserie peintes dans la cabine de l'atelier",
	portraitTitle: "Photo de Sébastien",
	portraitText: "À prendre à l'atelier, devant la cabine.",
	equipmentTitle: "L'équipement",
	equipment: [
		{ icon: "booth", title: "Cabine de peinture", text: "Peinture complète ou partielle, à l'abri de la poussière." },
		{ icon: "frame", title: "Marbre", text: "Contrôle et redressage du châssis après un choc." },
		{ icon: "hail", title: "Débosselage sans peinture", text: "Pour la grêle et les petits chocs." },
	],
};

export const faq = {
	label: "Questions fréquentes",
	title: "Vous vous demandez",
	// [À VALIDER] toutes les réponses, sauf la loi Hamon (fait établi)
	items: [
		{
			q: "Faut-il prendre rendez-vous pour une estimation ?",
			a: "Non, passez aux heures d'ouverture. Un appel avant permet de s'assurer que Sébastien est disponible.",
		},
		{
			q: "Pourquoi pas de devis en ligne ?",
			a: "Parce qu'un vrai devis se fait en voyant la voiture. L'estimation à l'atelier prend dix minutes et évite les mauvaises surprises.",
		},
		{
			q: "Puis-je choisir mon carrossier si je passe par mon assurance ?",
			a: "Oui. Depuis la loi Hamon de 2014, vous êtes libre de choisir votre réparateur, même si votre assureur vous en propose un autre.",
		},
		{ q: "Avez-vous un véhicule de courtoisie ?", a: "Oui, pendant la durée des travaux, sur réservation." },
		{
			q: "Combien de temps dure une réparation ?",
			a: "Cela dépend du dégât. Le délai est annoncé avec le devis, avant de commencer.",
		},
		{
			q: "Réparez-vous les dégâts de grêle ?",
			a: "Oui, en débosselage sans peinture quand c'est possible : la tôle reprend sa forme sans refaire la peinture.",
		},
		{
			q: "Travaillez-vous sur les motos et les voitures anciennes ?",
			a: "Oui : peinture moto, restauration et peinture complète d'anciennes.",
		},
		{
			q: "Vous occupez-vous des pare-brise ?",
			a: "Oui, remplacement et réparation, avec prise en charge par votre assurance bris de glace.",
		},
	],
};

export const final = {
	label: "Passez à l'atelier",
	title: "Passez nous voir.",
	intro: "L'estimation se fait à l'atelier, en voyant la voiture. Appelez avant si vous voulez être sûr de trouver Sébastien.",
	phoneLabel: "Par téléphone",
	addressLabel: "L'atelier",
	hoursLabel: "Horaires",
	zoneLabel: "On vient de",
	zoneText: "Charquemont, Maîche, Damprichard, Le Russey, Frambouhans, Trévillers, Fournet-Blancheroche et alentours.",
	// Positions approximatives, carte stylisée
	zone: [
		{ name: "Charquemont", lat: 47.2142, lng: 6.8194, main: true },
		{ name: "Maîche", lat: 47.2513, lng: 6.8011, note: "6 min" },
		{ name: "Damprichard", lat: 47.2436, lng: 6.8839 },
		{ name: "Le Russey", lat: 47.1611, lng: 6.7286 },
		{ name: "Frambouhans", lat: 47.2053, lng: 6.7731 },
		{ name: "Trévillers", lat: 47.2953, lng: 6.8667 },
		{ name: "Fournet-Blancheroche", lat: 47.1903, lng: 6.8583 },
	],
	emailLabel: "E-mail",
	facebookLabel: "Facebook",
	arrival: "Vous êtes arrivé.",
};

export const callback = {
	title: "Être rappelé",
	text: "Laissez votre nom et votre numéro, Sébastien vous rappelle.",
	name: "Votre nom",
	phone: "Votre téléphone",
	submit: "Être rappelé",
	demo: "Maquette : rien n'est envoyé.",
	success: "Merci, c'est noté. Sébastien vous rappelle dès qu'il sort de la cabine.",
};

export const footer = {
	tagline: "Carrosserie et peinture à Charquemont, depuis 2017.",
	navTitle: "Le site",
	contactTitle: "Contact",
	socialTitle: "Réseaux",
	legal: "Mentions légales",
	privacy: "Confidentialité",
	credit: "Site réalisé par",
	creditName: "Alexo Webdesign",
	creditUrl: "https://alexo-webdesign.fr",
	backToTop: "Haut de page",
};

export const mobileBar = {
	call: "Appeler",
	directions: "Itinéraire",
};

// Pages légales : contenu provisoire [À VALIDER]
export const legal = {
	mentions: {
		title: "Mentions légales",
		sections: [
			{
				title: "Éditeur du site",
				lines: [
					contact.legalName,
					`Gérant et directeur de la publication : ${contact.manager}`,
					`${contact.street}, ${contact.postalCode} ${contact.city}`,
					`Téléphone : ${contact.phone}`,
					`E-mail : ${contact.email}`,
					`SIRET : ${contact.siret}`,
					"RCS : à compléter",
					"Capital social : à compléter",
					"N° TVA intracommunautaire : à compléter",
				],
			},
			{
				title: "Hébergement",
				lines: ["À compléter à la mise en ligne (nom, adresse et téléphone de l'hébergeur)."],
			},
			{
				title: "Conception",
				lines: ["Alexo Webdesign · Alexis Moine, Maîche (Doubs)"],
			},
			{
				title: "Photos et logo",
				lines: [
					"Photos : Carrosserie La Belle Étoile. Logo redessiné d'après l'enseigne de l'atelier.",
					"Toute reproduction sans autorisation est interdite.",
				],
			},
		],
	},
	privacy: {
		title: "Confidentialité",
		sections: [
			{
				title: "Données collectées",
				lines: [
					"Ce site ne contient aucun formulaire de devis et ne collecte aucune donnée personnelle.",
					"Il ne dépose pas de cookie publicitaire et n'utilise pas d'outil de mesure d'audience.",
				],
			},
			{
				title: "Hébergeur",
				lines: [
					"Comme tout site, l'hébergeur peut enregistrer des journaux techniques (adresse IP, date, page consultée) pour la sécurité du service.",
				],
			},
			{
				title: "Vos droits",
				lines: [
					`Pour toute question sur vos données, écrivez à ${contact.email}.`,
					"Vous pouvez aussi saisir la CNIL (cnil.fr).",
				],
			},
		],
	},
	back: "Retour au site",
	draft: "Contenu provisoire, à valider avec le client avant la mise en ligne.",
};
