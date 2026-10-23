<?php
// Mesure des visites (mesure/README.md) : page protégée par mot de passe, un tableau des totaux par
// événement et par mois, plus l'export CSV (séparateur « ; », ouvrable dans Excel ou Numbers).
//   https://<domaine>/stats.php          formulaire, puis tableau
//   POST stats.php (mot de passe)        tableau + lien CSV valable une heure (jeton, sans mot de passe)
//   stats.php?csv&jeton=…                fichier mesure-<domaine>.csv
//   stats.php?css                        feuille de style de la page (CSP style-src 'self', aucun style inline)
// Mot de passe : 'stats_mot_de_passe' dans MESURE_DOSSIER/config.php, sur le serveur seulement, en clair
// ou en hachage password_hash(). Sans mot de passe configuré, la page répond 404.

require __DIR__ . '/mesure-commun.php';

$r = mesure_reglages();
$secret = (string) $r['stats_mot_de_passe'];

header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow');

if (isset($_GET['css'])) {
	header('Content-Type: text/css; charset=utf-8');
	echo 'body{margin:0;padding:32px 16px;font:15px/1.5 system-ui,sans-serif;background:#0a0a0a;color:#f5f5f5}'
		. 'main{max-width:960px;margin:0 auto}h1{font-size:20px;font-weight:600;margin:0 0 4px}p{color:#a3a3a3;margin:0 0 24px}'
		. 'form{display:flex;flex-wrap:wrap;gap:12px;align-items:center}label{color:#a3a3a3}'
		. 'input{font:inherit;padding:10px 12px;border:1px solid #404040;border-radius:8px;background:#161616;color:inherit}'
		. 'button,a.btn{font:inherit;padding:10px 18px;border:0;border-radius:999px;background:#f5943b;color:#0a0a0a;text-decoration:none;cursor:pointer}'
		. '.tableau{overflow-x:auto;margin-bottom:24px}table{border-collapse:collapse;width:100%;font-variant-numeric:tabular-nums}'
		. 'th,td{padding:10px 12px;border-bottom:1px solid #262626;text-align:right;white-space:nowrap}th:first-child,td:first-child{text-align:left}'
		. 'thead th{color:#a3a3a3;font-weight:500}.erreur{color:#fb4b34}';
	exit;
}
if ($secret === '') {
	http_response_code(404);
	exit;
}

$jeton = function (int $heure) use ($secret): string {
	return hash_hmac('sha256', 'csv-' . $heure, $secret);
};
$heure = intdiv(time(), 3600);

// --- Export CSV : jeton de l'heure en cours ou de la précédente ----------------------------------
if (isset($_GET['csv'])) {
	$recu = (string) ($_GET['jeton'] ?? '');
	if (!hash_equals($jeton($heure), $recu) && !hash_equals($jeton($heure - 1), $recu)) {
		http_response_code(403);
		exit;
	}
	header('Content-Type: text/csv; charset=utf-8');
	header('Content-Disposition: attachment; filename="mesure-' . preg_replace('/[^a-z0-9.-]/i', '', $r['domaine'] ?: 'site') . '.csv"');
	$sortie = fopen('php://output', 'w');
	fwrite($sortie, "\xEF\xBB\xBF");
	fputcsv($sortie, array_merge(['Mois'], array_values($r['evenements'])), ';', '"', '');
	foreach (mesure_tous_les_mois() as $mois => $c) {
		$ligne = [$mois];
		foreach (array_keys($r['evenements']) as $cle) $ligne[] = (int) ($c[$cle] ?? 0);
		fputcsv($sortie, $ligne, ';', '"', '');
	}
	fclose($sortie);
	exit;
}

$h = function (string $s): string {
	return htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
};
$verifie = function (string $saisi) use ($secret): bool {
	return preg_match('/^\$(2y|argon2)/', $secret) ? password_verify($saisi, $secret) : hash_equals($secret, $saisi);
};

$ok = false;
$erreur = false;
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
	$ok = $verifie((string) ($_POST['mot_de_passe'] ?? ''));
	if (!$ok) {
		sleep(2);
		$erreur = true;
		http_response_code(403);
	}
}

header('Content-Type: text/html; charset=utf-8');
?>
<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Mesure · <?= $h($r['nom']) ?></title>
<link rel="stylesheet" href="stats.php?css">
</head>
<body>
<main>
<h1>Mesure des visites · <?= $h($r['nom']) ?></h1>
<?php if (!$ok): ?>
<p>Totaux par mois, sans cookie ni donnée personnelle.</p>
<form method="post" action="stats.php">
<label for="mdp">Mot de passe</label>
<input id="mdp" name="mot_de_passe" type="password" autocomplete="current-password" required autofocus>
<button type="submit">Afficher</button>
</form>
<?php if ($erreur): ?><p class="erreur" role="alert">Mot de passe incorrect.</p><?php endif; ?>
<?php else: $tous = mesure_tous_les_mois(); ?>
<p><?= $tous ? count($tous) . ' mois comptés, du plus récent au plus ancien.' : 'Aucun compteur pour l’instant.' ?></p>
<div class="tableau">
<table>
<thead><tr><th scope="col">Mois</th><?php foreach ($r['evenements'] as $libelle): ?><th scope="col"><?= $h($libelle) ?></th><?php endforeach; ?></tr></thead>
<tbody>
<?php foreach ($tous as $mois => $c): ?>
<tr><th scope="row"><?= $h(mesure_nom_mois($mois)) ?></th><?php foreach (array_keys($r['evenements']) as $cle): ?><td><?= (int) ($c[$cle] ?? 0) ?></td><?php endforeach; ?></tr>
<?php endforeach; ?>
</tbody>
</table>
</div>
<a class="btn" href="stats.php?csv&amp;jeton=<?= $h($jeton($heure)) ?>">Télécharger le CSV</a>
<?php endif; ?>
</main>
</body>
</html>
