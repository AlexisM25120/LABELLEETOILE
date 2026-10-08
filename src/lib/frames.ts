import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

// Manifest des séquences du hero, lu au build : on compte les images réellement présentes.
const ROOT = path.join(process.cwd(), "assets", "frames");
const natural = new Intl.Collator("fr", { numeric: true, sensitivity: "base" });

export type FrameSet = { urls: string[]; width: number; height: number };

async function read(dir: string): Promise<FrameSet | null> {
	let names: string[] = [];
	try {
		names = fs.readdirSync(path.join(ROOT, dir)).filter((f) => /\.(webp|jpe?g|png|avif)$/i.test(f) && !f.startsWith("."));
	} catch {
		return null;
	}
	if (!names.length) return null;
	names.sort(natural.compare);
	let width = 16;
	let height = 9;
	try {
		const m = await sharp(path.join(ROOT, dir, names[0])).metadata();
		if (m.width && m.height) ({ width, height } = m);
	} catch {}
	return { urls: names.map((n) => `/frames/${dir}/${encodeURIComponent(n)}`), width, height };
}

export async function framesManifest() {
	const [porte, porteM, depart, departM] = await Promise.all([read("porte"), read("porte-m"), read("depart"), read("depart-m")]);
	return {
		porte: { desktop: porte, mobile: porteM },
		depart: { desktop: depart, mobile: departM },
	};
}
