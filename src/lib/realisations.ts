import type { ImageMetadata } from "astro";
import { realisations, type Project, type ProjectPhoto } from "../content/site";
import { facebookFile } from "./photos";

export type ResolvedPhoto = ProjectPhoto & { img: ImageMetadata; project: Project };

const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

/** "2026-09" → "septembre 2026" */
export function monthLabel(date?: string): string {
	if (!date) return "";
	const [y, m] = date.split("-").map(Number);
	return m ? `${MOIS[m - 1]} ${y}` : String(y);
}

/** Photo d'une réalisation par son fichier : image optimisable + textes (alt, légende, point focal) */
export function photoByFile(file: string): ResolvedPhoto {
	for (const project of realisations.projects) {
		const rec = project.photos.find((p) => p.file === file);
		if (!rec) continue;
		const img = facebookFile(file);
		if (!img) throw new Error(`Photo introuvable dans assets/photos/facebook : ${file}.jpg (lancer npm run photos)`);
		return { ...rec, img, project };
	}
	throw new Error(`Photo non décrite dans realisations.projects (src/content/site.ts) : ${file}`);
}

/** Photos d'un projet, résolues, dans l'ordre de site.ts */
export function projectPhotos(project: Project): ResolvedPhoto[] {
	return project.photos.map((p) => photoByFile(p.file));
}

export const byId = (id: string) => {
	const p = realisations.projects.find((x) => x.id === id);
	if (!p) throw new Error(`Projet inconnu : ${id}`);
	return p;
};

export const inSection = (section: Project["sections"][number]) => realisations.projects.filter((p) => p.sections.includes(section));

/** Titre complet : « Porsche Panamera GTS » */
export const fullName = (p: Project) => (p.detail ? `${p.model} ${p.detail}` : p.model);
