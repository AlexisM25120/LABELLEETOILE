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
	// Zone desservie déclarée aux moteurs de recherche (JSON-LD), validée le 23/10/2026
	areaServed: [
		{ type: "City", name: "Charquemont" },
		{ type: "City", name: "Maîche" },
		{ type: "Place", name: "Haut-Doubs" },
	],
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

// Réalisations : photos de la page Facebook de l'atelier (assets/photos/facebook/, copiées par
// `npm run photos`, plaques floutées). Une photo = { file, alt, caption, focus } :
// `file` nom du fichier sans extension, `focus` point gardé au recadrage (object-position).
// `sections` : où le projet apparaît (galerie, mur, prestation, etapes, atelier).
// `date` : mois de publication Facebook (AAAA-MM), pas forcément celui des travaux.
// `aConfirmer` : modèle ou travail à faire confirmer par Sébastien (voir A-VALIDER.md).
export type Section = "galerie" | "mur" | "prestation" | "etapes" | "atelier";
export type ProjectPhoto = { file: string; alt: string; caption: string; focus?: string; role?: "couverture" | "avant" | "après" | "détail" | "préparation" };
export type Project = {
	id: string;
	model: string;
	detail?: string;
	work: string;
	date?: string;
	sections: Section[];
	photos: ProjectPhoto[];
	/** Photos montrées sur le mur de réalisations (fichiers de `photos`) */
	wall?: string[];
	aConfirmer?: string;
};

