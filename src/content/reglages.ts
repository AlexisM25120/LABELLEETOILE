// =============================================================================
// RÉGLAGES DU HERO (calage des superpositions sur les images)
// Toutes les valeurs sont en fraction de l'image (0 = bord gauche/haut, 1 = bord droit/bas).
// Ajoutez ?calage à l'adresse du site pour afficher les repères et vérifier le calage.
// =============================================================================

export type Rect = { x: number; y: number; w: number; h: number };
export type Point = { x: number; y: number };

export type SceneSetup = {
	/** Point de l'image gardé au centre de l'écran quand l'image est recadrée */
	focus: Point;
	/** Enseigne de la façade : le logo SVG est posé exactement dessus */
	sign: Rect;
	/** Ouverture de la porte du garage */
	door: Rect;
	/** Traces de pneus de la vidéo : un point sur la trace, puis l'endroit où elle sort du cadre */
	traceFrom: Point;
	traceExit: Point;
	/** Tracé exact des traces de la vidéo (optionnel) : la trace dorée se pose dessus et en part */
	marks?: Point[][];
};

/** Photo de façade (assets/photos/facade.jpg), utilisée tant que assets/frames/ est vide */
export const facade: { desktop: SceneSetup; mobile: SceneSetup } = {
	desktop: {
		focus: { x: 0.62, y: 0.6 },
		sign: { x: 0.5244, y: 0.4555, w: 0.4705, h: 0.1186 },
		door: { x: 0.6063, y: 0.6179, w: 0.3204, h: 0.2472 },
		traceFrom: { x: 0.5, y: 0.94 },
		traceExit: { x: 0.4, y: 1 },
	},
	mobile: {
		focus: { x: 0.765, y: 0.62 },
		sign: { x: 0.5244, y: 0.4555, w: 0.4705, h: 0.1186 },
		door: { x: 0.6063, y: 0.6179, w: 0.3204, h: 0.2472 },
		traceFrom: { x: 0.62, y: 0.94 },
		traceExit: { x: 0.5, y: 1 },
	},
};

/**
 * Vidéos Higgsfield découpées en images (assets/frames/).
 * Calé le 08/10 sur les vidéos Seedance (porte + départ, 16:9) : enseigne mesurée au pixel,
 * traces mesurées sur la dernière image du départ. Vérifier avec ?calage.
 */
export const frames: { desktop: SceneSetup; mobile: SceneSetup } = {
	desktop: {
		focus: { x: 0.5, y: 0.55 },
		sign: { x: 0.2813, y: 0.1361, w: 0.4313, h: 0.1847 },
		door: { x: 0.3555, y: 0.393, w: 0.289, h: 0.399 },
		traceFrom: { x: 0.49, y: 0.86 },
		traceExit: { x: 0.35, y: 1 },
		/** Les deux traces de pneus de la vidéo (relevées sur depart/241), de la porte à la sortie du cadre */
		marks: [
			[{ x: 0.448, y: 0.803 }, { x: 0.429, y: 0.834 }, { x: 0.408, y: 0.856 }, { x: 0.380, y: 0.878 }, { x: 0.344, y: 0.900 }, { x: 0.299, y: 0.923 }, { x: 0.246, y: 0.945 }, { x: 0.187, y: 0.967 }, { x: 0.123, y: 0.989 }, { x: 0.074, y: 1.000 }],
			[{ x: 0.583, y: 0.800 }, { x: 0.596, y: 0.835 }, { x: 0.593, y: 0.857 }, { x: 0.581, y: 0.879 }, { x: 0.563, y: 0.901 }, { x: 0.539, y: 0.923 }, { x: 0.509, y: 0.946 }, { x: 0.475, y: 0.968 }, { x: 0.440, y: 0.990 }, { x: 0.409, y: 1.000 }],
		],
	},
	mobile: {
		focus: { x: 0.5, y: 0.55 },
		sign: { x: 0.2813, y: 0.1361, w: 0.4313, h: 0.1847 },
		door: { x: 0.3555, y: 0.393, w: 0.289, h: 0.399 },
		traceFrom: { x: 0.49, y: 0.86 },
		traceExit: { x: 0.35, y: 1 },
		/** Les deux traces de pneus de la vidéo (relevées sur depart/241), de la porte à la sortie du cadre */
		marks: [
			[{ x: 0.448, y: 0.803 }, { x: 0.429, y: 0.834 }, { x: 0.408, y: 0.856 }, { x: 0.380, y: 0.878 }, { x: 0.344, y: 0.900 }, { x: 0.299, y: 0.923 }, { x: 0.246, y: 0.945 }, { x: 0.187, y: 0.967 }, { x: 0.123, y: 0.989 }, { x: 0.074, y: 1.000 }],
			[{ x: 0.583, y: 0.800 }, { x: 0.596, y: 0.835 }, { x: 0.593, y: 0.857 }, { x: 0.581, y: 0.879 }, { x: 0.563, y: 0.901 }, { x: 0.539, y: 0.923 }, { x: 0.509, y: 0.946 }, { x: 0.475, y: 0.968 }, { x: 0.440, y: 0.990 }, { x: 0.409, y: 1.000 }],
		],
	},
};

/** Hauteur de défilement de chaque séquence, en hauteur d'écran (vh) */
export const scroll = {
	porte: 250,
	depart: 220,
};

/**
 * Chronologie, en fraction de chaque séquence.
 * Moments mesurés dans la vidéo : porte qui monte à 0,09, levée à 0,71, phares à 0,75 ;
 * départ : la voiture démarre vers 0,45-0,50 et quitte le cadre en bas à gauche à 0,78.
 */
export const timing = {
	/** Titre : sort avant que la porte soit à mi-hauteur (≈ 0,40) */
	h1Out: [0.14, 0.26],
	/** Devise : arrive porte à moitié levée, disparaît avant l'allumage des phares (0,75) */
	mottoIn: [0.32, 0.42],
	mottoOut: [0.6, 0.7],
	/** Hero de secours uniquement (porte dessinée et voiture CSS) */
	doorOpen: [0.12, 0.86],
	headlightsOn: 0.62,
	carLeaves: [0.06, 0.6],
	/** La trace dorée du site part quand la voiture sort du cadre */
	traceStart: 0.78,
	/** Images de la séquence 1 chargées pendant l'écran d'accueil (1 sur 8 sur 241) */
	preloadFrames: 30,
};
