// Génère les 3 logos SVG (texte vectorisé) + favicons à partir du relevé de l'enseigne.
// Usage : npm run logos
// Source de vérité : ce fichier. Ne pas retoucher les SVG générés à la main.
import fs from "node:fs";
import path from "node:path";
import opentype from "opentype.js";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const out = (p) => path.join(root, p);

const GOLD = "#d6a84a";
const INK = "#f3f1ec";
const PANEL = "#0b0c0e";

function font(weight) {
	const buf = fs.readFileSync(out(`node_modules/@fontsource/montserrat/files/montserrat-latin-${weight}-normal.woff`));
	return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}
const F600 = font(600);
const F800 = font(800);

const r = (n) => Math.round(n * 100) / 100;

// Largeur d'un texte avec interlettrage (en unités de sortie)
function textWidth(f, text, size, tracking = 0) {
	const glyphs = f.stringToGlyphs(text);
	let w = 0;
	glyphs.forEach((g, i) => {
		w += (g.advanceWidth / f.unitsPerEm) * size;
		if (i < glyphs.length - 1) {
			w += (f.getKerningValue(g, glyphs[i + 1]) / f.unitsPerEm) * size + tracking;
		}
	});
	return w;
}

// Chemin d'un texte centré sur cx, ligne de base y, avec compression horizontale optionnelle
function textPath(f, text, size, cx, y, { tracking = 0, scaleX = 1 } = {}) {
	const glyphs = f.stringToGlyphs(text);
	const width = textWidth(f, text, size, tracking) * scaleX;
	let x = cx - width / 2;
	let d = "";
	glyphs.forEach((g, i) => {
		const p = g.getPath(0, 0, size);
		for (const c of p.commands) {
			if (c.x !== undefined) c.x = c.x * scaleX + x;
			if (c.x1 !== undefined) c.x1 = c.x1 * scaleX + x;
			if (c.x2 !== undefined) c.x2 = c.x2 * scaleX + x;
			for (const k of ["y", "y1", "y2"]) if (c[k] !== undefined) c[k] += y;
		}
		d += p.toPathData(2);
		x += ((g.advanceWidth / f.unitsPerEm) * size) * scaleX;
		if (i < glyphs.length - 1) {
			x += ((f.getKerningValue(g, glyphs[i + 1]) / f.unitsPerEm) * size + tracking) * scaleX;
		}
	});
	return { d, width };
}

// Interlettrage nécessaire pour qu'un texte occupe une largeur donnée
function fitTracking(f, text, size, target) {
	const n = f.stringToGlyphs(text).length;
	return (target - textWidth(f, text, size)) / (n - 1);
}

// ---------------------------------------------------------------------------
// Symbole : relevé sur assets/reference/logo-enseigne.jpg (zoom ×3 du recadrage
// 260×240 px à partir de 200,95). On convertit en unités symbole : (x-60)/5, (y-30)/5.
const S = ([x, y]) => [r((x - 60) / 5), r((y - 30) / 5)];
// Boîte englobante réelle (pointes en onglet comprises), mesurée au rendu plus bas
let SYMBOL_VIEWBOX = [0, 0, 134, 131];

// Croissant : cercle extérieur centre (352.7, 364.8) r 275, cercle intérieur
// centre (387.4, 380.0) r 284.85, pointes en (412, 92) et (195, 590).
const moonTop = S([412, 92]);
const moonBottom = S([195, 590]);
const rOut = r(275 / 5);
const rIn = r(284.85 / 5);
const moonD = `M${moonTop} A${rOut} ${rOut} 0 0 0 ${moonBottom} A${rIn} ${rIn} 0 0 1 ${moonTop}Z`;
// Ligne médiane du croissant (sert de masque pour l'animation de tracé)
const rMid = r((rOut + rIn) / 2);
const moonDrawD = `M${moonTop} A${rMid} ${rMid} 0 0 0 ${moonBottom}`;

// Étoile : deux traits ouverts, penchés, comme sur l'enseigne
const starA = [[490, 145], [380, 345], [205, 345], [350, 440], [235, 655], [415, 515]].map(S);
const starB = [[485, 350], [710, 345], [490, 460], [525, 600]].map(S);
const poly = (pts) => "M" + pts.map((p) => p.join(" ")).join("L");
const starAD = poly(starA);
const starBD = poly(starB);
const STAR_W = 5.6;

// Étincelle à 4 branches
const [sx, sy] = S([545, 97]);
const sparkD = (() => {
	const v = 9.5, h = 8, w = 1.7;
	return `M${sx} ${r(sy - v)}Q${r(sx + w)} ${r(sy - w)} ${r(sx + h)} ${sy}Q${r(sx + w)} ${r(sy + w)} ${sx} ${r(sy + v)}Q${r(sx - w)} ${r(sy + w)} ${r(sx - h)} ${sy}Q${r(sx - w)} ${r(sy - w)} ${sx} ${r(sy - v)}Z`;
})();

