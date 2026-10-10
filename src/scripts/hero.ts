// Hero au défilement : séquences canvas, ou scène de secours (photo + porte CSS + voiture).
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FrameSequence, type FrameSet } from "./sequence";
import { catmullRom, clamp, cover, easeInOut, isMobile, lerp, pointAt, range, ribbonPath, sampleBeziers, svgEl, type Box, type Pt, type Sample } from "./util";

type Rect = { x: number; y: number; w: number; h: number };
type SceneSetup = { focus: Pt; sign: Rect; door: Rect; traceFrom: Pt; traceExit: Pt; marks?: Pt[][] };
type Setup = {
	facade: { desktop: SceneSetup; mobile: SceneSetup };
	frames: { desktop: SceneSetup; mobile: SceneSetup };
	scroll: { porte: number; depart: number };
	timing: {
		h1Out: [number, number];
		mottoIn: [number, number];
		mottoOut: [number, number];
		doorOpen: [number, number];
		headlightsOn: number;
		carLeaves: [number, number];
		traceStart: number;
		preloadFrames: number;
	};
	facadeSize: { width: number; height: number };
};
type Manifest = {
	porte: { desktop: FrameSet | null; mobile: FrameSet | null };
	depart: { desktop: FrameSet | null; mobile: FrameSet | null };
};

const CAR_RATIO = 132 / 240;

/** Dimensions de la trace de pneus du site, partagées avec trace.ts */
export function traceMetrics(width = window.innerWidth) {
	if (width < 768) return { pair: false, spacing: 0, width: 12, lane: 8, opacity: 0.1 };
	return { pair: true, spacing: clamp(width * 0.05, 40, 70), width: clamp(width * 0.016, 14, 22), lane: 0, opacity: 0.14 };
}

export class Hero {
	root: HTMLElement;
	stage: HTMLElement;
	zoom: HTMLElement;
	scene: HTMLElement;
	sign: HTMLElement;
	fx: SVGSVGElement;
	carOut: HTMLElement;
	carIn: HTMLElement | null;
	copy: HTMLElement;
	motto: HTMLElement;
	mottoWords: HTMLElement[];
	hint: HTMLElement;
	poster: HTMLImageElement | null;
	setup: Setup;
	manifest: Manifest;
	mode: "frames" | "fallback";
	variant: "desktop" | "mobile";
	sceneSetup!: SceneSetup;
	media = { w: 16, h: 9 };
	view = { scale: 1, x: 0, y: 0, w: 0, h: 0, W: 0, H: 0 };
	seq1?: FrameSequence;
	seq2?: FrameSequence;
	p1 = 0;
	p2 = 0;
	reduced: boolean;
	copyLocked = true;
	onProgress?: (p1: number, p2: number) => void;

	// géométrie écran (traces, voiture)
	private carPath: Sample[] = [];
	private exitLen = 0;
	private carStart: Box = { x: 0, y: 0, w: 0, h: 0 };
	private marksMask?: SVGPathElement;
	private bridgeMask?: SVGPathElement;
	private bridgeFrom = 0;
	private exitPoint: Pt = { x: 0, y: 0 };
	exitDir: Pt = { x: 0, y: 1 };
	/** Demi-écartement des traces à la sortie du hero (la trace du site part de là et se resserre) */
	exitHalf = 0;
	/** Traces dorées posées sur les traces réelles de la vidéo */
	private markMasks: SVGPathElement[] = [];
	private calage: HTMLElement;
	private doorPanel: HTMLElement | null;
	private interior: HTMLElement | null;
	private spill: HTMLElement | null;
	private leak: HTMLElement | null;
	private smoke: HTMLElement | null;

