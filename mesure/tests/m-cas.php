<?php
// Banc de m.php (mesure/tests/php-check.mjs) : simule une requête puis inclut m.php.
//   php mesure/tests/m-cas.php <dossier des compteurs> <corps> '<$_SERVER en JSON>'
// php://input est remplacé par le corps donné (en ligne de commande, il est toujours vide).
define('MESURE_DOSSIER', $argv[1]);
define('MESURE_REGLAGES', __DIR__ . '/reglages-test.php');
$GLOBALS['corps'] = $argv[2];
$_SERVER = array_merge(
	['REQUEST_METHOD' => 'POST', 'HTTP_SEC_FETCH_SITE' => 'same-origin', 'HTTP_USER_AGENT' => 'Mozilla/5.0 (Macintosh) Firefox/140.0'],
	json_decode($argv[3] ?? '{}', true) ?: []
);

class EntreeSimulee {
	public $context;
	private $pos = 0;
	public function stream_open($chemin, $mode, $options, &$ouvert) { return $chemin === 'php://input'; }
	public function stream_read($n) {
		$r = substr($GLOBALS['corps'], $this->pos, $n);
		$this->pos += strlen($r);
		return $r;
	}
	public function stream_eof() { return $this->pos >= strlen($GLOBALS['corps']); }
	public function stream_stat() { return []; }
}
stream_wrapper_unregister('php');
stream_wrapper_register('php', 'EntreeSimulee');

require __DIR__ . '/../serveur/m.php';
