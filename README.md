# Carrosserie La Belle Étoile — maquette V2

Site vitrine one-page de la Carrosserie La Belle Étoile (25 rue de la Gare, 25140 Charquemont).
Maquette à présenter au client le **lundi 12 octobre 2026**. Non publiée, `noindex`.

Stack : Astro (statique) · Tailwind CSS v4 · GSAP + ScrollTrigger · Lenis · polices auto-hébergées (@fontsource).

**Polices : exception au socle Alexo (2 familles maximum), décidée le 24/10/2026.** Le site garde ses 3 familles (Anton pour les titres, Inter pour le texte, Barlow Condensed pour les libellés et boutons), qui font partie de l'identité visuelle. Les trois sont préchargées et Lighthouse mobile reste à 96 en performance.

## Lancer le site

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # build de production dans dist/
npm run preview    # sert dist/ en local
```

Adresses utiles pendant la démo :

| Adresse | Effet |
| --- | --- |
| `/?intro` | rejoue l'écran d'accueil (sinon il ne passe qu'une fois par onglet) |
| `/?calage` | affiche les repères de calage du hero (enseigne en rouge, porte en bleu, traces en jaune) |

## Où sont les choses

| Quoi | Où |
| --- | --- |
| **Tous les textes** | `src/content/site.ts` (une seule source, typographie française ajoutée automatiquement) |
| Calage du hero (enseigne, porte, traces, durées) | `src/content/reglages.ts` |
| Photos | `assets/photos/` (hero) et `assets/photos/facebook/` (réalisations, copiées par `npm run photos`) |
| Réalisations (projets, légendes, sections) | `realisations.projects` dans `src/content/site.ts` |
| Images des vidéos du hero | `assets/frames/porte`, `porte-m`, `depart`, `depart-m` |
| Logos SVG | `src/logos/` (copiés dans `public/logo/`), générés par `npm run logos` |
| Ce qui reste à valider avec le client | `A-VALIDER.md` |

## Remplacer une photo

Déposez le nouveau fichier **avec le même nom** dans `assets/photos/` (l'extension peut changer : `facade.jpg` → `facade.webp` fonctionne). Astro régénère les versions AVIF/WebP au prochain `npm run dev` ou `npm run build`. Rien à toucher dans le code.

Photos utilisées : `facade` (photo du hero de secours et poster de la vidéo). Les anciennes photos de la maquette (`aile-rayee`, `bleu-estoril`, `bmw-525i`, `cabine-protegee`, `pieces-cabine`, `serie3-pont`) ne sont plus affichées : toutes les réalisations viennent maintenant des photos Facebook (voir « Ajouter une réalisation »).

Une photo Facebook se remplace de la même façon : nouveau fichier sous le même nom dans la bibliothèque, puis `npm run photos`.

## Le hero vidéo

**En place depuis le 08/10/2026.** Les vidéos Seedance (`../06_Hero-video/clips/` : `porte.mp4`, `depart-aligne.mp4`) sont découpées en 241 images WebP par dossier :

| Dossier | Usage | Taille | Poids |
| --- | --- | --- | --- |
| `assets/frames/porte` | ordinateur et tablette | 1280×720 | 20,0 Mo |
| `assets/frames/depart` | ordinateur et tablette | 1280×720 | 19,4 Mo |
| `assets/frames/porte-m` | mobile (moins de 768 px) | 900×506 | 11,2 Mo |
| `assets/frames/depart-m` | mobile | 900×506 | 11,1 Mo |

La dernière image de `porte` est identique au pixel à la première de `depart` : le passage d'une séquence à l'autre est invisible. Le site compte lui-même les images présentes (manifest lu au build).

**Ne pas relancer `npm run frames`** sur ces dossiers : le script repasserait à 60 images et casserait le raccord (il faut `depart-aligne.mp4`, pas `depart.mp4`). Il refuse désormais d'écraser des images existantes (`FORCE=1` pour forcer).

Chargement « du grossier au fin » : pendant l'écran d'accueil, 1 image sur 8 de la porte ; ensuite les deux séquences en parallèle, 1 sur 8, puis 1 sur 4, 1 sur 2 et le reste. Le défilement répond tout de suite, la fluidité arrive au fil du chargement. Testé en 4G rapide simulée à 390 px : jamais de canvas vide, séquence départ prête avant qu'on y arrive.

Calage (`src/content/reglages.ts`, bloc `frames`) : enseigne, porte et traces de pneus. `/?calage` affiche les repères. Le logo SVG est posé sur l'enseigne pendant les deux séquences, sur un panneau bleu nuit opaque de la couleur de l'enseigne (la vidéo a écrit « EXICENCE »). Sur mobile, l'enseigne déborde de l'écran : le panneau reste pleine largeur, le logo est réduit pour tenir en entier. La trace dorée se pose sur les deux traces de pneus de la vidéo (`marks`) quand la voiture a quitté le cadre (`timing.traceStart` = 0,78), puis la double trace du site en part.

Moments clés (fraction de chaque séquence) : porte qui monte à 0,09, levée à 0,71, phares à 0,75 ; départ : la voiture démarre vers 0,45-0,50 et quitte le cadre à 0,78. Les textes sont calés dessus (`timing`).

Sans images dans `assets/frames/`, le hero de secours reprend la main : photo de façade, porte dessinée qui remonte, voiture qui sort. Avec `prefers-reduced-motion`, une seule image fixe : la dernière de la porte (voiture, phares allumés).

Pour découper une **nouvelle** vidéo (dossiers vides) : `npm run frames -- porte.mp4 porte` (ffmpeg + cwebp).

## Ajouter une réalisation

Les photos viennent de la bibliothèque Facebook (`../02_Contenu-fourni-client/photos/facebook/`, à ne jamais copier en entier ni modifier). Le site n'en reçoit qu'une sélection, plaques floutées.

1. **Choisir** les photos sur la planche du projet (`_planches/<projet>.jpg`), puis les ouvrir en grand : netteté, cadrage, plaques, visages.
2. **Les déclarer** dans `scripts/photos-facebook.json`, sous leur nom d'origine sans extension. Pour chaque plaque lisible (y compris celles des voitures garées à côté), relever ses 4 coins en pixels de la photo d'origine, dans l'ordre haut gauche, haut droite, bas droite, bas gauche :
   ```json
   "golf-gti-04": {},
   "audi-rs3-02": { "plaques": [[[1071, 1240], [1290, 1152], [1296, 1218], [1077, 1309]]] }
   ```
   Seul l'intérieur du contour est flouté : la plaque garde sa couleur, les caractères disparaissent, la carrosserie autour ne bouge pas. `"recadrage": [x0, y0, x1, y1]` (en fraction de l'image) garde seulement une partie de la photo.
3. **Copier** : `npm run photos`. Le script copie les fichiers dans `assets/photos/facebook/` (`<projet>-NN.jpg`), floute les copies et retire celles qui ne sont plus dans la liste. Les originaux restent intacts.
4. **Décrire le projet** dans `realisations.projects` (`src/content/site.ts`) :
   ```ts
   {
   	id: "golf-gti",
   	model: "Volkswagen Golf GTI",
   	work: "Peinture de la face avant",
   	date: "2025-04", // mois de publication Facebook
   	sections: ["galerie"], // galerie, mur, prestation, etapes, atelier
   	photos: [
   		{ file: "golf-gti-04", role: "après", focus: "50% 45%", alt: "Capot de Golf GTI rouge peint dans la cabine", caption: "Face avant peinte" },
   	],
   },
   ```
   La première photo sert de couverture. `focus` est le point gardé au recadrage (`object-position`). Pour le mur, `wall` liste les photos à y montrer.
5. **Vérifier** avec `npm run dev`. Une photo citée mais absente, ou copiée mais non décrite, arrête le build avec un message clair.

`SELECTION-PHOTOS.md` liste les photos publiées, les plaques floutées et les projets écartés.

## Bloc « Être rappelé »

Désactivé par défaut. Dans `src/content/site.ts` :

```ts
export const SHOW_CALLBACK = true;
```

Le formulaire (nom + téléphone) s'affiche dans la section « Passez nous voir. ». Mode démo : rien n'est envoyé. Pour la mise en ligne, le brancher sur Web3Forms (voir `05_STACK-TECHNIQUE/Config-Web3Forms`).

## Mesure des visites (mesure maison)

Module `mesure/` repris tel quel de Renovision (voir `mesure/README.md`) : compteurs anonymes, sans cookie, sans service tiers, un total par événement et par mois sur l'hébergement, et un e-mail de récapitulatif le 1er du mois. **Actif seulement en prod sur Hostinger** (`npm run build:prod`) : sur Netlify (maquette, préversions), ni script ni envoi.

| Événement | Déclencheur | Marquage |
| --- | --- | --- |
| `visite` | ouverture d'une page | automatique |
| `appel` | clic sur un lien `tel:` (12 liens : en-tête, hero, barre mobile, prestations, visionneuse, contact, pied de page) | `data-m="appel"` |
| `itineraire` | clic sur « Itinéraire » (hero, barre mobile, contact) | `data-m="itineraire"` |

Pas de `whatsapp` ni de `rdv` (rien de tel sur le site). `devis` s'ajoutera aux réglages quand le bloc « Être rappelé » enverra vraiment (voir `initCallback`, `src/scripts/sections.ts`). Réglages propres au site : `serveur/mesure-reglages.php`. Mise en ligne pas à pas chez Hostinger : `docs/MESURE.md`.

Vérifier : `npm run build && npm run mesure:verifier` (maquette : rien n'est compté) ; `npm run build:prod` (contrôle intégré). Bancs PHP : `MESURE_PHP="npx -y @php-wasm/cli@3.1.56" npm run mesure:php`.

## Déployer une préversion

Le dépôt contient `netlify.toml` et `vercel.json`. La préversion reste en `noindex` (balise meta + en-tête `X-Robots-Tag`).

**Netlify** : « Add new site » → « Import from Git » → choisir le dépôt `LABELLEETOILE`. Build : `npm run build`, dossier `dist` (déjà réglés). Ou, sans Git : `npm run build`, puis glisser le dossier `dist/` sur app.netlify.com/drop.

**Vercel** : « Add New Project » → importer le dépôt, les réglages sont lus dans `vercel.json`.

L'URL de la préversion est utilisée automatiquement pour les balises de partage (variables `URL` de Netlify / `VERCEL_URL`). Pour forcer une adresse : variable d'environnement `SITE_URL`.

## Avant la mise en ligne (après validation)

1. Retirer `<meta name="robots" content="noindex, nofollow">` dans `src/layouts/Layout.astro`, la règle `X-Robots-Tag` dans `public/_headers` et `vercel.json`, et le bandeau `MaquetteBanner` dans `src/layouts/Layout.astro`.
2. Renseigner `SITE_URL` (domaine définitif) et compléter les mentions légales.
3. Traiter chaque point de `A-VALIDER.md`.
4. Construire avec `npm run build:prod` et suivre `docs/MESURE.md` pour activer la mesure sur Hostinger.

## Logos

Les trois SVG (`logo-enseigne`, `logo-horizontal`, `logo-symbole`) et les favicons sont générés par `scripts/build-logos.mjs` d'après la photo de l'enseigne (`assets/reference/logo-enseigne.jpg`). Le texte est vectorisé (Montserrat). Le croissant et l'étoile s'animent en `stroke-dashoffset` (classes `lbe-moon-draw`, `lbe-star-a`, `lbe-star-b`). Si le client fournit le fichier vectoriel original de son enseigne, il remplace ce redessin.
