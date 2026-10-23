// Mesure des visites (mesure/README.md) : contrôle de m.php, rapport.php et stats.php en ligne de
// commande, avec les réglages fictifs de mesure/tests/reglages-test.php (le module se teste sans site).
//   node mesure/tests/php-check.mjs
// PHP absent du Mac : MESURE_PHP="npx -y @php-wasm/cli@3.1.56" node mesure/tests/php-check.mjs (PHP en WebAssembly).
// Compteurs de test dans mesure/tests/.tmp/ (non versionné), effacés à chaque passage.
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ici = relative(process.cwd(), dirname(fileURLToPath(import.meta.url))) || ".";
const php = process.env.MESURE_PHP ?? "php";
const dossier = join(ici, ".tmp/mesure-donnees");
rmSync(dossier, { recursive: true, force: true });
mkdirSync(dossier, { recursive: true });
const q = (s) => `'${String(s).replace(/'/g, "'\\''")}'`;
const lancer = (args) => spawnSync(`${php} ${args.map(q).join(" ")}`, { shell: true, encoding: "utf8" });
const envoi = (corps, serveur = {}) => lancer([join(ici, "m-cas.php"), dossier, corps, JSON.stringify(serveur)]);
const stats = (serveur = {}, get = {}, post = {}) => {
	const r = lancer([join(ici, "stats-cas.php"), dossier, JSON.stringify(serveur), JSON.stringify(get), JSON.stringify(post)]);
	return { corps: r.stdout, code: Number(/HTTP (\d+)/.exec(r.stderr)?.[1] ?? 200), erreur: r.stderr };
};

let echecs = 0;
const verifie = (ok, msg) => {
	console.log(`${ok ? "  ✓" : "  ✗"} ${msg}`);
	if (!ok) echecs++;
};
const mois = new Intl.DateTimeFormat("fr-CA", { timeZone: "Europe/Zurich", year: "numeric", month: "2-digit" }).format(new Date());
const lire = () => (existsSync(`${dossier}/${mois}.json`) ? JSON.parse(readFileSync(`${dossier}/${mois}.json`, "utf8")) : {});

console.log("\nm.php\n");
for (const e of ["visite", "visite", "visite", "appel", "whatsapp", "devis", "itineraire"]) envoi(e);
verifie(JSON.stringify(lire()) === JSON.stringify({ visite: 3, appel: 1, whatsapp: 1, devis: 1, itineraire: 1 }), `7 envois valides comptés : ${JSON.stringify(lire())}`);
const refus = [
	["événement absent des réglages (rdv)", "rdv", {}],
	["ancien nom (devis_envoye)", "devis_envoye", {}],
	["corps trop long", "visite".padEnd(60, "x"), {}],
	["GET", "visite", { REQUEST_METHOD: "GET" }],
	["autre site (Sec-Fetch-Site: cross-site)", "visite", { HTTP_SEC_FETCH_SITE: "cross-site" }],
	["robot (Googlebot)", "visite", { HTTP_USER_AGENT: "Mozilla/5.0 (compatible; Googlebot/2.1)" }],
	["sans User-Agent", "visite", { HTTP_USER_AGENT: null }],
];
for (const [libelle, corps, serveur] of refus) {
	const avant = JSON.stringify(lire());
	envoi(corps, serveur);
	verifie(JSON.stringify(lire()) === avant, `refusé : ${libelle}`);
}
const brut = readFileSync(`${dossier}/${mois}.json`, "utf8");
verifie(!/\d+\.\d+\.\d+\.\d+|Mozilla|Firefox|:\d\d/.test(brut), `fichier du mois sans IP, navigateur ni heure : ${brut}`);

