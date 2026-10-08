// Image de partage (Open Graph) 1200×630, recadrée sur l'enseigne et la porte de assets/photos/facade.*
import type { APIRoute } from "astro";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

export const GET: APIRoute = async () => {
	const dir = path.join(process.cwd(), "assets", "photos");
	const name = fs.readdirSync(dir).find((f) => /^facade\.(jpe?g|png|webp|avif)$/i.test(f));
	if (!name) return new Response(null, { status: 404 });
	const file = path.join(dir, name);
	const { width = 1200, height = 630 } = await sharp(file).metadata();
	const h = Math.min(height, Math.round(width / (1200 / 630)));
	const top = Math.max(0, Math.min(height - h, Math.round(height * 0.66 - h / 2)));
	const buf = await sharp(file).extract({ left: 0, top, width, height: h }).resize(1200, 630).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
	return new Response(new Uint8Array(buf), { headers: { "Content-Type": "image/jpeg" } });
};
