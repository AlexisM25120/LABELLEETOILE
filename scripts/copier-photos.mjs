// Copie les photos Facebook retenues (scripts/photos-facebook.json) de la bibliothèque
// vers assets/photos/facebook/, en floutant les plaques d'immatriculation.
// Usage : npm run photos
// Les originaux de la bibliothèque ne sont jamais modifiés : seules les copies sont floutées.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const config = JSON.parse(fs.readFileSync(path.join(root, "scripts/photos-facebook.json"), "utf8"));
const lib = path.resolve(root, config.bibliotheque);
const dest = path.resolve(root, config.destination);
fs.mkdirSync(dest, { recursive: true });

// Les photos qui ne sont plus dans la liste sont retirées du site
const wanted = new Set(Object.keys(config.photos).map((n) => `${n}.jpg`));
for (const f of fs.readdirSync(dest)) {
	if (/\.(jpe?g|png|webp|avif)$/i.test(f) && !wanted.has(f)) {
		fs.rmSync(path.join(dest, f));
		console.log("retirée :", f);
	}
}

/** Flou fort et irréversible (pixellisation puis flou gaussien), bords fondus pour rester discret */
async function blurZone(img, W, H, [x0, y0, x1, y1]) {
	const zw = (x1 - x0) * W;
	const zh = (y1 - y0) * H;
	const feather = Math.max(6, Math.min(zw, zh) * 0.22);
	const left = Math.max(0, Math.floor(x0 * W - feather));
	const top = Math.max(0, Math.floor(y0 * H - feather));
	const width = Math.min(W - left, Math.ceil(zw + 2 * feather));
	const height = Math.min(H - top, Math.ceil(zh + 2 * feather));
	const zone = await sharp(img).extract({ left, top, width, height }).toBuffer();
	const tiny = await sharp(zone).resize(Math.max(2, Math.round(width / 18)), Math.max(2, Math.round(height / 18))).toBuffer();
	const blurred = await sharp(tiny).resize(width, height, { kernel: "cubic" }).blur(Math.max(4, Math.min(width, height) / 5)).toBuffer();
	// masque : plein sur la zone de la plaque (plus une marge), fondu sur la bordure
	const f = feather;
	const mask = Buffer.from(
		`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><defs><filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${(f / 3).toFixed(1)}"/></filter></defs><rect x="${(f * 0.45).toFixed(1)}" y="${(f * 0.45).toFixed(1)}" width="${(width - f * 0.9).toFixed(1)}" height="${(height - f * 0.9).toFixed(1)}" rx="${(f * 0.6).toFixed(1)}" fill="#fff" filter="url(#b)"/></svg>`,
	);
	const alpha = await sharp(mask).resize(width, height).extractChannel(3).toBuffer();
	const input = await sharp(blurred).removeAlpha().joinChannel(alpha).png().toBuffer();
	return { input, left, top };
}

let count = 0;
let blurredCount = 0;
for (const [name, opts] of Object.entries(config.photos)) {
	const src = path.join(lib, `${name}.jpg`);
	const out = path.join(dest, `${name}.jpg`);
	if (!fs.existsSync(src)) {
		console.warn("introuvable dans la bibliothèque :", name);
		continue;
	}
	const zones = opts.flou ?? [];
	if (!zones.length && !opts.recadrage) {
		fs.copyFileSync(src, out);
		count++;
		continue;
	}
	let buf = await sharp(src).rotate().toBuffer();
	let { width: W, height: H } = await sharp(buf).metadata();
	if (zones.length) {
		const layers = [];
		for (const z of zones) layers.push(await blurZone(buf, W, H, z));
		buf = await sharp(buf).composite(layers).toBuffer();
		blurredCount++;
	}
	if (opts.recadrage) {
		const [x0, y0, x1, y1] = opts.recadrage;
		buf = await sharp(buf)
			.extract({ left: Math.round(x0 * W), top: Math.round(y0 * H), width: Math.round((x1 - x0) * W), height: Math.round((y1 - y0) * H) })
			.toBuffer();
	}
	await sharp(buf).jpeg({ quality: 90, mozjpeg: true }).toFile(out);
	count++;
}
console.log(`${count} photos copiées dans ${config.destination}, dont ${blurredCount} floutées.`);