	constructor(root: HTMLElement, reduced: boolean) {
		this.root = root;
		this.reduced = reduced;
		this.stage = root.querySelector("[data-stage]")!;
		this.zoom = root.querySelector("[data-zoom]")!;
		this.scene = root.querySelector("[data-scene]")!;
		this.sign = root.querySelector("[data-sign]")!;
		this.fx = root.querySelector("[data-fx]")!;
		this.carOut = root.querySelector(".car-out")!;
		this.carIn = root.querySelector(".car-in");
		this.copy = root.querySelector("[data-hero-copy]")!;
		this.motto = root.querySelector("[data-motto]")!;
		this.mottoWords = [...this.motto.querySelectorAll<HTMLElement>(".motto-word")];
		this.hint = root.querySelector("[data-hint]")!;
		this.poster = root.querySelector("img[data-poster]");
		this.calage = root.querySelector("[data-calage]")!;
		this.doorPanel = root.querySelector("[data-door-panel]");
		this.interior = root.querySelector(".interior");
		this.spill = root.querySelector("[data-spill]");
		this.leak = root.querySelector("[data-door-leak]");
		this.smoke = root.querySelector("[data-smoke]");
		this.setup = JSON.parse(root.dataset.setup!);
		this.manifest = JSON.parse(root.dataset.manifest!);
		this.variant = isMobile() ? "mobile" : "desktop";

		const porte = this.pick(this.manifest.porte);
		this.mode = porte ? "frames" : "fallback";
		root.dataset.mode = this.mode;
		// sert au CSS (couleur du panneau de l'enseigne, aussi sur l'écran d'accueil)
		document.documentElement.dataset.heroMode = this.mode;

		if (porte) {
			const canvases = root.querySelectorAll<HTMLCanvasElement>("[data-canvas]");
			this.seq1 = new FrameSequence(canvases[0], porte);
			const depart = this.pick(this.manifest.depart);
			if (depart) this.seq2 = new FrameSequence(canvases[1], depart);
			this.media = { w: porte.width, h: porte.height };
			this.sceneSetup = this.setup.frames[this.variant];
		} else {
			this.media = { w: this.setup.facadeSize.width, h: this.setup.facadeSize.height };
			this.sceneSetup = this.setup.facade[this.variant];
		}
		for (const s of [this.seq1, this.seq2]) if (s) s.focus = this.sceneSetup.focus;
		if (this.seq1) this.seq1.onDraw = () => this.root.classList.add("poster-off");
	}

	/** Dossier mobile si présent sur petit écran, sinon desktop (et inversement) */
	private pick(set: { desktop: FrameSet | null; mobile: FrameSet | null }) {
		return this.variant === "mobile" ? set.mobile || set.desktop : set.desktop || set.mobile;
	}

	get seq1Px() {
		return (this.setup.scroll.porte / 100) * this.stage.offsetHeight;
	}
	get seq2Px() {
		return (this.setup.scroll.depart / 100) * this.stage.offsetHeight;
	}

	/** Préchargement pour l'écran d'accueil : première partie de la séquence 1, ou la photo */
	preload(onProgress: (done: number, total: number) => void): Promise<void> {
		if (this.mode === "frames" && this.seq1 && this.reduced) {
			// mouvement réduit : une seule image fixe, la dernière de la porte (phares allumés)
			return this.seq1.load(this.seq1.count - 1, this.seq1.count, 0, () => onProgress(1, 1)).then(() => undefined);
		}
		if (this.mode === "frames" && this.seq1) {
			// 1 image sur `step`, répartie sur toute la séquence 1 (chargement du grossier au fin)
			const step = Math.max(1, Math.floor(this.seq1.count / this.setup.timing.preloadFrames));
			const n = Math.ceil(this.seq1.count / step);
			let done = 0;
			const first = this.seq1.load(0, this.seq1.count, 0, () => onProgress(++done, n), step);
			return first.then(() => undefined);
		}
		const img = this.poster;
		if (!img || (img.complete && img.naturalWidth)) {
			onProgress(1, 1);
			return Promise.resolve();
		}
		return new Promise((resolve) => {
			const done = () => {
				onProgress(1, 1);
				resolve();
			};
			img.addEventListener("load", done, { once: true });
			img.addEventListener("error", done, { once: true });
		});
	}