// `id` est préfixé pour pouvoir dupliquer le SVG en ligne dans la page (Logo.astro réécrit les id)
function symbolDefs() {
	return `<linearGradient id="lbe-gold" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#ecd08a"/><stop offset=".45" stop-color="${GOLD}"/><stop offset="1" stop-color="#b8892f"/>
</linearGradient>
<mask id="lbe-moon-reveal" maskUnits="userSpaceOnUse" x="-10" y="-10" width="160" height="160">
<path class="lbe-moon-draw" d="${moonDrawD}" pathLength="1" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round"/>
</mask>
<mask id="lbe-knock" maskUnits="userSpaceOnUse" x="-10" y="-10" width="160" height="160">
<rect x="-10" y="-10" width="160" height="160" fill="#fff"/>
<path d="${starAD}" fill="none" stroke="#000" stroke-width="${STAR_W + 4}" stroke-linejoin="miter" stroke-miterlimit="6"/>
</mask>`;
}

function symbolBody() {
	return `<g class="lbe-symbol">
<g mask="url(#lbe-knock)"><path class="lbe-moon" d="${moonD}" fill="url(#lbe-gold)" mask="url(#lbe-moon-reveal)"/></g>
<g class="lbe-star" fill="none" stroke="url(#lbe-gold)" stroke-width="${STAR_W}" stroke-linejoin="miter" stroke-miterlimit="6" stroke-linecap="butt">
<path class="lbe-star-a" d="${starAD}" pathLength="1"/>
<path class="lbe-star-b" d="${starBD}" pathLength="1"/>
</g>
<path class="lbe-spark" d="${sparkD}" fill="url(#lbe-gold)"/>
</g>`;
}

// ---------------------------------------------------------------------------
// Enseigne : panneau 1000×256, proportions relevées sur la façade
function enseigne() {
	const W = 1000, H = 256;
	const sym = { x: 152, y: 24, h: 210 };
	const k = sym.h / SYMBOL_VIEWBOX[3];
	const symT = `translate(${r(sym.x - SYMBOL_VIEWBOX[0] * k)} ${r(sym.y - SYMBOL_VIEWBOX[1] * k)}) scale(${r(k)})`;

	const topSize = 25;
	const top = textPath(F600, "CARROSSERIE", topSize, 612, 81, { tracking: fitTracking(F600, "CARROSSERIE", topSize, 326) });
	const nameSize = 56;
	const nameScale = 450 / textWidth(F800, "LA BELLE ÉTOILE", nameSize);
	const name = textPath(F800, "LA BELLE ÉTOILE", nameSize, 618, 142, { scaleX: nameScale });
	const mottoText = "EXIGENCE · QUALITÉ · PASSION";
	const mottoSize = 19;
	const motto = textPath(F600, mottoText, mottoSize, 620, 191, { tracking: fitTracking(F600, mottoText, mottoSize, 386) });

	const line = (x1, x2, y) => `<path d="M${x1} ${y}H${x2}"/>`;
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Carrosserie La Belle Étoile — Exigence, qualité, passion">
<defs>${symbolDefs()}</defs>
<rect class="lbe-panel" width="${W}" height="${H}" rx="3" fill="${PANEL}"/>
<g transform="${symT}">${symbolBody()}</g>
<g class="lbe-t1" fill="${INK}"><path d="${top.d}"/><g stroke="${INK}" stroke-width="2.4">${line(386, 432, 72)}${line(792, 848, 72)}</g></g>
<g class="lbe-t2" fill="${INK}"><path d="${name.d}"/></g>
<g class="lbe-t3" fill="${GOLD}"><path d="${motto.d}"/><g stroke="${GOLD}" stroke-width="2.2">${line(388, 416, 184)}${line(824, 852, 184)}</g></g>
</svg>`;
}

// Horizontal : symbole + « CARROSSERIE » + nom, fond transparent (header)
function horizontal() {
	const H = 120;
	const k = 108 / SYMBOL_VIEWBOX[3];
	const symW = SYMBOL_VIEWBOX[2] * k;
	const nameSize = 44;
	const nameScale = 0.9;
	const nameW = textWidth(F800, "LA BELLE ÉTOILE", nameSize) * nameScale;
	const tx = Math.round(4 + symW + 22); // début du bloc texte
	const cx = tx + nameW / 2;
	const topSize = 16;
	const topW = nameW * 0.62;
	const top = textPath(F600, "CARROSSERIE", topSize, cx, 50, { tracking: fitTracking(F600, "CARROSSERIE", topSize, topW) });
	const name = textPath(F800, "LA BELLE ÉTOILE", nameSize, cx, 98, { scaleX: nameScale });
	const lineGap = 14;
	const l1 = [r(tx), r(cx - topW / 2 - lineGap)];
	const l2 = [r(cx + topW / 2 + lineGap), r(tx + nameW)];
	const W = Math.ceil(tx + nameW + 4);
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Carrosserie La Belle Étoile">
<defs>${symbolDefs()}</defs>
<g transform="translate(${r(4 - SYMBOL_VIEWBOX[0] * k)} ${r(6 - SYMBOL_VIEWBOX[1] * k)}) scale(${r(k)})">${symbolBody()}</g>
<g class="lbe-t1" fill="${INK}" fill-opacity=".86"><path d="${top.d}"/><g stroke="${INK}" stroke-opacity=".86" stroke-width="2"><path d="M${l1[0]} 44H${l1[1]}"/><path d="M${l2[0]} 44H${l2[1]}"/></g></g>
<g class="lbe-t2" fill="${INK}"><path d="${name.d}"/></g>
</svg>`;
}

