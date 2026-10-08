// Écran d'accueil : mur de briques en canvas (rangée par rangée, du bas vers le haut),
// enseigne qui glisse et se dessine en or, puis zoom arrière vers le hero.
import { gsap } from "gsap";
import type { Hero } from "./hero";
import { clamp } from "./util";

const PALETTE = ["#8a4a3a", "#a35f48", "#6e3b30"];
const JOINT = "#cfc8bd";
const BUILD_MIN = 1200;
const BUILD_MAX = 2500;
const BRICK_MS = 230;

type Brick = { x: number; y: number; w: number; h: number; color: string; seed: number; t: number; settled: boolean };

// petit générateur pseudo-aléatoire reproductible
function rng(seed: number) {
	let s = seed >>> 0 || 1;
	return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function shade(hex: string, amt: number) {
	const n = parseInt(hex.slice(1), 16);
	const f = (c: number) => clamp(Math.round(c + (amt > 0 ? (255 - c) * amt : c * amt)), 0, 255);
	const r = f(n >> 16);
	const g = f((n >> 8) & 255);
	const b = f(n & 255);
	return `rgb(${r},${g},${b})`;
}

class BrickWall {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	base: HTMLCanvasElement;
	bctx: CanvasRenderingContext2D;
	bricks: Brick[] = [];
	dpr = 1;
	joint = 2;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d")!;
		this.base = document.createElement("canvas");
		this.bctx = this.base.getContext("2d")!;
	}

	layout() {
		const W = window.innerWidth;
		const H = window.innerHeight;
		this.dpr = Math.min(window.devicePixelRatio || 1, 2);
		for (const c of [this.canvas, this.base]) {
			c.width = Math.round(W * this.dpr);
			c.height = Math.round(H * this.dpr);
		}
		this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
		this.bctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

		const bw = clamp(W / 9, 38, 74);
		const bh = Math.round(bw * 0.34);
		const j = Math.max(2, Math.round(bw * 0.05));
		this.joint = j;
		const rows = Math.ceil(H / (bh + j)) + 1;
		const rand = rng(2017);
		this.bricks = [];
		for (let r = 0; r < rows; r++) {
			const y = H - (r + 1) * (bh + j);
			const offset = r % 2 ? -(bw + j) / 2 : 0;
			const row: Brick[] = [];
			for (let x = offset; x < W; x += bw + j) {
				let color = PALETTE[Math.floor(rand() * PALETTE.length)];
				const roll = rand();
				if (roll < 0.07) color = "#4f2b23";
				else if (roll < 0.13) color = "#7d655d";
				row.push({ x, y, w: bw, h: bh, color: shade(color, (rand() - 0.5) * 0.22), seed: Math.floor(rand() * 1e9), t: 0, settled: false });
			}
			// un rang sur deux posé de droite à gauche, comme un maçon
			if (r % 2) row.reverse();
			this.bricks.push(...row);
		}
		this.bctx.clearRect(0, 0, W, H);
	}

	private drawBrick(ctx: CanvasRenderingContext2D, b: Brick, alpha: number, dy: number) {
		const j = this.joint;
		const rand = rng(b.seed);
		ctx.globalAlpha = alpha;
		// joint autour de la brique
		ctx.fillStyle = JOINT;
		ctx.fillRect(b.x - j / 2, b.y - j / 2 + dy, b.w + j, b.h + j);
		ctx.fillStyle = b.color;
		ctx.fillRect(b.x, b.y + dy, b.w, b.h);
		// relief : arête haute claire, bas plus sombre
		ctx.fillStyle = "rgba(255,240,225,0.08)";
		ctx.fillRect(b.x, b.y + dy, b.w, b.h * 0.18);
		ctx.fillStyle = "rgba(0,0,0,0.2)";
		ctx.fillRect(b.x, b.y + dy + b.h * 0.8, b.w, b.h * 0.2);
		// grain
		for (let k = 0; k < 7; k++) {
			ctx.fillStyle = rand() < 0.6 ? "rgba(0,0,0,0.16)" : "rgba(255,235,215,0.08)";
			ctx.fillRect(b.x + rand() * (b.w - 3), b.y + dy + rand() * (b.h - 2), 1 + rand() * 2.5, 1 + rand() * 1.5);
		}
		ctx.globalAlpha = 1;
	}

	/** p : fraction de briques posées (0 → 1). Renvoie true quand toutes sont en place. */
	render(p: number, now: number) {
		const W = this.canvas.width / this.dpr;
		const H = this.canvas.height / this.dpr;
		const n = Math.floor(p * this.bricks.length);
		const flying: [Brick, number][] = [];
		let allSettled = n >= this.bricks.length;
		for (let i = 0; i < n; i++) {
			const b = this.bricks[i];
			if (b.settled) continue;
			if (!b.t) b.t = now;
			const s = Math.min(1, (now - b.t) / BRICK_MS);
			if (s >= 1) {
				b.settled = true;
				this.drawBrick(this.bctx, b, 1, 0);
			} else {
				flying.push([b, s]);
				allSettled = false;
			}
		}
		this.ctx.clearRect(0, 0, W, H);
		this.ctx.drawImage(this.base, 0, 0, W, H);
		for (const [b, s] of flying) {
			const e = 1 - Math.pow(1 - s, 3);
			this.drawBrick(this.ctx, b, e, -(1 - e) * b.h * 0.9);
		}
		return allSettled;
	}

	complete() {
		for (const b of this.bricks) {
			if (!b.settled) {
				b.settled = true;
				this.drawBrick(this.bctx, b, 1, 0);
			}
		}
		this.render(1, performance.now());
	}
}