	/** Reste de la séquence 1 puis séquence 2, en arrière-plan */
	loadRest() {
		if (!this.seq1 || this.reduced) return;
		// Les deux séquences en parallèle : la file partagée sert d'abord le grossier des deux, puis le fin
		this.seq1.load(0, this.seq1.count, 1);
		this.seq2?.load(0, this.seq2.count, 2);
	}

	sceneToScreen(p: Pt): Pt {
		return { x: this.view.x + p.x * this.view.w, y: this.view.y + p.y * this.view.h };
	}

	rectToScreen(r: Rect): Box {
		const a = this.sceneToScreen({ x: r.x, y: r.y });
		return { x: a.x, y: a.y, w: r.w * this.view.w, h: r.h * this.view.h };
	}

	/** Rectangle du logo posé sur l'enseigne, à l'écran (zoom 1) */
	signRect(): Box {
		return this.logoBox ?? this.rectToScreen(this.sceneSetup.sign);
	}

	/** Logo réduit quand l'enseigne déborde de l'écran (mobile en portrait) */
	private logoBox: Box | null = null;

	private fitLogo() {
		const svg = this.sign.querySelector<SVGSVGElement>("svg");
		if (!svg) return;
		const R = this.rectToScreen(this.sceneSetup.sign);
		const margin = 12;
		const left = Math.max(R.x, margin);
		const right = Math.min(R.x + R.w, this.view.W - margin);
		this.logoBox = null;
		svg.removeAttribute("style");
		if (this.mode !== "frames" || right - left >= R.w - 1) return;
		// l'enseigne est plus large que l'écran : le panneau reste pleine largeur, le logo tient dans la partie visible
		const aspect = svg.viewBox.baseVal.width / svg.viewBox.baseVal.height || 1000 / 256;
		const h = Math.min(R.h, (right - left) / aspect);
		const w = h * aspect;
		const x = left + (right - left - w) / 2;
		const y = R.y + (R.h - h) / 2;
		this.logoBox = { x, y, w, h };
		Object.assign(svg.style, { position: "absolute", left: `${x - R.x}px`, top: `${y - R.y}px`, width: `${w}px`, height: `${h}px` });
	}

	layout() {
		const W = this.stage.clientWidth;
		const H = this.stage.clientHeight;
		const f = this.sceneSetup.focus;
		const c = cover(this.media.w, this.media.h, W, H, f.x, f.y);
		// Photo de secours sur grand écran : l'enseigne juste sous l'en-tête, un maximum de sol en bas
		if (this.mode === "fallback" && this.variant === "desktop" && c.h > H) {
			const header = document.querySelector<HTMLElement>("[data-header]");
			const safeTop = (header ? header.getBoundingClientRect().bottom : 100) + 14;
			c.y = clamp(safeTop - this.sceneSetup.sign.y * c.h, H - c.h, 0);
		}
		this.view = { ...c, W, H };
		Object.assign(this.scene.style, {
			left: `${c.x}px`,
			top: `${c.y}px`,
			width: `${c.w}px`,
			height: `${c.h}px`,
		});
		this.scene.classList.add("is-placed");
		// bord gauche de la porte à l'écran : le titre se cale à sa gauche sur grand écran
		// (--inner-left : décalage du conteneur centré, pour caler le texte sur le bord de l'écran)
		const door = this.rectToScreen(this.sceneSetup.door);
		const inner = this.root.querySelector<HTMLElement>(".hero-ui-inner");
		const offset = inner ? inner.getBoundingClientRect().left : 0;
		this.root.style.setProperty("--door-x", `${Math.round(door.x)}px`);
		this.root.style.setProperty("--inner-left", `${Math.round(offset)}px`);
		// en mode images, l'enseigne suit les réglages « frames »
		const s = this.sceneSetup.sign;
		Object.assign(this.sign.style, { left: `${s.x * 100}%`, top: `${s.y * 100}%`, width: `${s.w * 100}%`, height: `${s.h * 100}%` });
		this.fitLogo();
		this.seq1?.resize(W, H);
		this.seq2?.resize(W, H);
		this.buildFx();
		this.render();
		if (new URLSearchParams(location.search).has("calage")) this.drawCalage();
	}

