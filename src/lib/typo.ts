// Typographie française : espaces insécables ajoutées à l'affichage.
const NNBSP = " "; // espace fine insécable
const NBSP = " ";

export function fr(text: string): string {
	return text
		.replace(/ ([?!;])/g, `${NNBSP}$1`)
		.replace(/ :/g, `${NBSP}:`)
		.replace(/« /g, `«${NBSP}`)
		.replace(/ »/g, `${NBSP}»`)
		.replace(/(\d) (h|min|%|€|km)\b/g, `$1${NBSP}$2`)
		.replace(/(\d{2}) (?=\d{2}\b)/g, `$1${NBSP}`)
		.replace(/ – /g, `${NBSP}– `)
		.replace(/'/g, "’");
}
