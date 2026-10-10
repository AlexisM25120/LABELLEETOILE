// Image de partage (Open Graph) 1200×630 : façade en brique actuelle (photo Facebook atelier-facade-01),
// à défaut assets/photos/facade.*
import type { APIRoute } from "astro";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

export const GET: APIRoute = async () => {
	const dir = path.join(process.cwd(), "assets", "photos");
	const fb = path.join(dir, "facebook", "atelier-facade-01.jpg");
	const name = fs.readdirSync(dir).find((f) => /^facade\.(jpe?g|png|webp|avif)$/i.test(f));
	const file = fs.existsSync(fb) ? fb : name ? path.join(dir, name) : null;
	if (!file) return new Response(null, { status: 404 });
	const { width: W = 1200, height: H = 630 } = await sharp(file).metadata();
	// zone gardée, en fraction de l'image : la Belle Étoile seule (le voisin Mond'Auto est à droite, au-delà de 0,64)
	const zone = file === fb ? { x0: 0.07, x1: 0.635, cy: 0.45 } : { x0: 0, x1: 1, cy: 0.66 };
	const width = Math.round((zone.x1 - zone.x0) * W);
	const h = Math.min(H, Math.round(width / (1200 / 630)));
	const top = Math.max(0, Math.min(H - h, Math.round(H * zone.cy - h / 2)));
	const left = Math.round(zone.x0 * W);
	const buf = await sharp(file).extract({ left, top, width, height: h }).resize(1200, 630).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
	return new Response(new Uint8Array(buf), { headers: { "Content-Type": "image/jpeg" } });
};