	/** Point de départ de la trace du site, en coordonnées document */
	traceStart(): Pt {
		const top = this.root.getBoundingClientRect().top + window.scrollY;
		return { x: this.exitPoint.x, y: top + this.root.offsetHeight };
	}

	// ---------------------------------------------------------------------------
	// Traces au sol dans le hero (écran) : noires (secours) + départ doré de la trace du site
	private buildFx() {
		const { W, H } = this.view;
		const m = traceMetrics(W);
		const lane = m.pair ? null : m.lane;
		this.fx.replaceChildren();
		this.fx.setAttribute("viewBox", `0 0 ${W} ${H}`);
		const defs = svgEl("defs");
		this.fx.append(defs);

		this.markMasks = [];
		this.exitHalf = 0;
		if (this.mode === "frames" && this.sceneSetup.marks?.length) {
			this.buildMarks(defs, W, H, m);
			return;
		}

		let from: Pt;
		let exit: Pt;
		if (this.mode === "fallback") {
			const D = this.rectToScreen(this.sceneSetup.door);
			const carW = D.w * 0.72;
			const carH = carW * CAR_RATIO;
			this.carStart = { x: D.x + D.w * 0.14, y: D.y + D.h * 0.99 - carH, w: carW, h: carH };
			from = { x: D.x + D.w / 2, y: D.y + D.h * 0.99 };
		} else {
			from = this.sceneToScreen(this.sceneSetup.traceFrom);
		}
		const ex = this.sceneToScreen(this.sceneSetup.traceExit);
		exit = { x: lane ?? clamp(ex.x, 40, W * 0.45), y: H };
		this.exitPoint = exit;

		// Courbe : sort de l'atelier vers la caméra et file en biais vers le bas à gauche
		const dx = exit.x - from.x;
		const dy = H - from.y;
		const p1: Pt = { x: from.x + dx * 0.12, y: from.y + dy * 0.6 };
		const p2: Pt = { x: exit.x - dx * 0.28, y: H - dy * 0.32 };
		const dir = { x: exit.x - p2.x, y: exit.y - p2.y };
		const dl = Math.hypot(dir.x, dir.y) || 1;
		this.exitDir = { x: dir.x / dl, y: dir.y / dl };
		const beyond: Pt = { x: exit.x + (dir.x / dl) * H * 0.7, y: exit.y + (dir.y / dl) * H * 0.7 };
		const path = sampleBeziers(
			[
				[from, p1, p2, exit],
				[exit, { x: exit.x + (dir.x / dl) * 40, y: exit.y + (dir.y / dl) * 40 }, beyond, beyond],
			],
			5,
		);
		this.carPath = path;
		const exitIdx = path.findIndex((s) => s.y >= H - 0.5);
		this.exitLen = exitIdx > 0 ? path[exitIdx].len : path[path.length - 1].len;
		const marks = path.slice(0, Math.max(2, exitIdx + 1));
		const total = marks[marks.length - 1].len;

		// écartement des roues : celui de la voiture au départ, celui de la trace du site à la sortie
		const room = Math.max(20, (H - from.y) * 0.24);
		const startHalf = this.mode === "fallback" ? Math.min(this.carStart.w * 0.3, room) : m.pair ? m.spacing * 0.7 : 10;
		const endHalf = m.pair ? m.spacing / 2 : 5;
		const half = (s: Sample) => lerp(startHalf, endHalf, Math.pow(s.len / total, 0.7));
		const tyre = (s: Sample) => lerp(3, m.width / 2, Math.pow(s.len / total, 0.8));

		const centerD = marks.map((s, i) => (i ? "L" : "M") + s.x.toFixed(1) + " " + s.y.toFixed(1)).join("");
		const mkMask = (id: string, width: number) => {
			const mask = svgEl("mask", { id, maskUnits: "userSpaceOnUse", x: -W, y: -H, width: W * 3, height: H * 3 });
			const p = svgEl("path", {
				d: centerD,
				fill: "none",
				stroke: "#fff",
				"stroke-width": width,
				"stroke-linecap": "butt",
				pathLength: 1,
				"stroke-dasharray": "1 1",
				"stroke-dashoffset": 1,
			});
			mask.append(p);
			defs.append(mask);
			return p;
		};

		// Traces noires (secours uniquement : dans la vidéo, elles sont déjà à l'image)
		if (this.mode === "fallback") {
			this.marksMask = mkMask("hero-marks-mask", startHalf * 4 + 60);
			const g = svgEl("g", { mask: "url(#hero-marks-mask)", fill: "#050505", opacity: 0.7 });
			for (const side of [1, -1]) {
				g.append(svgEl("path", { d: ribbonPath(marks, (s) => side * half(s), tyre) }));
			}
			this.fx.append(g);
		} else {
			this.marksMask = undefined;
		}

		// Départ doré : la trace du site prend le relais sur la fin des traces
		this.bridgeFrom = this.mode === "fallback" ? 0.45 : 0;
		const grad = svgEl("linearGradient", { id: "hero-bridge-grad", gradientUnits: "userSpaceOnUse", x1: 0, y1: from.y, x2: 0, y2: H });
		grad.append(svgEl("stop", { offset: 0, "stop-color": "#d6a84a", "stop-opacity": 0.55 }));
		grad.append(svgEl("stop", { offset: 1, "stop-color": "#d6a84a", "stop-opacity": m.opacity }));
		defs.append(grad);
		this.bridgeMask = mkMask("hero-bridge-mask", startHalf * 4 + 60);
		const gb = svgEl("g", { mask: "url(#hero-bridge-mask)", fill: "url(#hero-bridge-grad)" });
		const bridge = marks.filter((s) => s.len >= total * this.bridgeFrom);
		if (m.pair) {
			for (const side of [1, -1]) gb.append(svgEl("path", { d: ribbonPath(bridge, (s) => side * half(s), tyre) }));
		} else {
			gb.append(svgEl("path", { d: ribbonPath(bridge, () => 0, (s) => lerp(8, m.width / 2, s.len / total)) }));
		}
		this.fx.append(gb);

		// la voiture qui sort (secours) et sa fumée
		if (this.mode === "fallback") {
			Object.assign(this.carOut.style, { width: `${this.carStart.w}px` });
			if (this.smoke) {
				const sw = this.carStart.w * 1.6;
				Object.assign(this.smoke.style, { left: `${from.x - sw / 2}px`, top: `${from.y - sw * 0.45}px`, width: `${sw}px`, height: `${sw * 0.6}px` });
			}
		}
	}

