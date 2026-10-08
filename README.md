# Carrosserie La Belle Étoile — maquette V2

Site vitrine one-page de la Carrosserie La Belle Étoile (25 rue de la Gare, 25140 Charquemont).
Maquette à présenter au client le **lundi 12 octobre 2026**. Non publiée, `noindex`.

Stack : Astro (statique) · Tailwind CSS v4 · GSAP + ScrollTrigger · Lenis · polices auto-hébergées (@fontsource).

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
| `/?calage` | affiche les repères de calage du hero (enseigne, porte, traces) |

## Où sont les choses

| Quoi | Où |
| --- | --- |
| **Tous les textes** | `src/content/site.ts` (une seule source, typographie française ajoutée automatiquement) |
| Calage du hero (enseigne, porte, traces, durées) | `src/content/reglages.ts` |
| Photos | `assets/photos/` et `assets/photos/facebook/` |
| Images des vidéos du hero | `assets/frames/porte`, `porte-m`, `depart`, `depart-m` |
| Logos SVG | `src/logos/` (copiés dans `public/logo/`), générés par `npm run logos` |
| Ce qui reste à valider avec le client | `A-VALIDER.md` |

## Remplacer une photo

Déposez le nouveau fichier **avec le même nom** dans `assets/photos/` (l'extension peut changer : `facade.jpg` → `facade.webp` fonctionne). Astro régénère les versions AVIF/WebP au prochain `npm run dev` ou `npm run build`. Rien à toucher dans le code.

Photos utilisées : `facade` (hero et image de partage), `aile-rayee` + `bleu-estoril` (avant/après), `bmw-525i`, `cabine-protegee`, `pieces-cabine`, `serie3-pont` (section « Pourquoi »).

### Photos Facebook

Déposez-les dans `assets/photos/facebook/` en les nommant `<projet>-1.jpg`, `<projet>-2.jpg`… La galerie prend automatiquement la première photo trouvée pour chaque projet, sinon la photo de secours, sinon un visuel sobre « Photo à venir ».

Préfixes : `bmw-estoril`, `bmw-525i`, `bmw-e30`, `panamera-gts`, `super5-gt`, `ducati-996`, `cabine`, `pieces`. Pour la BMW bleu Estoril, une photo `bmw-estoril-1.jpg` remplace la photo « après » du comparateur.

## Déposer les images du hero

Tant que `assets/frames/` est vide, le hero de secours s'affiche : la photo de façade, une porte dessinée qui remonte au défilement, une voiture qui sort phares allumés et laisse ses traces.

Avec les vidéos Higgsfield (`porte.mp4`, `depart.mp4`) :

```bash
npm run frames -- porte.mp4 porte
npm run frames -- depart.mp4 depart
```

Le script (ffmpeg + cwebp) produit 60 images WebP par séquence, en 1600 px (ordinateur) et 900 px (mobile). Le site compte lui-même les images présentes : on peut en mettre plus ou moins.

Ensuite, **caler l'enseigne** : ouvrez `/?calage`, le rectangle rouge doit couvrir l'enseigne de la vidéo. Ajustez `frames.desktop.sign` et `frames.mobile.sign` dans `src/content/reglages.ts` (valeurs en fraction de l'image), ainsi que `traceFrom` / `traceExit` (points jaunes : un point sur les traces de pneus et l'endroit où elles sortent du cadre).

Budget : 3 Mo maximum par séquence en 1600 px, 1,5 Mo en 900 px (baisser la qualité dans `scripts/extract-frames.sh` si besoin).

## Bloc « Être rappelé »

Désactivé par défaut. Dans `src/content/site.ts` :

```ts
export const SHOW_CALLBACK = true;
```

Le formulaire (nom + téléphone) s'affiche dans la section « Passez nous voir. ». Mode démo : rien n'est envoyé. Pour la mise en ligne, le brancher sur Web3Forms (voir `05_STACK-TECHNIQUE/Config-Web3Forms`).

## Déployer une préversion

Le dépôt contient `netlify.toml` et `vercel.json`. La préversion reste en `noindex` (balise meta + en-tête `X-Robots-Tag`).

**Netlify** : « Add new site » → « Import from Git » → choisir le dépôt `LABELLEETOILE`. Build : `npm run build`, dossier `dist` (déjà réglés). Ou, sans Git : `npm run build`, puis glisser le dossier `dist/` sur app.netlify.com/drop.

**Vercel** : « Add New Project » → importer le dépôt, les réglages sont lus dans `vercel.json`.

L'URL de la préversion est utilisée automatiquement pour les balises de partage (variables `URL` de Netlify / `VERCEL_URL`). Pour forcer une adresse : variable d'environnement `SITE_URL`.

## Avant la mise en ligne (après validation)

1. Retirer `<meta name="robots" content="noindex, nofollow">` dans `src/layouts/Layout.astro`, la règle `X-Robots-Tag` dans `public/_headers` et `vercel.json`, et le bandeau `MaquetteBanner` dans `src/layouts/Layout.astro`.
2. Renseigner `SITE_URL` (domaine définitif) et compléter les mentions légales.
3. Traiter chaque point de `A-VALIDER.md`.

## Logos

Les trois SVG (`logo-enseigne`, `logo-horizontal`, `logo-symbole`) et les favicons sont générés par `scripts/build-logos.mjs` d'après la photo de l'enseigne (`assets/reference/logo-enseigne.jpg`). Le texte est vectorisé (Montserrat). Le croissant et l'étoile s'animent en `stroke-dashoffset` (classes `lbe-moon-draw`, `lbe-star-a`, `lbe-star-b`). Si le client fournit le fichier vectoriel original de son enseigne, il remplace ce redessin.
