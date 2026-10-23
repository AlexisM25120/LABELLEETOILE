// Mesure des visites (mesure/README.md) : après le build de prod, copie les scripts PHP du module
// (mesure/serveur/) et les réglages du site à la racine du build. Jamais en maquette ni en présentation :
// un hébergement statique (Netlify) ne les exécuterait pas et le script d'envoi n'y est pas chargé.
//   node mesure/copier.mjs [build] [réglages]   défauts : dist, serveur/mesure-reglages.php (ou $DIST)
import { copyFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const module = join(dirname(fileURLToPath(import.meta.url)), "serveur");
const dist = resolve(process.argv[2] ?? process.env.DIST ?? "dist");
const reglages = resolve(process.argv[3] ?? "serveur/mesure-reglages.php");
if (!existsSync(reglages)) {
	console.error(`mesure : réglages du site introuvables (${reglages})`);
	process.exit(1);
}
const fichiers = readdirSync(module).filter((f) => f.endsWith(".php"));
for (const f of fichiers) copyFileSync(join(module, f), join(dist, f));
copyFileSync(reglages, join(dist, "mesure-reglages.php"));
console.log(`mesure : ${[...fichiers, "mesure-reglages.php"].join(", ")} → ${dist}`);