console.log("\nrapport.php\n");
writeFileSync(`${dossier}/2025-09.json`, JSON.stringify({ visite: 380, appel: 19, whatsapp: 21, devis: 6 }));
writeFileSync(`${dossier}/2025-10.json`, JSON.stringify({ visite: 412, appel: 23, whatsapp: 17, devis: 6, itineraire: 3 }));
const r = lancer([join(ici, "rapport-essai.php"), "--essai", "--mois=2025-10", dossier]);
console.log(r.stdout.replace(/^/gm, "    "));
const attendu = [
	"Visites : 412 (septembre : 380, +32)",
	"Appels : 23 (septembre : 19, +4)",
	"WhatsApp : 17 (septembre : 21, −4)",
	"Demandes de devis : 6 (septembre : 6, ±0)",
	"Itinéraires : 3 (septembre : 0, +3)",
];
verifie(attendu.every((l) => r.stdout.includes(l)), "une ligne par événement des réglages, comparée au mois précédent");
verifie(r.stdout.includes("Objet : Votre site en octobre 2025") && r.stdout.includes("Le site exemple.ch en octobre 2025"), "objet et domaine lus dans les réglages");
const vide = lancer([join(ici, "rapport-essai.php"), "--essai", "--mois=2025-08", dossier]);
verifie(vide.stdout.includes("Attention : aucun compteur") && vide.stdout.includes("Visites : 0\n"), "mois sans compteurs : 0 et alerte, pas de comparaison");

console.log("\nstats.php\n");
verifie(stats().code === 404, "sans mot de passe configuré : 404");
writeFileSync(`${dossier}/config.php`, "<?php return ['stats_mot_de_passe' => 'essai-local'];");
const form = stats();
verifie(form.code === 200 && form.corps.includes('type="password"') && !form.corps.includes("<table"), "GET : formulaire seul, aucun chiffre");
verifie(!/style=|<style|<script/.test(form.corps), "aucun style ni script inline (CSP)");
const mauvais = stats({ REQUEST_METHOD: "POST" }, {}, { mot_de_passe: "faux" });
verifie(mauvais.code === 403 && !mauvais.corps.includes("<table"), "mauvais mot de passe : 403, aucun chiffre");
const bon = stats({ REQUEST_METHOD: "POST" }, {}, { mot_de_passe: "essai-local" });
const lignes = [...bon.corps.matchAll(/<tr><th scope="row">([^<]+)<\/th>((?:<td>\d+<\/td>)+)<\/tr>/g)].map((m) => [m[1], m[2].match(/\d+/g).join(",")]);
verifie(bon.code === 200 && lignes.length === 3, `bon mot de passe : ${lignes.length} mois (${lignes.map((l) => l[0]).join(", ")})`);
verifie(lignes[1]?.[0] === "octobre 2025" && lignes[1]?.[1] === "412,23,17,6,3", `octobre 2025 : ${lignes[1]?.[1]} (Visites, Appels, WhatsApp, Devis, Itinéraires)`);
const jeton = /stats\.php\?csv&amp;jeton=([a-f0-9]{64})/.exec(bon.corps)?.[1];
verifie(Boolean(jeton) && !bon.corps.includes("essai-local"), "lien CSV à jeton, mot de passe absent de la page");
const csv = stats({}, { csv: "", jeton });
const csvLignes = csv.corps.replace(/^﻿/, "").trim().split("\n");
verifie(csv.code === 200 && csvLignes[0] === "Mois;Visites;Appels;WhatsApp;\"Demandes de devis\";Itinéraires", `CSV, en-tête : ${csvLignes[0]}`);
verifie(csvLignes.includes("2025-10;412;23;17;6;3") && csvLignes.includes("2025-09;380;19;21;6;0"), "CSV : un total par événement et par mois");
verifie(stats({}, { csv: "", jeton: "0".repeat(64) }).code === 403, "CSV avec un faux jeton : 403");
writeFileSync(`${dossier}/config.php`, "<?php return ['stats_mot_de_passe' => password_hash('autre', PASSWORD_DEFAULT)];");
verifie(stats({ REQUEST_METHOD: "POST" }, {}, { mot_de_passe: "autre" }).corps.includes("<table"), "mot de passe en hachage password_hash() accepté");
const css = stats({}, { css: "" });
verifie(css.code === 200 && css.corps.startsWith("body{"), "feuille de style servie par stats.php?css");

rmSync(join(ici, ".tmp"), { recursive: true, force: true });
console.log(echecs ? `\n${echecs} échec(s)\n` : "\nPHP OK\n");
process.exit(echecs ? 1 : 0);
