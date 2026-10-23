# Module de mesure des visites (Alexo)

Compteurs anonymes, sans cookie, sans service tiers : pages ouvertes et clics utiles (appel, WhatsApp, devis, itinéraire…), un total par événement et par mois. Aucun bandeau cookies nécessaire, CSP stricte inchangée (`script-src 'self'`, `connect-src 'self'`).

Ce dossier ne contient rien de propre à un client : il se copie tel quel sur un autre site. Le site fournit ses réglages (un fichier PHP) et marque ses liens.

## Contenu

| Fichier | Rôle |
|---|---|
| `client/mesure.ts` | Script navigateur (≈ 350 octets). Envoie `visite` à l'ouverture d'une page, puis le nom porté par `data-m` à chaque clic, et `data-m-envoi` quand le formulaire émet `mesure:envoi`. Rien avec Do Not Track ou Global Privacy Control. |
| `client/Mesure.astro` | Charge le script. À rendre **en prod seulement**. |
| `serveur/m.php` | `POST /m.php` : +1 au compteur du mois. Refuse les autres sites, les robots, les GET et tout nom absent des réglages. Ne garde ni IP, ni navigateur, ni heure. |
| `serveur/rapport.php` | E-mail mensuel (tâche planifiée, ligne de commande seulement) : une ligne par événement, comparée au mois précédent. |
| `serveur/stats.php` | Page protégée par mot de passe : tableau des totaux par mois, export CSV (séparateur `;`, Excel / Numbers). |
| `serveur/mesure-commun.php` | Réglages et lecture des compteurs, partagés par les trois scripts. |
| `copier.mjs` | Après le build de prod : copie les PHP du module et les réglages du site à la racine du build. |
| `tests/` | Bancs PHP avec des réglages fictifs : `node mesure/tests/php-check.mjs`. |

Les compteurs sont un fichier JSON par mois (`2026-11.json` : `{"visite":412,"appel":23,…}`) dans `mesure-donnees/`, **au-dessus** du dossier public (`public_html`).

## Installer sur un autre site (Astro)

1. Copier le dossier `mesure/` à la racine du dépôt.
2. Créer les réglages du site, par exemple `serveur/mesure-reglages.php` (modèle : `tests/reglages-test.php`) :
   ```php
   <?php
   if (realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) { http_response_code(404); exit; }
   return [
       'nom' => 'Nom du client',
       'domaine' => 'client.ch',
       // Socle Alexo : appel, whatsapp, rdv, devis, itineraire — ne garder que ce qui existe sur le site
       'evenements' => ['visite' => 'Visites', 'appel' => 'Appels', 'devis' => 'Demandes de devis'],
       'destinataire' => 'client@exemple.ch',
       'expediteur' => 'site@client.ch',
       'signature' => 'Alexo Web Design',
   ];
   ```
3. Dans le gabarit : `{isProd && <Mesure />}` avec `import Mesure from "../../mesure/client/Mesure.astro"`.
4. Marquer les liens : `data-m="appel"` sur chaque `tel:`, `data-m="whatsapp"`, `data-m="rdv"`, `data-m="itineraire"`… Formulaire : `data-m-envoi="devis"` sur le `<form>`, et une fois la demande réellement partie : `form.dispatchEvent(new Event("mesure:envoi", { bubbles: true }))`.
5. Build de prod : `astro build && node mesure/copier.mjs dist serveur/mesure-reglages.php`.
6. Politique de confidentialité : dire ce qui est compté (modèle dans `src/data/content.ts` de Renovision, `legal`, « Cookies et mesure d'audience »).

Un nom marqué dans le HTML mais absent des réglages est écarté sans bruit par `m.php` : le preflight du site devrait le vérifier (exemple : `scripts/preflight.mjs` de Renovision).

## Hébergement

PHP 7.4 ou plus, `mail()` pour le rapport, une tâche planifiée mensuelle. Un hébergement statique (Netlify) ne compte rien : c'est pour ça que `copier.mjs` ne tourne qu'en prod. Mise en place pas à pas chez Hostinger : `docs/MESURE.md` du dépôt Renovision.

## Lire les chiffres

- **Page protégée** : `https://<domaine>/stats.php`. Le mot de passe se met **sur le serveur seulement**, dans `mesure-donnees/config.php` (gestionnaire de fichiers de l'hébergeur), jamais dans le dépôt ni dans un message :
  ```php
  <?php return ['stats_mot_de_passe' => 'une-phrase-longue-choisie-sur-place'];
  ```
  Sans ce fichier, la page répond 404. Un hachage `password_hash()` est aussi accepté. Mauvais mot de passe : 2 s d'attente. Le lien CSV de la page est valable une heure et ne contient pas le mot de passe.
- **E-mail** : le 1er du mois, `rapport.php` envoie le mois écoulé au destinataire des réglages (surchargeable dans `config.php` : `destinataire`, `expediteur`).
