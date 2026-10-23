// Mesure d'audience Umami (sans cookies) : un événement par clic sur une action de contact.
// Le script Umami n'est chargé que si PUBLIC_UMAMI_WEBSITE_ID est défini (voir Layout.astro).
type Umami = { track: (event: string) => void };

const RULES: [selector: string, event: string][] = [
	['a[href^="tel:"]', "appel"],
	['a[href*="wa.me/"], a[href*="api.whatsapp.com"]', "whatsapp"],
	["a[data-rdv]", "rdv"],
	['a[href*="google.com/maps"]', "itineraire"],
];

function track(event: string) {
	(window as { umami?: Umami }).umami?.track(event);
}

export function initMesure() {
	document.addEventListener(
		"click",
		(e) => {
			const a = (e.target as Element | null)?.closest?.("a");
			if (!a) return;
			const rule = RULES.find(([sel]) => a.matches(sel));
			if (rule) track(rule[1]);
		},
		{ capture: true },
	);
}

/** Formulaire envoyé (demande de devis ou de rappel) */
export const trackForm = () => track("devis");
