<?php
// Mesure des visites (mesure/README.md) : reçoit le nom d'un événement envoyé par mesure/client/mesure.ts
// (navigator.sendBeacon, même domaine) et ajoute 1 au compteur du mois. Rien d'autre n'est lu ni
// gardé : ni adresse IP, ni navigateur, ni identifiant, ni heure. Le User-Agent sert seulement, en
// mémoire, à écarter les robots ; il n'est écrit nulle part.
// Événements acceptés : les clés de 'evenements' dans mesure-reglages.php, tout le reste est écarté.

require __DIR__ . '/mesure-commun.php';

const MESURE_ROBOTS = '/bot|crawl|spider|slurp|headless|lighthouse|preview|monitor|curl|wget|python|java\//i';

header('Cache-Control: no-store');
http_response_code(204);

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') exit;
// Envoi du site lui-même (en-tête posé par le navigateur) ; les clients sans cet en-tête passent
if (isset($_SERVER['HTTP_SEC_FETCH_SITE']) && $_SERVER['HTTP_SEC_FETCH_SITE'] !== 'same-origin') exit;
if (preg_match(MESURE_ROBOTS, $_SERVER['HTTP_USER_AGENT'] ?? 'robot')) exit;

$evenement = trim((string) file_get_contents('php://input', false, null, 0, 32));
if (!array_key_exists($evenement, mesure_reglages()['evenements'])) exit;

if (!is_dir(MESURE_DOSSIER) && !@mkdir(MESURE_DOSSIER, 0700, true) && !is_dir(MESURE_DOSSIER)) {
	error_log('mesure : dossier ' . MESURE_DOSSIER . ' impossible à créer');
	exit;
}
$fichier = MESURE_DOSSIER . '/' . date('Y-m') . '.json';
$f = @fopen($fichier, 'c+');
if (!$f) {
	error_log('mesure : ' . $fichier . ' impossible à ouvrir');
	exit;
}
if (flock($f, LOCK_EX)) {
	$compteurs = json_decode(stream_get_contents($f) ?: '{}', true);
	if (!is_array($compteurs)) $compteurs = [];
	$compteurs[$evenement] = ($compteurs[$evenement] ?? 0) + 1;
	ftruncate($f, 0);
	rewind($f);
	fwrite($f, json_encode($compteurs));
	fflush($f);
	flock($f, LOCK_UN);
}
fclose($f);