const projects: Project[] = [
	// ---------------------------------------------------------------- galerie
	{
		id: "bmw-estoril",
		model: "BMW Série 3",
		detail: "Bleu Estoril",
		work: "Peinture complète, teinte bleu Estoril",
		date: "2026-09",
		sections: ["galerie", "prestation", "etapes"],
		photos: [
			{ file: "bmw-estoril-01", role: "après", focus: "30% 52%", alt: "BMW Série 3 bleu Estoril devant la carrosserie, rue de la Gare", caption: "Terminée, devant l'atelier" },
			{ file: "bmw-estoril-04", role: "avant", focus: "55% 40%", alt: "BMW Série 3 argent sur le pont, avant la peinture", caption: "À l'arrivée, sur le pont" },
			{ file: "bmw-estoril-09", role: "préparation", focus: "40% 48%", alt: "BMW Série 3 sous film de protection dans la cabine de peinture", caption: "Protégée dans la cabine, prête à peindre" },
			{ file: "bmw-estoril-23", role: "détail", focus: "45% 50%", alt: "Capot de BMW fraîchement peint en bleu Estoril, reflets des néons", caption: "Le capot, peint à part" },
			{ file: "bmw-estoril-29", role: "détail", focus: "50% 50%", alt: "Portière bleu Estoril, reflets des néons de la cabine", caption: "La teinte sous les néons de la cabine" },
			{ file: "bmw-estoril-02", role: "après", focus: "40% 52%", alt: "BMW Série 3 bleu Estoril vue de trois quarts devant la façade en brique", caption: "Prête à rendre" },
		],
	},
	{
		id: "toyota-land-cruiser",
		model: "Toyota Land Cruiser",
		work: "Réparation lourde après un choc avant",
		date: "2021-11",
		sections: ["galerie", "etapes"],
		photos: [
			{ file: "toyota-land-cruiser-01", role: "après", focus: "40% 45%", alt: "Toyota Land Cruiser gris réparé, devant le garage", caption: "Réparé, devant le garage" },
			{ file: "toyota-land-cruiser-02", role: "avant", focus: "50% 45%", alt: "Toyota Land Cruiser à l'arrivée, avant gauche enfoncé", caption: "À l'arrivée, l'avant enfoncé" },
			{ file: "toyota-land-cruiser-04", role: "préparation", focus: "50% 45%", alt: "Avant du Land Cruiser démonté, structure mise à nu", caption: "Démontage : la structure à nu" },
			{ file: "toyota-land-cruiser-03", role: "détail", focus: "50% 45%", alt: "Aile et capot du Land Cruiser refaits, en cours de remontage", caption: "Aile et capot refaits, remontage" },
		],
	},
	{
		id: "ford-mustang",
		model: "Ford Mustang",
		detail: "Noire à bandes",
		work: "Peinture complète et bandes",
		date: "2023-12",
		sections: ["galerie"],
		photos: [
			{ file: "ford-mustang-06", role: "couverture", focus: "48% 47%", alt: "Ford Mustang noire à bandes devant l'ancienne façade de l'atelier, sous la neige", caption: "Devant l'atelier, en décembre" },
			{ file: "ford-mustang-08", role: "préparation", focus: "60% 42%", alt: "Ford Mustang démontée sur le pont, carrosserie en apprêt", caption: "Démontée, en apprêt" },
			{ file: "ford-mustang-46", role: "préparation", focus: "50% 50%", alt: "Bandes de la Mustang masquées sur le capot dans la cabine", caption: "Masquage des bandes" },
			{ file: "ford-mustang-14", role: "détail", focus: "50% 50%", alt: "Capot de Mustang avec ses bandes et ses ouïes, en cabine", caption: "Le capot et ses ouïes" },
			{ file: "ford-mustang-34", role: "détail", focus: "50% 50%", alt: "Capot de Mustang peint en noir mat, bandes en cours", caption: "Bandes en cours" },
			{ file: "ford-mustang-62", role: "après", focus: "50% 48%", alt: "Aile avant de la Mustang noire, reflets des néons de l'atelier", caption: "Le noir sous les néons" },
		],
	},
	{
		id: "mercedes-sl-r107",
		model: "Mercedes SL",
		detail: "R107 cabriolet",
		work: "Restauration de carrosserie et peinture complète",
		date: "2024-03",
		sections: ["galerie"],
		photos: [
			{ file: "mercedes-sl-r107-01", role: "après", focus: "30% 45%", alt: "Mercedes SL R107 cabriolet argent restaurée, devant l'atelier", caption: "Restaurée, devant l'atelier" },
			{ file: "mercedes-sl-r107-43", role: "préparation", focus: "45% 40%", alt: "Mercedes SL démontée sur le pont, en cours de restauration", caption: "Sur le pont, démontée" },
			{ file: "mercedes-sl-r107-08", role: "avant", focus: "50% 40%", alt: "Bas de caisse de la Mercedes SL attaqué par la rouille", caption: "La rouille du bas de caisse" },
			{ file: "mercedes-sl-r107-25", role: "préparation", focus: "50% 45%", alt: "Aile de la Mercedes SL préparée, avant peinture", caption: "Tôle reprise, avant peinture" },
			{ file: "mercedes-sl-r107-61", role: "préparation", focus: "50% 50%", alt: "Mercedes SL sous film dans la cabine de peinture", caption: "En cabine" },
			{ file: "mercedes-sl-r107-02", role: "après", focus: "55% 40%", alt: "Mercedes SL cabriolet argent terminée, vue arrière, à l'atelier", caption: "Terminée, à l'atelier" },
		],
	},
	{
		id: "audi-rs6-rouge",
		model: "Audi RS6 Avant",
		detail: "Rouge",
		work: "Réparation avant et arrière, peinture",
		date: "2021-06",
		sections: ["galerie"],
		photos: [
			{ file: "audi-rs6-rouge-02", role: "après", focus: "45% 45%", alt: "Face avant de l'Audi RS6 Avant rouge après réparation", caption: "Réparée" },
			{ file: "audi-rs6-rouge-13", role: "avant", focus: "55% 45%", alt: "Audi RS6 rouge à l'atelier, face avant démontée", caption: "Face avant démontée" },
			{ file: "audi-rs6-rouge-27", role: "préparation", focus: "50% 50%", alt: "Audi RS6 rouge masquée dans la cabine, carrosserie fraîchement peinte", caption: "Peinte en cabine" },
			{ file: "audi-rs6-rouge-10", role: "détail", focus: "50% 40%", alt: "Reflet d'un néon sur l'aile rouge de l'Audi RS6", caption: "Le rouge sous le néon" },
			{ file: "audi-rs6-rouge-01", role: "après", focus: "65% 55%", alt: "Audi RS6 Avant rouge devant l'ancienne façade de l'atelier", caption: "Rendue au client" },
		],
	},
	{
		id: "dodge-challenger",
		model: "Dodge Challenger",
		detail: "Bleu",
		work: "Peinture en cabine",
		date: "2026-03",
		sections: ["galerie"],
		photos: [
			{ file: "dodge-challenger-01", role: "après", focus: "35% 50%", alt: "Dodge Challenger bleue devant l'atelier, capot noir", caption: "Devant l'atelier" },
			{ file: "dodge-challenger-06", role: "préparation", focus: "40% 50%", alt: "Dodge Challenger bleue sous film dans la cabine de peinture", caption: "Dans la cabine" },
			{ file: "dodge-challenger-15", role: "détail", focus: "50% 50%", alt: "Aile arrière de la Dodge Challenger, bande noire et jante", caption: "Bande et aile arrière" },
			{ file: "dodge-challenger-04", role: "détail", focus: "50% 40%", alt: "Feux arrière et bouclier bleu de la Dodge Challenger", caption: "Le bleu à la lumière du jour" },
		],
	},
	{
		id: "ferrari-458",
		model: "Ferrari 458 Spider",
		detail: "Rouge",
		work: "Réparation et peinture",
		date: "2021-07",
		sections: ["galerie"],
		photos: [
			{ file: "ferrari-458-01", role: "après", focus: "45% 45%", alt: "Ferrari 458 Spider rouge à l'atelier, vue de trois quarts avant", caption: "À l'atelier" },
			{ file: "ferrari-458-02", role: "après", focus: "45% 45%", alt: "Arrière de la Ferrari 458 Spider rouge à l'atelier", caption: "Vue arrière" },
			{ file: "ferrari-458-03", role: "après", focus: "60% 50%", alt: "Ferrari 458 Spider rouge devant l'ancienne façade de l'atelier", caption: "Devant l'atelier" },
		],
	},
	{
		id: "renault-clio-rouge",
		model: "Renault Clio",
		detail: "Rouge",
		work: "Réparation de l'aile arrière et peinture",
		date: "2024-11",
		sections: ["galerie"],
		photos: [
			{ file: "renault-clio-rouge-01", role: "après", focus: "50% 45%", alt: "Renault Clio rouge fraîchement peinte dans la cabine, vue arrière", caption: "Peinte en cabine" },
			{ file: "renault-clio-rouge-09", role: "préparation", focus: "50% 45%", alt: "Aile arrière de la Clio rouge en apprêt, avant peinture", caption: "L'aile en apprêt" },
			{ file: "renault-clio-rouge-03", role: "avant", focus: "50% 45%", alt: "Aile arrière de la Renault Clio rouge enfoncée, à l'arrivée", caption: "À l'arrivée" },
		],
	},
	{
		id: "panamera-gts",
		model: "Porsche Panamera",
		detail: "GTS",
		work: "Réparation du hayon et raccord de peinture",
		date: "2026-03",
		sections: ["galerie"],
		aConfirmer: "travail",
		photos: [
			{ file: "panamera-gts-01", role: "après", focus: "40% 60%", alt: "Porsche Panamera GTS grise devant l'ancienne façade de l'atelier", caption: "Devant l'atelier" },
			{ file: "panamera-gts-09", role: "avant", focus: "50% 45%", alt: "Hayon de la Porsche Panamera enfoncé sous le monogramme, à l'arrivée", caption: "Le hayon à l'arrivée" },
			{ file: "panamera-gts-05", role: "détail", focus: "40% 50%", alt: "Blason Porsche sur le capot gris, reflets de la lampe de contrôle", caption: "Contrôle sous la lampe" },
			{ file: "panamera-gts-03", role: "après", focus: "45% 45%", alt: "Hayon de la Panamera GTS réparé, sous le monogramme Porsche", caption: "Hayon réparé" },
		],
	},
	{
		id: "bmw-e30",
		model: "BMW E30",
		detail: "Cabriolet",
		work: "Préparation et peinture complète en jaune",
		date: "2026-04",
		sections: ["galerie"],
		aConfirmer: "travail (teinte d'origine)",
		photos: [
			{ file: "bmw-e30-01", role: "après", focus: "50% 55%", alt: "BMW E30 cabriolet jaune terminée, dans le showroom de l'atelier", caption: "Terminée" },
			{ file: "bmw-e30-06", role: "avant", focus: "50% 50%", alt: "BMW E30 cabriolet blanche, carrosserie préparée au mastic", caption: "Préparation au mastic" },
			{ file: "bmw-e30-22", role: "préparation", focus: "50% 50%", alt: "Aile avant de la BMW E30 mastiquée et poncée", caption: "Aile mastiquée, poncée" },
			{ file: "bmw-e30-35", role: "après", focus: "60% 45%", alt: "BMW E30 cabriolet jaune dans la cabine de peinture, vue arrière", caption: "Sortie de cabine" },
			{ file: "bmw-e30-08", role: "détail", focus: "40% 45%", alt: "Aile et compartiment moteur de la BMW E30 jaune, en remontage", caption: "Remontage" },
		],
	},
	{
		id: "porsche-911",
		model: "Porsche 911",
		detail: "Type 997",
		work: "Reprise de pare-chocs et peinture",
		date: "2025-04",
		sections: ["galerie"],
		photos: [
			{ file: "porsche-911-01", role: "après", focus: "60% 55%", alt: "Porsche 911 type 997 grise devant l'ancienne façade de l'atelier", caption: "Devant l'atelier" },
			{ file: "porsche-911-09", role: "avant", focus: "55% 45%", alt: "Arrière de la Porsche 911 sans pare-chocs, à l'atelier", caption: "Pare-chocs déposé" },
			{ file: "porsche-911-07", role: "préparation", focus: "50% 50%", alt: "Porsche 911 masquée, pare-chocs en apprêt", caption: "Masquage et apprêt" },
			{ file: "porsche-911-03", role: "détail", focus: "50% 50%", alt: "Pare-chocs de Porsche 911 gris argent peint, sur tréteau en cabine", caption: "Pare-chocs peint en cabine" },
		],
	},
	{
		id: "alpine-a110",
		model: "Alpine A110",
		detail: "Berlinette",
		work: "Préparation de caisse, apprêt",
		date: "2023-11",
		sections: ["galerie", "prestation"],
		photos: [
			{ file: "alpine-a110-01", role: "préparation", focus: "50% 50%", alt: "Caisse d'Alpine A110 Berlinette en apprêt blanc dans la cabine", caption: "La caisse en apprêt" },
			{ file: "alpine-a110-03", role: "préparation", focus: "50% 50%", alt: "Face avant de l'Alpine A110 en apprêt, phares masqués", caption: "Face avant" },
			{ file: "alpine-a110-06", role: "détail", focus: "50% 45%", alt: "Arrière de l'Alpine A110 en apprêt dans la cabine", caption: "L'arrière" },
			{ file: "alpine-a110-05", role: "préparation", focus: "50% 45%", alt: "Alpine A110 Berlinette vue de trois quarts arrière, en apprêt", caption: "Prête pour la peinture" },
		],
	},
	{
		id: "ducati-996",
		model: "Ducati 996",
		detail: "Moto",
		work: "Peinture du carénage en jaune",
		date: "2026-03",
		sections: ["galerie", "prestation"],
		photos: [
			{ file: "ducati-996-07", role: "après", focus: "50% 50%", alt: "Carénage complet de Ducati 996 peint en jaune, sur support dans la cabine", caption: "Le carénage, peint en cabine" },
			{ file: "ducati-996-19", role: "après", focus: "50% 45%", alt: "Pièces de carénage de Ducati 996 jaune, vernies, dans la cabine", caption: "Vernis tendu" },
			{ file: "ducati-996-04", role: "détail", focus: "50% 40%", alt: "Flanc de carénage jaune avec le logo 996 desmoquattro", caption: "Le flanc et son logo" },
			{ file: "ducati-996-01", role: "détail", focus: "50% 45%", alt: "Réservoir de Ducati jaune et ses autocollants neufs", caption: "Réservoir et autocollants" },
		],
	},

	// ---------------------------------------------------------------- mur de réalisations
	{ id: "super5-gt", model: "Renault Super 5", detail: "Caisse arceautée", work: "Caisse mise à nu, préparation et peinture", date: "2026-03", sections: ["mur"], aConfirmer: "modèle", wall: ["super5-gt-02"], photos: [{ file: "super5-gt-02", alt: "Caisse de Renault Super 5 arceautée, peinte en gris, dans la cabine", caption: "Caisse arceautée" }] },
	{
		id: "bmw-525i",
		model: "BMW 525i",
		detail: "E34",
		work: "Peinture complète d'une ancienne",
		date: "2025-12",
		sections: ["mur", "etapes"],
		wall: ["bmw-525i-03"],
		photos: [
			{ file: "bmw-525i-03", focus: "45% 50%", alt: "BMW 525i E34 grise masquée dans la cabine, prête à peindre", caption: "Masquée en cabine" },
			{ file: "bmw-525i-04", role: "préparation", focus: "50% 50%", alt: "BMW 525i masquée au papier dans la cabine de peinture", caption: "Masquage avant peinture" },
		],
	},
	{
		id: "mercedes-cla",
		model: "Mercedes-AMG CLA 35",
		work: "Réparation après chocs avant et arrière",
		date: "2025-09",
		sections: ["mur", "prestation"],
		wall: ["mercedes-cla-06"],
		photos: [
			{ file: "mercedes-cla-06", focus: "40% 45%", alt: "Mercedes-AMG CLA 35 blanche en cours de remontage à l'atelier", caption: "Remontage" },
			{ file: "mercedes-cla-04", role: "avant", focus: "45% 45%", alt: "Mercedes CLA blanche face avant démontée sur le pont", caption: "Face avant démontée" },
		],
	},
	{ id: "golf-gti", model: "Volkswagen Golf GTI", work: "Peinture de la face avant", date: "2025-04", sections: ["mur"], wall: ["golf-gti-04"], photos: [{ file: "golf-gti-04", alt: "Capot de Golf GTI rouge fraîchement peint dans la cabine", caption: "Face avant peinte" }] },
	{ id: "porsche-cayenne", model: "Porsche Cayenne", work: "Réparation et peinture", date: "2024-03", sections: ["mur"], wall: ["porsche-cayenne-07"], photos: [{ file: "porsche-cayenne-07", alt: "Porsche Cayenne noir sous film dans la cabine, carrosserie brillante", caption: "En cabine" }] },
	{ id: "porsche-macan-noir", model: "Porsche Macan", detail: "Noir", work: "Réparation arrière et peinture", date: "2024-04", sections: ["mur"], wall: ["porsche-macan-noir-03"], photos: [{ file: "porsche-macan-noir-03", alt: "Porsche Macan noir fraîchement peint, reflets dans la cabine", caption: "Noir brillant" }] },
	{ id: "porsche-macan-gris", model: "Porsche Macan", detail: "Gris", work: "Réparation et peinture", date: "2024-11", sections: ["mur"], wall: ["porsche-macan-gris-01"], photos: [{ file: "porsche-macan-gris-01", focus: "62% 60%", alt: "Porsche Macan gris devant l'ancienne façade de l'atelier", caption: "Devant l'atelier" }] },
	{ id: "lotus-exige", model: "Lotus Exige", work: "Réparation et peinture arrière", date: "2023-06", sections: ["mur"], wall: ["lotus-exige-02"], photos: [{ file: "lotus-exige-02", focus: "40% 45%", alt: "Arrière de la Lotus Exige blanche à l'atelier", caption: "L'arrière réparé" }] },
	{ id: "mercedes-a45-amg", model: "Mercedes A45 AMG", work: "Peinture de pare-chocs", date: "2022-04", sections: ["mur"], wall: ["mercedes-a45-amg-07"], photos: [{ file: "mercedes-a45-amg-07", alt: "Pare-chocs de Mercedes A45 AMG gris peint, sur tréteau en cabine", caption: "Pare-chocs en cabine" }] },
	{ id: "bmw-serie7", model: "BMW Série 7", work: "Réparation arrière et peinture", date: "2024-10", sections: ["mur"], wall: ["bmw-serie7-01"], photos: [{ file: "bmw-serie7-01", alt: "BMW Série 7 noire de profil sur l'herbe, après réparation", caption: "Rendue au client" }] },
	{ id: "cupra-formentor", model: "Cupra Formentor", work: "Réparation arrière et peinture", date: "2024-09", sections: ["mur"], wall: ["cupra-formentor-07"], photos: [{ file: "cupra-formentor-07", alt: "Aile avant du Cupra Formentor noir dans la cabine de peinture", caption: "En cabine" }] },
	{ id: "audi-rs3", model: "Audi RS3 Sportback", work: "Réparation et peinture", date: "2022-11", sections: ["mur"], wall: ["audi-rs3-02"], photos: [{ file: "audi-rs3-02", alt: "Audi RS3 Sportback noire à l'atelier, capot ouvert", caption: "À l'atelier" }] },
	{ id: "dodge-ram", model: "Dodge RAM 1500", work: "Réparation et peinture", date: "2021-04", sections: ["mur"], wall: ["dodge-ram-01"], photos: [{ file: "dodge-ram-01", focus: "45% 35%", alt: "Pick-up Dodge RAM 1500 blanc garé devant une maison", caption: "Le pick-up terminé" }] },
	{ id: "toyota-hilux", model: "Toyota Hilux", work: "Peinture de la benne et de la carrosserie", date: "2021-07", sections: ["mur"], wall: ["toyota-hilux-24"], photos: [{ file: "toyota-hilux-24", alt: "Toyota Hilux rouge repeint, devant l'atelier", caption: "Devant l'atelier" }] },
	{ id: "mercedes-classe-c", model: "Mercedes Classe C", work: "Peinture complète", date: "2023-09", sections: ["mur"], wall: ["mercedes-classe-c-09"], photos: [{ file: "mercedes-classe-c-09", alt: "Mercedes Classe C bleue fraîchement peinte, reflets dans la cabine", caption: "Le bleu en cabine" }] },
	{ id: "jantes-noires", model: "Jantes de BMW Série 7", work: "Peinture en noir", date: "2025-05", sections: ["mur"], wall: ["jantes-noires-06"], photos: [{ file: "jantes-noires-06", alt: "Jante de BMW peinte en noir brillant, dans la cabine", caption: "Jante peinte en noir" }] },
	{ id: "audi-a3-bleue", model: "Audi bleue", work: "Peinture de la face avant", date: "2023-04", sections: ["mur"], aConfirmer: "modèle", wall: ["audi-a3-bleue-05"], photos: [{ file: "audi-a3-bleue-05", alt: "Capot d'Audi bleu fraîchement peint dans la cabine", caption: "Capot peint" }] },
	{ id: "peugeot-308", model: "Peugeot 308", work: "Peinture de la face avant", date: "2025-02", sections: ["mur"], wall: ["peugeot-308-02"], photos: [{ file: "peugeot-308-02", alt: "Peugeot 308 rouge masquée dans la cabine, face avant peinte", caption: "Face avant peinte" }] },
	{ id: "audi-a1-jaune", model: "Citadine jaune", work: "Toit et éléments peints en noir", date: "2021-10", sections: ["mur"], aConfirmer: "modèle", wall: ["audi-a1-jaune-02"], photos: [{ file: "audi-a1-jaune-02", alt: "Citadine jaune masquée en cabine, toit peint en noir", caption: "Toit peint en noir" }] },
	{ id: "audi-a6-allroad", model: "Audi A6 allroad", work: "Réparation arrière lourde, structure", date: "2022-02", sections: ["mur"], wall: ["audi-a6-allroad-04"], photos: [{ file: "audi-a6-allroad-04", alt: "Arrière de l'Audi A6 allroad blanche démonté, structure à nu", caption: "Structure arrière à nu" }] },
	{ id: "renault-espace", model: "Renault Espace", work: "Préparation et peinture", date: "2024-07", sections: ["mur"], aConfirmer: "travail", wall: ["renault-espace-02"], photos: [{ file: "renault-espace-02", alt: "Renault Espace blanc masqué dans la cabine de peinture", caption: "En cabine" }] },
	{ id: "utilitaire-blanc", model: "Utilitaire", work: "Réparation latérale et peinture", date: "2022-03", sections: ["mur"], wall: ["utilitaire-blanc-06"], photos: [{ file: "utilitaire-blanc-06", focus: "60% 40%", alt: "Fourgon utilitaire blanc après réparation, vue arrière", caption: "Le fourgon réparé" }] },
	{
		id: "bmw-serie3-noire",
		model: "BMW Série 3",
		detail: "Noire",
		work: "Réparation avant et arrière, peinture",
		date: "2024-09",
		sections: ["mur", "atelier"],
		wall: ["bmw-serie3-noire-09"],
		photos: [
			{ file: "bmw-serie3-noire-09", alt: "Capot de BMW noir verni, reflets des néons de la cabine", caption: "Capot verni" },
			{ file: "bmw-serie3-noire-07", alt: "Pare-chocs de BMW en apprêt sur tréteaux dans la cabine de peinture", caption: "Pièces en cabine" },
		],
	},
	{ id: "audi-s3-bleue", model: "Audi berline bleue", work: "Peinture de pare-chocs", date: "2024-11", sections: ["mur"], aConfirmer: "modèle", wall: ["audi-s3-bleue-02"], photos: [{ file: "audi-s3-bleue-02", alt: "Pare-chocs bleu peint, sur tréteau dans la cabine", caption: "Pare-chocs peint" }] },

	// ---------------------------------------------------------------- prestations, étapes, atelier
	{
		id: "debosselage-sans-peinture",
		model: "Débosselage sans peinture",
		work: "Portière redressée sans repeindre",
		date: "2022-02",
		sections: ["prestation"],
		photos: [{ file: "debosselage-sans-peinture-01", focus: "40% 45%", alt: "Portière grise sous la lampe de contrôle du débosselage sans peinture", caption: "Contrôle sous la lampe" }],
	},
	{
		id: "atelier-facade",
		model: "L'atelier",
		work: "Façade de la rue de la Gare",
		sections: ["etapes"],
		photos: [{ file: "atelier-facade-01", focus: "8% 40%", alt: "Façade en brique de la Carrosserie La Belle Étoile, rue de la Gare à Charquemont", caption: "L'atelier, rue de la Gare" }],
	},
	{
		id: "audi-a6-avant",
		model: "Audi A6 Avant",
		work: "Réparation latérale et peinture",
		date: "2022-10",
		sections: ["atelier"],
		photos: [{ file: "audi-a6-avant-04", alt: "Audi A6 Avant noire masquée au papier dans la cabine, flanc en apprêt", caption: "Masquage et apprêt" }],
	},
	{
		id: "chantier-2022-12-24",
		model: "Capot blanc",
		work: "Peinture en cabine",
		date: "2022-12",
		sections: ["atelier"],
		photos: [{ file: "chantier-2022-12-24-25", alt: "Capot blanc fraîchement verni, reflets des néons de la cabine", caption: "Vernis sous les néons" }],
	},
];

