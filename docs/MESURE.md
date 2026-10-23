# Mesure des visites (mesure maison)

Mise en place le 24/10/2026 à la place d'Umami (socle commun Alexo). Module repris tel quel de Renovision (`mesure/`, voir `mesure/README.md`) : aucun cookie, aucun compte tiers, aucun abonnement. Hébergement prévu : **Hostinger**. Tant que le site est sur Netlify (maquette, préversions), rien n'est compté.

Chaque 1er du mois, Alexo (`alexo.webdesign@gmail.com`, décision du 24/10/2026) reçoit un e-mail de trois lignes : visites, appels, itinéraires, comparés au mois précédent, à transmettre à Sébastien.

## Fonctionnement

| Pièce | Rôle |
| --- | --- |
| `mesure/client/mesure.ts` | Envoie le nom de l'événement à `/m.php` (`navigator.sendBeacon`, même domaine). Aucun cookie, aucun identifiant, rien lu ni écrit dans le navigateur. Rien ne part avec « Ne pas suivre » (Do Not Track, Global Privacy Control). |
| `mesure/client/Mesure.astro` | Charge le script, **en prod seulement** (`src/layouts/Layout.astro`, `PUBLIC_SITE_MODE=prod`). |
| `mesure/serveur/m.php` | Ajoute 1 au compteur du mois. Refuse ce qui n'est pas un POST du site lui-même, les robots et les noms absents des réglages. Ne garde ni IP, ni navigateur, ni heure. |
| `mesure/serveur/rapport.php` | Compose et envoie l'e-mail mensuel (`mail()` de PHP). Ligne de commande seulement (tâche planifiée) : depuis le web, il répond 404. |
| `mesure/serveur/stats.php` | Page protégée par mot de passe : totaux par mois, export CSV. |
| `mesure/copier.mjs` | Copie les PHP du module et `serveur/mesure-reglages.php` dans `dist/` pendant `npm run build:prod`, jamais pour Netlify. |
| `scripts/verifier-mesure.mjs` | Contrôle du build : chaque lien d'appel ou d'itinéraire porte son `data-m`, chaque nom est accepté par les réglages, PHP et script présents en prod et absents ailleurs. |

### Événements

Noms du socle commun Alexo, seulement ceux qui existent sur ce site.

| Événement | Déclencheur | Marquage |
| --- | --- | --- |
| `visite` | ouverture d'une page (un rechargement ou un retour arrière ne compte pas) | automatique |
| `appel` | clic sur un lien `tel:` | `data-m="appel"` |
| `itineraire` | clic sur « Itinéraire » | `data-m="itineraire"` |

Pas de `whatsapp` ni de `rdv` : rien de tel sur le site. `devis` : à ajouter dans `serveur/mesure-reglages.php` le jour où le bloc « Être rappelé » envoie vraiment (`data-m-envoi="devis"` sur le formulaire et l'événement `mesure:envoi` après l'envoi réussi, voir `initCallback` dans `src/scripts/sections.ts`).

Les mois suivent l'heure de Zurich, réglée dans le module : c'est la même que celle de Paris toute l'année.

### Données

Un fichier par mois, **hors du dossier public** : `/home/u…/domains/<domaine>/mesure-donnees/2026-11.json`, par exemple `{"visite":412,"appel":23,"itineraire":5}`. Rien d'autre n'est écrit.

## Ce qu'il faut faire à la main sur Hostinger (à la mise en ligne)

Domaine provisoire dans les réglages : `carrosserie-labelleetoile.fr` (à confirmer, `A-VALIDER.md`). Le remplacer dans `serveur/mesure-reglages.php` (`domaine`, `expediteur`) avant le build si Sébastien en choisit un autre.

1. **Mettre en ligne avec `npm run build:prod`** : `m.php`, `rapport.php`, `stats.php`, `mesure-commun.php` et `mesure-reglages.php` arrivent à la racine du site (`public_html`) avec le reste de `dist/`. Le build s'arrête si un lien n'est pas marqué ou si un PHP manque.
2. **Vérifier que PHP tourne** : ouvrir `https://<domaine>/m.php`. Page blanche = bon. Si du code s'affiche, PHP n'est pas actif.
3. **Vérifier que les compteurs s'écrivent** : ouvrir le site une fois (sans « Ne pas suivre »), puis hPanel → Fichiers → Gestionnaire de fichiers, chercher `domains/<domaine>/mesure-donnees/` et le fichier du mois. Noter le chemin exact (`/home/u12345678/…`), affiché en haut du gestionnaire de fichiers.
4. **Créer la tâche planifiée** : hPanel → Sites web → Tableau de bord → Avancé → **Tâches Cron**.
   - Type : **PHP**
   - Commande : `/home/u12345678/domains/<domaine>/public_html/rapport.php` (chemin noté à l'étape 3)
   - Planification : minute `0`, heure `6`, jour `1`, mois `*`, jour de la semaine `*` (heure UTC : 7 h ou 8 h en France, le 1er du mois).
5. **Tester l'e-mail sans attendre le 1er** : seconde tâche de type **Personnalisé**, commande `php /home/u12345678/domains/<domaine>/public_html/rapport.php --essai`, toutes les minutes. « Voir la sortie » affiche l'e-mail qui partira. **Supprimer cette tâche ensuite.**
6. **Page des chiffres** (`stats.php`) : créer avec le gestionnaire de fichiers `mesure-donnees/config.php`, avec un mot de passe choisi sur place (jamais dans le dépôt, un e-mail ou un message) :
   ```php
   <?php return ['stats_mot_de_passe' => 'une-phrase-longue-choisie-sur-place'];
   ```
   Puis ouvrir `https://<domaine>/stats.php`. Sans `config.php`, la page répond 404.
7. **Adresses** (facultatif) : par défaut l'e-mail part de `site@carrosserie-labelleetoile.fr` vers `alexo.webdesign@gmail.com`. Pour changer sans rebuild, ajouter `'destinataire' => '…', 'expediteur' => '…'` dans le même `config.php`.

Si le premier rapport n'arrive pas : regarder les spams, puis le journal `/home/u12345678/.logs/exim.log`. `mail()` est limité à 10 e-mails par minute et 100 par jour.

## Vérifier

```bash
npm run build && npm run mesure:verifier
```
Build Netlify : aucun PHP, aucun script d'envoi, tous les liens marqués.

```bash
npm run build:prod
```
Build Hostinger : PHP copiés, script présent, contrôle bloquant.

```bash
MESURE_PHP="npx -y @php-wasm/cli@3.1.56" npm run mesure:php
```
`m.php`, `rapport.php` et `stats.php` en ligne de commande, avec un PHP en WebAssembly (PHP n'est pas installé sur le Mac) et les réglages fictifs du module.

## Non confirmé

Écriture par PHP dans un dossier au-dessus de `public_html` (l'étape 3 le vérifie) ; arrivée de l'e-mail en boîte de réception plutôt qu'en spam, qui dépend du DNS du domaine (SPF) ; formule Hostinger exacte du client.