function symbole({ background = false } = {}) {
	const [vx, vy, w, h] = SYMBOL_VIEWBOX;
	if (!background) {
		return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx} ${vy} ${w} ${h}" role="img" aria-label="La Belle Étoile">
<defs>${symbolDefs()}</defs>
${symbolBody()}
</svg>`;
	}
	// Favicon : symbole sur carré anthracite pour rester lisible sur onglet clair
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
<defs>${symbolDefs()}</defs>
<rect width="160" height="160" rx="34" fill="#131417"/>
<g transform="translate(${r(80 - (vx + w / 2) * (124 / Math.max(w, h)))} ${r(80 - (vy + h / 2) * (124 / Math.max(w, h)))}) scale(${r(124 / Math.max(w, h))})">${symbolBody()}</g>
</svg>`;
}

// ICO contenant un PNG (format accepté par tous les navigateurs)
function pngToIco(png) {
	const header = Buffer.alloc(6);
	header.writeUInt16LE(0, 0);
	header.writeUInt16LE(1, 2);
	header.writeUInt16LE(1, 4);
	const entry = Buffer.alloc(16);
	entry.writeUInt8(32, 0);
	entry.writeUInt8(32, 1);
	entry.writeUInt16LE(1, 4);
	entry.writeUInt16LE(32, 6);
	entry.writeUInt32LE(png.length, 8);
	entry.writeUInt32LE(22, 12);
	return Buffer.concat([header, entry, png]);
}

// Mesure la boîte englobante du symbole par rendu (les onglets dépassent des points relevés)
{
	const pad = 40, scale = 8;
	const probe = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${134 + 2 * pad} ${131 + 2 * pad}" width="${(134 + 2 * pad) * scale}" height="${(131 + 2 * pad) * scale}"><defs>${symbolDefs()}</defs>${symbolBody()}</svg>`;
	const { info } = await sharp(Buffer.from(probe)).trim({ threshold: 1 }).toBuffer({ resolveWithObject: true });
	const x = -pad - info.trimOffsetLeft / scale;
	const y = -pad - info.trimOffsetTop / scale;
	const m = 1;
	SYMBOL_VIEWBOX = [r(x - m), r(y - m), r(info.width / scale + 2 * m), r(info.height / scale + 2 * m)];
	console.log("Boîte du symbole :", SYMBOL_VIEWBOX.join(" "));
}

const files = {
	"src/logos/logo-enseigne.svg": enseigne(),
	"src/logos/logo-horizontal.svg": horizontal(),
	"src/logos/logo-symbole.svg": symbole(),
};
fs.mkdirSync(out("src/logos"), { recursive: true });
fs.mkdirSync(out("public/logo"), { recursive: true });
for (const [file, svg] of Object.entries(files)) {
	fs.writeFileSync(out(file), svg + "\n");
	fs.writeFileSync(out(path.join("public/logo", path.basename(file))), svg + "\n");
}
const fav = symbole({ background: true });
fs.writeFileSync(out("public/favicon.svg"), fav + "\n");
const png32 = await sharp(Buffer.from(fav)).resize(32, 32).png().toBuffer();
fs.writeFileSync(out("public/favicon.ico"), pngToIco(png32));
await sharp(Buffer.from(fav)).resize(180, 180).png().toFile(out("public/apple-touch-icon.png"));
await sharp(Buffer.from(files["src/logos/logo-enseigne.svg"])).resize(1600).png().toFile(out("public/logo/logo-enseigne.png"));
console.log("Logos générés.");