export const realisations = {
	label: "Réalisations",
	title: "Ça sort de l'atelier",
	intro: "Les voitures passées entre nos mains, publiées par Sébastien sur la page de l'atelier.",
	swipeHint: "Faites glisser",
	scrollHint: "Défilez",
	before: "Avant",
	after: "Après",
	photosLabel: "photos",
	openLabel: "Voir les photos",
	projects,
	/** Carte avant / après, en tête de galerie : deux paires, au choix */
	beforeAfter: {
		label: "Avant / après",
		pairs: [
			{ project: "bmw-estoril", tab: "Peinture", before: "bmw-estoril-04", after: "bmw-estoril-01", caption: "BMW Série 3 · peinture complète, teinte bleu Estoril" },
			{ project: "toyota-land-cruiser", tab: "Réparation", before: "toyota-land-cruiser-02", after: "toyota-land-cruiser-01", caption: "Toyota Land Cruiser · réparation lourde après un choc avant" },
		],
	},
	viewer: {
		close: "Fermer",
		prev: "Photo précédente",
		next: "Photo suivante",
		endTitle: "Votre voiture mérite le même soin",
		endText: "L'estimation se fait à l'atelier, en voyant la voiture.",
		label: "Photos du projet",
	},
	facebook: {
		title: "Plus de réalisations sur notre page Facebook",
		text: "Sébastien y publie les voitures qui sortent de l'atelier.",
		cta: "Voir la page",
	},
};

