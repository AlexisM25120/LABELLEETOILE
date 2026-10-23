// Mesure des visites (mesure/README.md, docs/MESURE.md) : contrôle d'un build, sans navigateur.
//   node scripts/verifier-mesure.mjs prod      après npm run build:prod (Hostinger)
//   node scripts/verifier-mesure.mjs maquette  après npm run build (Netlify) : rien ne doit être compté
// Vérifie : chaque lien d'appel ou d'itinéraire porte son data-m ; chaque nom marqué est accepté par
// m.php (clés de 'evenements' dans serveur/mesure-reglages.php, sinon le clic serait écarté sans bruit) ;
// les scripts PHP et le script d'envoi sont présents en prod et absents ailleurs.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const mode = process.argv[2] ?? "maquette";
const dist = process.argv[3] ?? "dist";
const php = ["m.php", "rapport.php", "stats.php", "mesure-commun.php", "mesure-reglages.php"];

const reglages = readFileSync("serveur/mesure-reglages.php", "utf8");
const evenements = new Set([...reglages.match(/'evenements' => \[([\s\S]*?)\]/)[1].matchAll(/'([a-z_]+)' =>/g)].map((m) => m[1]));

// Appel d'envoi, quelles que soient les guillemets du minifieur (" ' ou `)
const ENVOI = /sendBeacon\(["'`]\/m\.php["'`]/;
const erreurs = [];
const pages = [];
const parcourir = (d) => {
	for (const e of readdirSync(d, { withFileTypes: true })) {
		const p = join(d, e.name);
		if (e.isDirectory()) parcourir(p);
		else if (e.name.endsWith(".html")) pages.push(p);
	}
};
parcourir(dist);

let liens = 0;
let script = 0;
for (const p of pages) {
	const html = readFileSync(p, "utf8");
	for (const [a] of html.matchAll(/<a\s[^>]*href="(?:tel:|https:\/\/www\.google\.com\/maps)[^>]*>/g)) {
		liens++;
		const nom = /\sdata-m="([^"]*)"/.exec(a)?.[1];
		if (!nom) erreurs.push(`${p} : lien sans data-m : ${a.slice(0, 90)}`);
	}
	for (const [, nom] of html.matchAll(/\sdata-m(?:-envoi)?="([^"]*)"/g)) {
		if (!evenements.has(nom)) erreurs.push(`${p} : événement « ${nom} » absent de serveur/mesure-reglages.php`);
	}
	if (ENVOI.test(html)) script++;
}
// Le script d'envoi est un module Astro : on le cherche aussi dans les fichiers JS du build
const js = existsSync(join(dist, "_astro")) ? readdirSync(join(dist, "_astro")).filter((f) => f.endsWith(".js")) : [];
const envoiJs = js.filter((f) => ENVOI.test(readFileSync(join(dist, "_astro", f), "utf8")));
const phpPresents = php.filter((f) => existsSync(join(dist, f)));

if (mode === "prod") {
	if (phpPresents.length !== php.length) erreurs.push(`PHP absents de ${dist} : ${php.filter((f) => !phpPresents.includes(f)).join(", ")} (node mesure/copier.mjs)`);
	if (!script && !envoiJs.length) erreurs.push("script d'envoi absent du build de prod (PUBLIC_SITE_MODE=prod ?)");
} else {
	if (phpPresents.length) erreurs.push(`PHP de la mesure dans un build ${mode} : ${phpPresents.join(", ")}`);
	if (script || envoiJs.length) erreurs.push(`script d'envoi présent dans un build ${mode}`);
}

console.log(`mesure (${mode}) : ${pages.length} pages, ${liens} liens d'appel ou d'itinéraire, événements acceptés : ${[...evenements].join(", ")}`);
if (erreurs.length) {
	for (const e of erreurs) console.error("  ✗ " + e);
	process.exit(1);
}
console.log("  ✓ tout est en ordre");
