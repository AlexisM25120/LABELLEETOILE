<?php
// Banc de rapport.php (mesure/tests/php-check.mjs) : même script, dossier des compteurs imposé.
//   php mesure/tests/rapport-essai.php --essai [--mois=AAAA-MM] <dossier des compteurs>
// (le dossier en dernier : getopt() s'arrête au premier argument qui n'est pas une option)
define('MESURE_DOSSIER', end($argv));
define('MESURE_REGLAGES', __DIR__ . '/reglages-test.php');
require __DIR__ . '/../serveur/rapport.php';