export const mur = {
	label: "Toutes marques",
	title: "Et ce n'est qu'une partie de l'atelier.",
	intro: "Citadines, sportives, utilitaires, anciennes : quelques-unes des voitures passées rue de la Gare depuis 2021.",
	brands: ["BMW", "PORSCHE", "FERRARI", "MERCEDES", "AUDI", "FORD", "DODGE", "ALPINE", "LOTUS", "VOLKSWAGEN", "PEUGEOT", "RENAULT", "TOYOTA", "CUPRA", "DUCATI"],
	brandsLabel: "Marques passées à l'atelier",
	tapHint: "Touchez une photo pour voir le travail",
};

export const prestations = {
	label: "Prestations",
	title: "Ce qu'on fait à l'atelier",
	intro: "De la petite rayure à la restauration complète. Chaque estimation se fait en voyant la voiture.",
	// [À VALIDER] descriptions courtes de chaque prestation
	items: [
		// `photo` : fond discret de la carte (fichier d'une réalisation, voir plus haut)
		{ icon: "paint", photo: "bmw-estoril-09", title: "Peinture et redressage haut de gamme", text: "Tôle redressée, apprêt, teinte refaite en cabine. Le raccord ne se voit pas." },
		{ icon: "repair", photo: "mercedes-cla-04", title: "Réparation toutes marques", text: "Citadine, utilitaire, berline allemande ou sportive : même méthode, même soin." },
		{ icon: "hail", photo: "debosselage-sans-peinture-01", title: "Débosselage sans peinture", tag: "Grêle", text: "La tôle est remise en forme par l'arrière. La peinture d'origine reste intacte." },
		{ icon: "windshield", title: "Pare-brise", text: "Impact ou fissure : réparation ou remplacement, avec votre assurance bris de glace." },
		{ icon: "headlight", title: "Rénovation d'optiques", text: "Phares jaunis ou ternis remis à neuf. Plus clairs la nuit, nets au contrôle technique." },
		{ icon: "frame", title: "Passage au marbre", text: "Après un choc, on contrôle le châssis et on le remet aux cotes du constructeur." },
		{ icon: "moto", photo: "ducati-996-19", title: "Peinture moto", text: "Réservoir, carénage, garde-boue : démontage, préparation et peinture en cabine." },
		{ icon: "classic", photo: "alpine-a110-05", title: "Voitures anciennes et restauration", text: "Reprise de tôle, traitement, peinture complète. Pour celles qui ont une histoire." },
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
		{ title: "Vous appelez ou vous passez", text: `${contact.phone}, rue de la Gare à Charquemont.`, photo: "atelier-facade-01" },
		{ title: "Estimation à l'atelier", text: "Sébastien regarde la voiture avec vous, en dix minutes.", photo: "toyota-land-cruiser-02" },
		{ title: "Devis écrit", text: "Clair, détaillé, sans surprise." },
		{ title: "Réparation", text: "Véhicule de courtoisie si besoin.", photo: "bmw-525i-04" },
		{ title: "Restitution", text: "Contrôle final avec vous.", photo: "bmw-estoril-01" },
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
	// Photos de l'atelier (fichiers de réalisations)
	photos: ["audi-a6-avant-04", "bmw-serie3-noire-07", "chantier-2022-12-24-25"],
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
	creditName: "Alexo",
	creditUrl: "https://alexowebdesign.com",
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
