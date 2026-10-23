// Mesure des visites (mesure/README.md) : compteurs anonymes, sans cookie, sans identifiant, sans rien
// lire ni écrire dans le navigateur. Envoi vers le domaine lui-même (/m.php, CSP connect-src 'self').
// Chargé en prod seulement (Mesure.astro) ; rien ne part si le navigateur demande Do Not Track / GPC.
//   visite                ouverture d'une page (pas un rechargement, pas un retour arrière)
//   data-m="…"            clic sur un élément marqué : appel, whatsapp, itineraire…
//   data-m-envoi="…"      événement « mesure:envoi » émis par le formulaire une fois la demande partie
// Les noms acceptés sont ceux des réglages du site (mesure-reglages.php) : m.php écarte les autres.
{
	const n = navigator as Navigator & { globalPrivacyControl?: boolean };
	if (n.doNotTrack !== "1" && !n.globalPrivacyControl) {
		const m = (e?: string) => e && n.sendBeacon("/m.php", e);
		const entree = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
		if (!entree || entree.type === "navigate") m("visite");
		document.addEventListener("click", (e) => m((e.target as Element).closest?.<HTMLElement>("[data-m]")?.dataset.m));
		document.addEventListener("mesure:envoi", (e) => m((e.target as HTMLElement).dataset.mEnvoi));
	}
}
