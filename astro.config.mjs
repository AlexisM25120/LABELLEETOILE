// @ts-check
import { defineConfig } from "astro/config";
import fs from "node:fs";
import path from "node:path";
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
				if (!fs.existsSync(FRAMES_DIR)) return;
				const dest = path.join(dir.pathname, "frames");
				fs.cpSync(FRAMES_DIR, dest, {
					recursive: true,
					filter: (src) => !path.basename(src).startsWith("."),
				});
			},
		},
	};
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
