import type { ImageMetadata } from "astro";

// Toutes les photos de assets/photos/ (sous-dossiers compris), optimisées par astro:assets.
// Remplacer un fichier par un autre du même nom suffit, quelle que soit l'extension.
const files = import.meta.glob<{ default: ImageMetadata }>(
	"/assets/photos/**/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}",
	{ eager: true },
);

const stem = (key: string) => key.split("/").pop()!.replace(/\.[^.]+$/, "").toLowerCase();
const natural = new Intl.Collator("fr", { numeric: true, sensitivity: "base" });

/** Photo de assets/photos/ par son nom sans extension (ex. "facade") */
export function photo(name: string): ImageMetadata | undefined {
	const key = Object.keys(files).find((k) => k.startsWith("/assets/photos/") && !k.includes("/facebook/") && stem(k) === name.toLowerCase());
	return key ? files[key].default : undefined;
}

/** Première photo Facebook dont le nom commence par `<prefixe>-` (ex. "bmw-e30" → bmw-e30-1.jpg) */
export function facebookPhoto(prefix: string): ImageMetadata | undefined {
	const p = prefix.toLowerCase() + "-";
	const keys = Object.keys(files)
		.filter((k) => k.includes("/assets/photos/facebook/") && stem(k).startsWith(p))
		.sort(natural.compare);
	return keys.length ? files[keys[0]].default : undefined;
}

/** Largeurs utiles pour srcset, sans dépasser la taille d'origine */
export function widthsFor(img: ImageMetadata, wanted: number[]): number[] {
	const list = wanted.filter((w) => w < img.width);
	list.push(Math.min(img.width, Math.max(...wanted)));
	return [...new Set(list)].sort((a, b) => a - b);
}