export type LoaderOptions = {
	root: HTMLElement;
	hero: Hero;
	progress: () => number;
	reduced: boolean;
};

export function runLoader({ root, hero, progress, reduced }: LoaderOptions): Promise<void> {
	const wall = new BrickWall(root.querySelector("[data-wall]")!);
	const shadeEl = root.querySelector<HTMLElement>("[data-shade]")!;
	const signBox = root.querySelector<HTMLElement>("[data-loader-sign]")!;
	const skip = root.querySelector<HTMLButtonElement>("[data-loader-skip]")!;
	const svg = signBox.querySelector("svg")!;
	const q = (sel: string) => svg.querySelectorAll(sel);
	wall.layout();

	return new Promise((resolve) => {
		let finished = false;
		let raf = 0;
		let signTl: gsap.core.Timeline | null = null;
		let outTl: gsap.core.Timeline | null = null;

		const finish = () => {
			if (finished) return;
			finished = true;
			cancelAnimationFrame(raf);
			root.style.display = "none";
			hero.sign.style.visibility = "";
			gsap.set(hero.zoom, { clearProps: "transform,transformOrigin" });
			resolve();
		};

		// ---- 3. vers le hero : l'enseigne se pose sur la façade, zoom arrière
		const transition = () => {
			if (reduced) {
				outTl = gsap.timeline({ onComplete: finish }).to(root, { opacity: 0, duration: 0.5, ease: "power1.out" }, 0.6);
				return;
			}
			const r0 = signBox.getBoundingClientRect();
			const r1 = hero.signRect();
			const cx = r1.x + r1.w / 2;
			const cy = r1.y + r1.h / 2;
			const ratio = r0.width / r1.w;
			const matched = ratio >= 1.15;
			const sceneFrom = matched ? ratio : 1.08;
			const signFrom = matched ? ratio : 1;

			gsap.set(signBox, { clearProps: "transform" });
			Object.assign(signBox.style, { inset: "auto", margin: "0", left: `${r0.left}px`, top: `${r0.top}px`, width: `${r0.width}px` });
			hero.sign.style.visibility = "hidden";
			hero.zoom.style.transformOrigin = `${cx}px ${cy}px`;
			gsap.set(hero.zoom, { scale: sceneFrom });
			gsap.set(signBox, { transformOrigin: "0 0", x: 0, y: 0, xPercent: 0, yPercent: 0, scale: 1 });

			const k0 = (signFrom * r1.w) / r0.width;
			outTl = gsap.timeline({ onComplete: finish });
			outTl
				.to(signBox, {
					x: cx - (signFrom * r1.w) / 2 - r0.left,
					y: cy - (signFrom * r1.h) / 2 - r0.top,
					scale: k0,
					duration: 0.75,
					ease: "power3.inOut",
				})
				.addLabel("zoom", "-=0.1")
				.to([wall.canvas, shadeEl], { opacity: 0, duration: 0.6, ease: "power1.in" }, "zoom")
				.to(root, { backgroundColor: "rgba(19,20,23,0)", duration: 0.6, ease: "power1.in" }, "zoom")
				.to(hero.zoom, { scale: 1, duration: 1.25, ease: "power3.inOut" }, "zoom")
				.to(
					signBox,
					{
						x: r1.x - r0.left,
						y: r1.y - r0.top,
						scale: r1.w / r0.width,
						duration: 1.25,
						ease: "power3.inOut",
					},
					"zoom",
				)
				.set(signBox, { filter: "none" }, "zoom+=0.6")
				.call(() => hero.introReveal(), [], "zoom+=0.55")
				.to(skip, { autoAlpha: 0, duration: 0.3 }, 0);
		};

		// ---- 2. l'enseigne glisse sur le mur et se dessine
		const playSign = () => {
			gsap.set(signBox, { visibility: "visible" });
			if (reduced) {
				transition();
				return;
			}
			const moon = q(".lbe-moon-draw");
			const starA = q(".lbe-star-a");
			const starB = q(".lbe-star-b");
			gsap.set(moon, { attr: { "stroke-dasharray": "1 1", "stroke-dashoffset": 1 } });
			gsap.set([...starA, ...starB], { attr: { "stroke-dasharray": "1 1", "stroke-dashoffset": 1 } });
			gsap.set(q(".lbe-spark"), { scale: 0, rotate: -90, transformOrigin: "50% 50%" });
			gsap.set(q(".lbe-t1, .lbe-t2, .lbe-t3"), { opacity: 0, y: 10 });

			signTl = gsap.timeline({ onComplete: transition });
			signTl
				.fromTo(signBox, { xPercent: -140 }, { xPercent: 0, duration: 0.85, ease: "power4.out" })
				.to(moon, { attr: { "stroke-dashoffset": 0 }, duration: 0.85, ease: "power2.inOut" }, 0.5)
				.to(starA, { attr: { "stroke-dashoffset": 0 }, duration: 0.7, ease: "power2.inOut" }, 0.7)
				.to(starB, { attr: { "stroke-dashoffset": 0 }, duration: 0.5, ease: "power2.out" }, 1.05)
				.to(q(".lbe-spark"), { scale: 1.5, rotate: 0, duration: 0.32, ease: "power2.out" }, 1.4)
				.to(q(".lbe-spark"), { scale: 1, duration: 0.4, ease: "back.out(3)" }, 1.72)
				.to(q(".lbe-t1"), { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 1.45)
				.to(q(".lbe-t2"), { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 1.58)
				.to(q(".lbe-t3"), { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 1.75)
				.to({}, { duration: 0.45 });
		};

		// ---- 1. le mur se monte au rythme du préchargement réel
		const start = performance.now();
		let shown = 0;
		const tick = (now: number) => {
			const t = now - start;
			const target = Math.max(Math.min(progress(), t / BUILD_MIN), t / BUILD_MAX);
			shown = Math.min(1, shown + Math.max(0.004, (Math.min(1, target) - shown) * 0.2));
			if (reduced) shown = 1;
			const done = wall.render(shown, now);
			if (shown >= 1 && (done || reduced)) {
				if (reduced) wall.complete();
				playSign();
				return;
			}
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);

		skip.addEventListener("click", () => {
			cancelAnimationFrame(raf);
			signTl?.kill();
			outTl?.kill();
			gsap.to(root, {
				opacity: 0,
				duration: 0.35,
				onComplete: () => {
					hero.introReveal();
					finish();
				},
			});
		});

		// le mur suit la taille de l'écran tant qu'il se monte
		const onResize = () => {
			if (finished) return window.removeEventListener("resize", onResize);
			if (signTl || outTl) return;
			wall.layout();
		};
		window.addEventListener("resize", onResize);
	});
}
