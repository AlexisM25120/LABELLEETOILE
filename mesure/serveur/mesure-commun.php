<?php
// Mesure des visites (mesure/README.md) : réglages et lecture des compteurs, partagés par m.php,
// rapport.php et stats.php. Inclus seulement : appelé depuis le web, il répond 404.
//   mesure-reglages.php   à côté de ce fichier, propre au site (versionné) : nom, domaine, événements, adresses
//   MESURE_DOSSIER/config.php   facultatif, sur le serveur seulement (jamais versionné) : destinataire,
//                               expéditeur, mot de passe de stats.php
// Compteurs : un fichier JSON par mois (AAAA-MM.json) dans MESURE_DOSSIER, HORS du dossier public.

if (realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
	http_response_code(404);
	exit;
}
if (!defined('MESURE_DOSSIER')) define('MESURE_DOSSIER', dirname(__DIR__) . '/mesure-donnees');
date_default_timezone_set('Europe/Zurich');

/** Réglages du site, complétés par la configuration du serveur. */
function mesure_reglages(): array {
	static $r = null;
	if ($r !== null) return $r;
	$chemin = defined('MESURE_REGLAGES') ? MESURE_REGLAGES : __DIR__ . '/mesure-reglages.php';
	$site = is_file($chemin) ? (array) include $chemin : [];
	$serveur = is_file(MESURE_DOSSIER . '/config.php') ? (array) include MESURE_DOSSIER . '/config.php' : [];
	$r = array_merge(
		['nom' => '', 'domaine' => '', 'evenements' => ['visite' => 'Visites'], 'destinataire' => '', 'expediteur' => '', 'signature' => '', 'stats_mot_de_passe' => ''],
		$site,
		$serveur
	);
	return $r;
}

/** Compteurs d'un mois (AAAA-MM), null si aucun fichier. */
function mesure_mois(string $mois): ?array {
	$fichier = MESURE_DOSSIER . '/' . $mois . '.json';
	if (!preg_match('/^\d{4}-\d{2}$/', $mois) || !is_file($fichier)) return null;
	$compteurs = json_decode((string) file_get_contents($fichier), true);
	return is_array($compteurs) ? $compteurs : null;
}

/** Tous les mois comptés, du plus récent au plus ancien : ['2026-11' => [...], ...]. */
function mesure_tous_les_mois(): array {
	$mois = [];
	foreach (glob(MESURE_DOSSIER . '/*.json') ?: [] as $f) {
		$m = basename($f, '.json');
		$c = mesure_mois($m);
		if ($c !== null) $mois[$m] = $c;
	}
	krsort($mois);
	return $mois;
}

const MESURE_NOMS_MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

function mesure_nom_mois(string $mois): string {
	[$a, $m] = explode('-', $mois);
	return MESURE_NOMS_MOIS[(int) $m - 1] . ' ' . $a;
}