	/** Mode images : l'or se pose sur les deux traces réelles de la vidéo, de la porte à la sortie du cadre */
	private buildMarks(defs: SVGDefsElement, W: number, H: number, m: ReturnType<typeof traceMetrics>) {
		this.bridgeMask = undefined;
		this.marksMask = undefined;
		const grad = svgEl("linearGradient", { id: "hero-marks-grad", gradientUnits: "userSpaceOnUse", x1: 0, y1: H * 0.75, x2: 0, y2: H });
		grad.append(svgEl("stop", { offset: 0, "stop-color": "#d6a84a", "stop-opacity": 0.7 }));
		grad.append(svgEl("stop", { offset: 1, "stop-color": "#d6a84a", "stop-opacity": 0.4 }));
		defs.append(grad);
		// largeur des traces de la vidéo (≈ 16 px sur 1280) à l'échelle de l'écran
		const half = Math.max(4, (16 / 1280) * this.view.w) / 2;
		const exits: { x: number; dir: Pt }[] = [];
		this.sceneSetup.marks!.forEach((line, i) => {
			const pts = line.map((p) => this.sceneToScreen(p));
			const S = sampleBeziers(catmullRom(pts), 4);
			const id = `hero-mark-${i}`;
			const mask = svgEl("mask", { id, maskUnits: "userSpaceOnUse", x: -W, y: -H, width: W * 3, height: H * 3 });
			const mp = svgEl("path", {
				d: S.map((s, k) => (k ? "L" : "M") + s.x.toFixed(1) + " " + s.y.toFixed(1)).join(""),
				fill: "none",
				stroke: "#fff",
				"stroke-width": half * 6,
				pathLength: 1,
				"stroke-dasharray": "1 1",
				"stroke-dashoffset": 1,
			});
			mask.append(mp);
			defs.append(mask);
			this.markMasks.push(mp);
			const g = svgEl("g", { mask: `url(#${id})`, fill: "url(#hero-marks-grad)" });
			g.append(svgEl("path", { d: ribbonPath(S, () => 0, (s) => half * (0.75 + 0.25 * (s.len / S[S.length - 1].len))) }));
			this.fx.append(g);
			// sortie visible à l'écran ? (sur mobile, la trace gauche sort du champ)
			const last = S[S.length - 1];
			const prev = S[Math.max(0, S.length - 6)];
			if (last.x >= -2 && last.x <= W + 2) {
				const d = Math.hypot(last.x - prev.x, last.y - prev.y) || 1;
				exits.push({ x: last.x, dir: { x: (last.x - prev.x) / d, y: (last.y - prev.y) / d } });
			}
		});
		// la trace du site part entre les sorties visibles, avec leur écartement
		if (!exits.length) exits.push({ x: m.pair ? W * 0.3 : m.lane, dir: { x: 0, y: 1 } });
		const xs = exits.map((e) => e.x);
		const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
		this.exitPoint = { x: cx, y: H };
		this.exitHalf = m.pair ? (Math.max(...xs) - Math.min(...xs)) / 2 : 0;
		const dx = exits.reduce((a, e) => a + e.dir.x, 0);
		const dy = exits.reduce((a, e) => a + e.dir.y, 0);
		const dl = Math.hypot(dx, dy) || 1;
		this.exitDir = { x: dx / dl, y: dy / dl };
	}

