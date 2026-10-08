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
 * [À CALER] dès que les images sont déposées : ouvrir le site avec ?calage
 * et ajuster `sign` (rectangle rouge) pour qu'il couvre l'enseigne.
 * Valeurs de départ : cadrage 16:9 centré sur la porte, comme demandé dans le guide.
 */
export const frames: { desktop: SceneSetup; mobile: SceneSetup } = {
	desktop: {
		focus: { x: 0.5, y: 0.55 },
		sign: { x: 0.36, y: 0.14, w: 0.3, h: 0.077 },
		door: { x: 0.36, y: 0.32, w: 0.28, h: 0.5 },
		traceFrom: { x: 0.3, y: 0.9 },
		traceExit: { x: 0.12, y: 1 },
	},
	mobile: {
		focus: { x: 0.5, y: 0.55 },
		sign: { x: 0.36, y: 0.14, w: 0.3, h: 0.077 },
		door: { x: 0.36, y: 0.32, w: 0.28, h: 0.5 },
		traceFrom: { x: 0.3, y: 0.9 },
		traceExit: { x: 0.12, y: 1 },
	},
};

/** Hauteur de défilement de chaque séquence, en hauteur d'écran (vh) */
export const scroll = {
	porte: 250,
	depart: 220,
};

/** Chronologie des textes, en fraction de chaque séquence */
export const timing = {
	h1Out: [0.22, 0.32],
	mottoIn: [0.45, 0.55],
	mottoOut: [0.72, 0.82],
	doorOpen: [0.12, 0.86],
	headlightsOn: 0.62,
	carLeaves: [0.06, 0.6],
	traceStart: 0.7,
	/** Nombre d'images de la séquence 1 chargées pendant l'écran d'accueil */
	preloadFrames: 30,
};
