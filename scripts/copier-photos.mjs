// Copie les photos Facebook retenues (scripts/photos-facebook.json) de la bibliothèque
// vers assets/photos/facebook/, en floutant les plaques d'immatriculation (contour exact de chaque plaque).
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

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

/**
 * Floute une plaque, et seulement elle : flou gaussien fort calculé avec les seuls pixels de la plaque
 * (convolution normalisée, la carrosserie autour ne déteint pas), posé dans le contour exact.
 * La plaque garde sa couleur (blanche ou noire, bandes bleues), les caractères disparaissent.
 */
async function blurPlate(img, W, H, quad) {
	const plateH = (dist(quad[0], quad[3]) + dist(quad[1], quad[2])) / 2;
	const sigma = Math.max(3, plateH * 0.3);
	const pad = Math.ceil(sigma * 2.5) + 2;
	const xs = quad.map((p) => p[0]);
	const ys = quad.map((p) => p[1]);
	const left = Math.max(0, Math.floor(Math.min(...xs)) - pad);
	const top = Math.max(0, Math.floor(Math.min(...ys)) - pad);
	const width = Math.min(W, Math.ceil(Math.max(...xs)) + pad) - left;
	const height = Math.min(H, Math.ceil(Math.max(...ys)) + pad) - top;
	const pts = quad.map(([x, y]) => `${(x - left).toFixed(1)},${(y - top).toFixed(1)}`).join(" ");
	const svg = (body) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${body}</svg>`);
	const alphaOf = async (body) => sharp(svg(body)).ensureAlpha().extractChannel(3).raw().toBuffer();
	// masque de la plaque (sert au calcul du flou) et masque de pose (1 px de plus, bord adouci)
	const inside = await alphaOf(`<polygon points="${pts}" fill="#fff"/>`);
	const paste = await alphaOf(
		`<defs><filter id="f" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="0.6"/></filter></defs><polygon points="${pts}" fill="#fff" stroke="#fff" stroke-width="2" stroke-linejoin="round" filter="url(#f)"/>`,
	);
	const region = await sharp(img).extract({ left, top, width, height }).removeAlpha().raw().toBuffer();
	const n = width * height;
	const premult = Buffer.alloc(n * 3);
	for (let i = 0; i < n; i++) {
		const m = inside[i] / 255;
		for (let c = 0; c < 3; c++) premult[i * 3 + c] = Math.round(region[i * 3 + c] * m);
	}
	const raw = (_buf, channels) => ({ raw: { width, height, channels } });
	const blurredImg = await sharp(premult, raw(premult, 3)).blur(sigma).raw().toBuffer();
	// (sharp renvoie un masque d'une couche sur 3 canaux : on lit le premier)
	const blurredMask = await sharp(inside, raw(inside, 1)).blur(sigma).extractChannel(0).raw().toBuffer();
	const out = Buffer.alloc(n * 4);
	for (let i = 0; i < n; i++) {
		const m = Math.max(blurredMask[i], 1) / 255;
		// léger grain pour que la zone floutée ne soit pas plus lisse que la photo
		const grain = (Math.random() - 0.5) * 5;
		for (let c = 0; c < 3; c++) out[i * 4 + c] = Math.max(0, Math.min(255, Math.round(blurredImg[i * 3 + c] / m + grain)));
		out[i * 4 + 3] = paste[i];
	}
	const input = await sharp(out, raw(out, 4)).png().toBuffer();
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
	const zones = opts.plaques ?? [];
	if (!zones.length && !opts.recadrage) {
		fs.copyFileSync(src, out);
		count++;
		continue;
	}
	let buf = await sharp(src).rotate().toBuffer();
	let { width: W, height: H } = await sharp(buf).metadata();
	if (zones.length) {
		const layers = [];
		for (const z of zones) layers.push(await blurPlate(buf, W, H, z));
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