	// ---------------------------------------------------------------------------
	setupScroll() {
		const st = (start: () => number, end: () => number, set: (p: number) => void) =>
			ScrollTrigger.create({
				trigger: this.root,
				start: () => start(),
				end: () => end(),
				onUpdate: (self) => {
					set(self.progress);
					this.render();
				},
				onRefresh: (self) => {
					set(self.progress);
					this.render();
				},
			});
		const top = () => this.root.getBoundingClientRect().top + window.scrollY;
		st(
			() => top(),
			() => top() + this.seq1Px,
			(p) => (this.p1 = p),
		);
		st(
			() => top() + this.seq1Px,
			() => top() + this.seq1Px + this.seq2Px,
			(p) => (this.p2 = p),
		);
	}

	render() {
		const T = this.setup.timing;
		const { p1, p2 } = this;

		// Indication « Faites défiler »
		this.hint.style.opacity = String(0.85 * (1 - range(p1, 0, 0.05)));

		// H1 : visible de 0 à 30 % puis fondu
		if (!this.copyLocked) {
			const t = range(p1, T.h1Out[0], T.h1Out[1]);
			this.copy.style.opacity = String(1 - t);
			this.copy.style.transform = `translateY(${-50 * t}px)`;
			this.copy.style.visibility = t >= 1 ? "hidden" : "visible";
		}

		// « Exigence · Qualité · Passion » autour de 55 %
		const out = range(p1, T.mottoOut[0], T.mottoOut[1]);
		let any = false;
		this.mottoWords.forEach((w, i) => {
			const inn = range(p1, T.mottoIn[0] + i * 0.035, T.mottoIn[1] + i * 0.035);
			const o = inn * (1 - out);
			if (o > 0) any = true;
			w.style.opacity = String(o);
			w.style.transform = `translateY(${(1 - inn) * 60 - out * 40}px)`;
		});
		this.motto.style.visibility = any ? "visible" : "hidden";

		if (this.mode === "frames") {
			// mouvement réduit : image fixe de fin de porte, textes conservés
			this.seq1?.setProgress(this.reduced ? 1 : p1);
			if (this.seq2) this.seq2.setProgress(p2);
			if (this.seq1 && this.seq1.drawn >= 0) this.root.classList.add("poster-off");
			// la séquence 2 ne passe devant que si elle a déjà une image à montrer
			// (sinon la dernière image de la porte, identique, reste affichée)
			this.root.classList.toggle("in-depart", p2 > 0 && !!this.seq2 && this.seq2.drawn >= 0);
		} else {
			this.root.classList.toggle("in-depart", p2 > 0);
			this.renderFallback();
		}

		// Mode images : les traces de la vidéo passent à l'or quand la voiture a quitté le cadre
		if (this.markMasks.length) {
			const t = range(p2, T.traceStart, 1);
			for (const mk of this.markMasks) mk.setAttribute("stroke-dashoffset", String(1 - t));
		}

		// Départ doré de la trace (à 70 % de la séquence 2)
		if (this.bridgeMask) {
			const t = range(p2, T.traceStart, 1);
			const f = this.bridgeFrom + (1 - this.bridgeFrom) * t;
			const shown = t > 0 ? f : this.bridgeFrom;
			// le masque dévoile [bridgeFrom, f] : décalage du tiret
			this.bridgeMask.setAttribute("stroke-dasharray", `0 ${this.bridgeFrom} ${Math.max(0, shown - this.bridgeFrom)} 2`);
			this.bridgeMask.setAttribute("stroke-dashoffset", "0");
		}
		this.onProgress?.(p1, p2);
	}

