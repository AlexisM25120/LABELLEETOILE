// Point d'entrée : écran d'accueil, hero, défilement doux, trace de pneus et sections.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { Hero } from "./hero";
import { runLoader } from "./loader";
import { Trace } from "./trace";
import { initAnchors, initBeforeAfter, initCallback, initCounters, initFades, initFaq, initGallery } from "./sections";
import { debounce, reducedMotion, storage } from "./util";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const html = document.documentElement;
const reduced = reducedMotion();
const heroEl = document.querySelector<HTMLElement>("[data-hero]")!;
const loaderEl = document.querySelector<HTMLElement>("[data-loader]");
const header = document.querySelector<HTMLElement>("[data-header]");
const mobileBar = document.querySelector<HTMLElement>("[data-mobile-bar]");
const playLoader = Boolean(loaderEl && !html.classList.contains("intro-seen"));

if (playLoader) {
	html.classList.add("is-loading");
	if ("scrollRestoration" in history) history.scrollRestoration = "manual";
	window.scrollTo(0, 0);
} else if (loaderEl) {
	loaderEl.style.display = "none";
}

// --- Défilement doux (désactivé si l'utilisateur préfère réduire les animations)
let lenis: Lenis | undefined;
if (!reduced) {
	lenis = new Lenis({ autoRaf: false, anchors: false, lerp: 0.11 });
	lenis.on("scroll", ScrollTrigger.update);
	gsap.ticker.add((t) => lenis!.raf(t * 1000));
	gsap.ticker.lagSmoothing(0);
	if (playLoader) lenis.stop();
}

// --- Hero
const hero = new Hero(heroEl, reduced);
hero.layout();
hero.introPrepare();
if (!reduced) hero.setupScroll();

// progression réelle du préchargement : polices + premières images
let fontsReady = 0;
let framesDone = 0;
let framesTotal = 1;
(document.fonts?.ready ?? Promise.resolve()).then(() => (fontsReady = 1));
const preload = hero.preload((d, t) => {
	framesDone = d;
	framesTotal = t;
});
const progress = () => (fontsReady + framesDone) / (1 + framesTotal);

// --- Trace de pneus
const traceLayer = document.querySelector<HTMLElement>("[data-trace-layer]");
const trace = traceLayer ? new Trace(traceLayer, hero, reduced) : null;
const steps = [...document.querySelectorAll<HTMLElement>("[data-step]")];
const arrival = document.querySelector<HTMLElement>("[data-arrival]");
if (trace) {
	trace.onHead = (head, done) => {
		for (const s of steps) {
			const y = s.getBoundingClientRect().top + window.scrollY + 12;
			s.classList.toggle("is-on", head >= y);
		}
		arrival?.classList.toggle("is-on", done);
	};
}
let lastY = -1;
gsap.ticker.add(() => {
	const y = window.scrollY;
	if (y !== lastY) {
		lastY = y;
		trace?.update(y);
		if (reduced) header?.classList.toggle("is-solid", y > 40);
	}
});

// --- En-tête : logo masqué tant que l'enseigne de la façade est à l'écran
hero.onProgress = (p1, p2) => {
	if (!header) return;
	const past = p2 >= 0.995;
	header.classList.toggle("is-solid", past);
	header.classList.toggle("logo-off", !past && !reduced);
};
hero.render();

// --- Sections
initCounters(reduced);
initFades(reduced);
initGallery(lenis);
initBeforeAfter(reduced);
initFaq(reduced);
initAnchors(lenis);
initCallback();

// --- Redimensionnement (largeur seulement : la barre d'adresse iOS ne doit rien recalculer)
let lastW = window.innerWidth;
window.addEventListener(
	"resize",
	debounce(() => {
		if (window.innerWidth === lastW) return;
		lastW = window.innerWidth;
		hero.layout();
		ScrollTrigger.refresh();
		trace?.build();
	}, 150),
);

// --- Démarrage
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function start() {
	if (playLoader && loaderEl) {
		await runLoader({ root: loaderEl, hero, progress, reduced });
		storage.set("lbe-intro", "1");
	} else {
		await Promise.race([preload, wait(1500)]);
		if (!reduced) gsap.fromTo(hero.zoom, { scale: 1.06 }, { scale: 1, duration: 1.4, ease: "power3.out", clearProps: "transform" });
	}
	hero.introReveal();
	html.classList.remove("is-loading");
	lenis?.start();
	mobileBar?.classList.add("is-on");
	hero.loadRest();
	ScrollTrigger.refresh();
	trace?.build();
	// les polices peuvent modifier la hauteur des sections : on recalcule une fois prêtes
	document.fonts?.ready.then(() => {
		ScrollTrigger.refresh();
		trace?.build();
	});
}

start();
