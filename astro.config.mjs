// @ts-check
import { defineConfig } from "astro/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";

const FRAMES_DIR = path.resolve("assets/frames");
const TYPES = { ".webp": "image/webp", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".avif": "image/avif" };

// Les images des séquences du hero restent dans assets/frames/ (dépôt par simple copie).
// En dev on les sert sous /frames/, au build on les copie dans dist/frames/.
function heroFrames() {
	return {
		name: "lbe-hero-frames",
		hooks: {
			"astro:config:setup": ({ updateConfig }) => {
				updateConfig({
					vite: {
						plugins: [
							{
								name: "lbe-hero-frames-dev",
								configureServer(server) {
									server.middlewares.use("/frames", (req, res, next) => {
										const rel = decodeURIComponent((req.url || "").split("?")[0]);
										const file = path.join(FRAMES_DIR, rel);
										if (!file.startsWith(FRAMES_DIR) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return next();
										res.setHeader("Content-Type", TYPES[path.extname(file).toLowerCase()] || "application/octet-stream");
										res.setHeader("Cache-Control", "no-cache");
										fs.createReadStream(file).pipe(res);
									});
								},
							},
						],
					},
				});
			},
			"astro:build:done": ({ dir }) => {
				pruneUnusedImages(fileURLToPath(dir));
				if (!fs.existsSync(FRAMES_DIR)) return;
				// fileURLToPath : le chemin du projet contient des espaces (dir.pathname les garderait encodés)
				const dest = path.join(fileURLToPath(dir), "frames");
				fs.cpSync(FRAMES_DIR, dest, {
					recursive: true,
					filter: (src) => !path.basename(src).startsWith("."),
				});
			},
		},
	};
}

// Astro copie l'original de chaque photo importée dans dist/_astro/ même s'il n'est jamais servi
// (les pages n'utilisent que les versions AVIF/WebP redimensionnées) : on retire ces originaux inutilisés.
function pruneUnusedImages(distDir) {
	const assets = path.join(distDir, "_astro");
	if (!fs.existsSync(assets)) return;
	const texts = [];
	const walk = (d) => {
		for (const e of fs.readdirSync(d, { withFileTypes: true })) {
			const p = path.join(d, e.name);
			if (e.isDirectory()) {
				if (e.name !== "frames") walk(p);
			} else if (/\.(html|css|js|json|xml|txt)$/.test(e.name)) texts.push(fs.readFileSync(p, "utf8"));
		}
	};
	walk(distDir);
	const all = texts.join("\n");
	let removed = 0;
	let bytes = 0;
	for (const f of fs.readdirSync(assets)) {
		if (!/\.(jpe?g|png)$/i.test(f) || all.includes(f)) continue;
		const p = path.join(assets, f);
		bytes += fs.statSync(p).size;
		fs.rmSync(p);
		removed++;
	}
	if (removed) console.log(`[lbe] ${removed} originaux inutilisés retirés de dist/_astro (${(bytes / 1048576).toFixed(1)} Mo)`);
}

// URL publique : variable SITE_URL, sinon celle fournie par Netlify ou Vercel, sinon le domaine prévu.
const vercel = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;
const site =
	process.env.SITE_URL || process.env.DEPLOY_PRIME_URL || process.env.URL || vercel || "https://www.carrosserie-labelleetoile.fr";

// https://astro.build/config
export default defineConfig({
	site,
	devToolbar: { enabled: false },
	integrations: [heroFrames()],
	vite: {
		plugins: [tailwindcss()],
	},
});