	private renderFallback() {
		const T = this.setup.timing;
		const { p1, p2 } = this;
		const { doorPanel, interior, spill, leak } = this;
		if (!doorPanel || !interior || !spill || !leak) return;

		const open = easeInOut(range(p1, T.doorOpen[0], T.doorOpen[1]));
		doorPanel.style.transform = `translate3d(0, ${-open * 101}%, 0)`;
		interior.style.opacity = String(0.25 + 0.75 * range(p1, T.doorOpen[0], T.doorOpen[0] + 0.45));
		spill.style.opacity = String(0.95 * range(p1, T.doorOpen[0] + 0.05, T.doorOpen[1]) + 0.3 * range(p2, 0, 0.3) * (1 - range(p2, 0.3, 0.7)));
		leak.style.opacity = String(0.7 * (1 - range(p1, T.doorOpen[0], T.doorOpen[0] + 0.12)));

		// phares : allumage avec un petit clignotement
		const h = T.headlightsOn;
		const lit = p1 >= h + 0.03 || p2 > 0 || (p1 >= h && p1 < h + 0.012) || (p1 >= h + 0.02 && p1 < h + 0.03);
		this.carIn?.classList.toggle("lights-on", lit);
		this.carOut.classList.toggle("lights-on", true);

		// la voiture sort : elle suit la courbe des traces puis quitte le cadre
		const leaving = p2 > T.carLeaves[0];
		if (this.carIn) this.carIn.style.visibility = leaving ? "hidden" : "visible";
		this.carOut.style.visibility = leaving && p2 < 1 ? "visible" : "hidden";
		const u = Math.pow(range(p2, T.carLeaves[0], T.carLeaves[1]), 1.7);
		const total = this.carPath.length ? this.carPath[this.carPath.length - 1].len : 0;
		if (total) {
			const len = u * total;
			const pt = pointAt(this.carPath, len);
			const k = Math.min(1, len / this.exitLen);
			const scale = lerp(1, 2.2, Math.pow(k, 1.3)) + Math.max(0, len - this.exitLen) / 600;
			// cap : 0° tout droit vers la caméra ; la caisse penche légèrement vers l'extérieur du virage
			const heading = Math.atan2(pt.ny, -pt.nx) * (180 / Math.PI);
			const roll = clamp(-heading * 0.12, -8, 8);
			const { w, h: ch } = this.carStart;
			this.carOut.style.transform = `translate3d(${pt.x - w / 2}px, ${pt.y - ch}px, 0) scale(${scale}) rotate(${roll}deg)`;
			this.marksMask?.setAttribute("stroke-dashoffset", String(1 - Math.min(1, k)));
		}

		// fumée légère au démarrage
		if (this.smoke) this.smoke.style.opacity = String(Math.sin(range(p2, 0.02, 0.55) * Math.PI) * 0.75);
	}

