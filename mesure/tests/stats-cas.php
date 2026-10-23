<?php
// Banc de stats.php (mesure/tests/php-check.mjs) : simule une requête web puis inclut stats.php.
//   php mesure/tests/stats-cas.php <dossier des compteurs> '<$_SERVER en JSON>' '<$_GET en JSON>' '<$_POST en JSON>'
// En ligne de commande, header() n'émet rien : le banc lit le code de réponse et le corps affiché.
define('MESURE_DOSSIER', $argv[1]);
define('MESURE_REGLAGES', __DIR__ . '/reglages-test.php');
$_SERVER = array_merge(['REQUEST_METHOD' => 'GET'], json_decode($argv[2] ?? '{}', true) ?: []);
$_GET = json_decode($argv[3] ?? '{}', true) ?: [];
$_POST = json_decode($argv[4] ?? '{}', true) ?: [];
register_shutdown_function(function () {
	fwrite(STDERR, 'HTTP ' . http_response_code() . "\n");
});
require __DIR__ . '/../serveur/stats.php';
