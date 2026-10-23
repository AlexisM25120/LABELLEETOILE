<?php
// Réglages de la mesure des visites propres à la Carrosserie La Belle Étoile (module : mesure/README.md,
// mise en ligne : docs/MESURE.md). Copié à côté de m.php, rapport.php et stats.php par mesure/copier.mjs
// (npm run build:prod). Rien de secret ici : destinataire, expéditeur et mot de passe de stats.php peuvent
// être surchargés sur le serveur seulement, dans MESURE_DOSSIER/config.php (jamais versionné).
// Événements : noms du socle commun Alexo (appel, whatsapp, rdv, devis, itineraire), seulement ceux qui
// existent sur ce site. Pas de WhatsApp ni de prise de rendez-vous ; « devis » s'ajoutera quand le bloc
// « Être rappelé » sera branché sur un vrai envoi (SHOW_CALLBACK, src/content/site.ts). L'ordre est celui
// du rapport mensuel, du tableau de stats.php et du CSV.

if (realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
	http_response_code(404);
	exit;
}

return [
	'nom' => 'Carrosserie La Belle Étoile',
	// [À VALIDER] domaine provisoire (A-VALIDER.md, « Nom de domaine »)
	'domaine' => 'carrosserie-labelleetoile.fr',
	'evenements' => [
		'visite' => 'Visites',
		'appel' => 'Appels',
		'itineraire' => 'Itinéraires',
	],
	// [À VALIDER] e-mail affiché sur le site (A-VALIDER.md, « E-mail »)
	'destinataire' => 'carrosserielabelleetoile@gmail.com',
	'expediteur' => 'site@carrosserie-labelleetoile.fr',
	'signature' => 'Alexo Web Design',
];