	// ---------------------------------------------------------------------------
	/** Prépare l'arrivée : textes masqués, scène prête au zoom */
	introPrepare() {
		const lines = this.copy.querySelectorAll("[data-reveal-line]");
		const fades = this.copy.querySelectorAll("[data-reveal]");
		gsap.set(lines, { yPercent: 110 });
		gsap.set(fades, { autoAlpha: 0, y: 18 });
		gsap.set(this.hint, { autoAlpha: 0 });
	}

	private revealTl: gsap.core.Timeline | null = null;

	/** Fait apparaître le titre et les boutons (une seule fois) */
	introReveal() {
		if (this.revealTl) return this.revealTl;
		const lines = this.copy.querySelectorAll("[data-reveal-line]");
		const fades = this.copy.querySelectorAll("[data-reveal]");
		const tl = gsap.timeline({ onComplete: () => (this.copyLocked = false) });
		this.revealTl = tl;
		if (this.reduced) {
			tl.set(lines, { yPercent: 0 }).set(fades, { autoAlpha: 1, y: 0 }).set(this.hint, { autoAlpha: 1 });
			return tl;
		}
		tl.to(lines, { yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.09 })
			.to(fades, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.08 }, 0.25)
			.to(this.hint, { autoAlpha: 1, duration: 0.6 }, 0.8);
		return tl;
	}

	// ---------------------------------------------------------------------------
	private drawCalage() {
		const c = this.calage;
		c.hidden = false;
		c.replaceChildren();
		const box = (r: Box, color: string, label: string) => {
			const el = document.createElement("div");
			Object.assign(el.style, {
				position: "absolute",
				left: `${r.x}px`,
				top: `${r.y}px`,
				width: `${r.w}px`,
				height: `${r.h}px`,
				outline: `2px dashed ${color}`,
				font: "12px/1.2 monospace",
				color,
			});
			el.textContent = label;
			c.append(el);
		};
		const dot = (p: Pt, color: string, label: string) => box({ x: p.x - 6, y: p.y - 6, w: 12, h: 12 }, color, label);
		const S = this.sceneSetup;
		box(this.rectToScreen(S.sign), "#ff3b3b", "sign");
		box(this.rectToScreen(S.door), "#3bb2ff", "door");
		dot(this.sceneToScreen(S.focus), "#3bff7a", "focus");
		dot(this.sceneToScreen(S.traceFrom), "#ffd23b", "traceFrom");
		dot(this.sceneToScreen(S.traceExit), "#ffd23b", "traceExit");
		const info = document.createElement("pre");
		Object.assign(info.style, { position: "absolute", right: "8px", top: "60px", background: "#000c", color: "#fff", font: "11px/1.4 monospace", padding: "8px" });
		info.textContent = `mode ${this.mode} · ${this.variant}\nimage ${this.media.w}×${this.media.h}\nimages ${this.seq1?.count ?? 0} + ${this.seq2?.count ?? 0}`;
		c.append(info);
	}
}
