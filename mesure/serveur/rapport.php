<?php
// Mesure des visites (mesure/README.md) : e-mail mensuel, une ligne par événement des réglages
// (visites, appels, WhatsApp, demandes de devis…), mois écoulé comparé au précédent. Lancé le 1er du
// mois par la tâche planifiée de l'hébergeur (type PHP, donc en ligne de commande) ; refusé depuis le web.
//   php rapport.php                   envoie le rapport du mois écoulé
//   php rapport.php --essai           affiche l'e-mail sans l'envoyer
//   php rapport.php --mois=2026-11    rapport d'un mois donné

if (PHP_SAPI !== 'cli') {
	http_response_code(404);
	exit;
}
require __DIR__ . '/mesure-commun.php';

$r = mesure_reglages();
$options = getopt('', ['essai', 'mois:']);
$mois = new DateTimeImmutable(isset($options['mois']) ? $options['mois'] . '-01' : 'first day of last month');
$avant = $mois->modify('first day of last month');
$ce = mesure_mois($mois->format('Y-m'));
$pre = mesure_mois($avant->format('Y-m'));
$nomAvant = explode(' ', mesure_nom_mois($avant->format('Y-m')))[0];

$lignes = [];
foreach ($r['evenements'] as $cle => $libelle) {
	$n = (int) ($ce[$cle] ?? 0);
	$ligne = $libelle . ' : ' . $n;
	if ($pre !== null) {
		$p = (int) ($pre[$cle] ?? 0);
		$ecart = $n - $p;
		$ligne .= ' (' . $nomAvant . ' : ' . $p . ', ' . ($ecart > 0 ? '+' : ($ecart < 0 ? '−' : '±')) . abs($ecart) . ')';
	}
	$lignes[] = $ligne;
}

$periode = mesure_nom_mois($mois->format('Y-m'));
$corps = "Bonjour,\n\nLe site {$r['domaine']} en $periode :\n\n" . implode("\n", $lignes) . "\n\n";
if ($ce === null) {
	$corps .= "Attention : aucun compteur pour ce mois. Si le site était en ligne, prévenir {$r['signature']}.\n\n";
}
$corps .= "Compteurs anonymes, sans cookie (voir la politique de confidentialité du site).\nMessage automatique envoyé le 1er de chaque mois.\n";
$sujet = 'Votre site en ' . $periode;
$entetes = implode("\r\n", [
	'From: Site ' . $r['nom'] . ' <' . $r['expediteur'] . '>',
	'MIME-Version: 1.0',
	'Content-Type: text/plain; charset=UTF-8',
	'Content-Transfer-Encoding: 8bit',
]);

if (isset($options['essai'])) {
	echo "À : {$r['destinataire']}\nObjet : $sujet\n\n$corps";
	exit(0);
}
$ok = mail($r['destinataire'], '=?UTF-8?B?' . base64_encode($sujet) . '?=', $corps, $entetes);
echo ($ok ? 'Rapport envoyé' : 'ÉCHEC de l\'envoi') . " ($periode, {$r['destinataire']})\n";
exit($ok ? 0 : 1);
