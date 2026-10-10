// Trace de pneus qui suit le défilement : deux traces parallèles (une seule sur mobile),
// derrière le contenu, dessinées au rythme du scroll sans jamais être en avance sur l'écran.
// Le chemin est découpé en morceaux (un SVG par tranche d'environ un écran) pour rester léger sur iPhone.
import { traceMetrics, type Hero } from "./hero";
import { clamp, debounce, offsetPath, sampleBeziers, svgEl, type Pt, type Sample } from "./util";

type Seg = [Pt, Pt, Pt, Pt];
type Chunk = { mask: SVGPathElement; from: number; to: number; svg: SVGSVGElement };

const GOLD = "#d6a84a";
const HEAD = 0.82; // la tête de la trace reste à 82 % de la hauteur d'écran

const line = (a: Pt, b: Pt): Seg => [a, { x: a.x + (b.x - a.x) / 3, y: a.y + (b.y - a.y) / 3 }, { x: a.x + ((b.x - a.x) * 2) / 3, y: a.y + ((b.y - a.y) * 2) / 3 }, b];
// courbe en S à tangentes verticales : ample, d'une marge à l'autre
const sCurve = (a: Pt, b: Pt): Seg => {
	const k = (b.y - a.y) * 0.55;
	return [a, { x: a.x, y: a.y + k }, { x: b.x, y: b.y - k }, b];
};

export class Trace {
	layer: HTMLElement;
	hero: Hero;
	reduced: boolean;
	samples: Sample[] = [];
	yEff: number[] = [];
	total = 0;
	chunks: Chunk[] = [];
	drawn = 0;
	onHead?: (headY: number, done: boolean) => void;
	private lastW = 0;
	private lastH = 0;
	private uid = 0;

	constructor(layer: HTMLElement, hero: Hero, reduced: boolean) {
		this.layer = layer;
		this.hero = hero;
		this.reduced = reduced;
		const rebuild = debounce(() => this.maybeRebuild(), 160);
		new ResizeObserver(rebuild).observe(document.body);
		window.addEventListener("resize", rebuild);
	}

	private maybeRebuild() {
		const W = document.documentElement.clientWidth;
		const H = document.documentElement.scrollHeight;
		// la barre d'adresse d'iOS change la hauteur d'écran : on ignore ces variations
		if (W === this.lastW && Math.abs(H - this.lastH) < 4) return;
		this.build();
	}

	private docRect(el: Element) {
		const r = el.getBoundingClientRect();
		return { x: r.left, y: r.top + window.scrollY, w: r.width, h: r.height, bottom: r.bottom + window.scrollY, right: r.right };
	}

	build() {
		const W = document.documentElement.clientWidth;
		const vh = window.innerHeight;
		this.lastW = W;
		this.lastH = document.documentElement.scrollHeight;
		const m = traceMetrics(W);

		// voies : milieu de la marge gauche / droite du conteneur
		const ref = document.querySelector<HTMLElement>("[data-lane-ref]");
		let laneL = m.lane;
		if (m.pair && ref) {
			const r = ref.getBoundingClientRect();
			const pad = parseFloat(getComputedStyle(ref).paddingLeft) || 0;
			laneL = Math.max(m.spacing / 2 + m.width / 2 + 2, (r.left + pad) / 2);
		}
		const laneR = W - laneL;

		const start = this.hero.traceStart();
		start.x = m.pair ? clamp(start.x, laneL, W - laneL) : clamp(start.x, laneL, W / 2);
		const segs: Seg[] = [];
		let cur: Pt = { ...start };
		const dir = this.hero.exitDir;
		const go = (p: Pt) => {
			if (!segs.length && m.pair) {
				// premier virage : prolonge la direction des traces qui sortent du hero
				const k = (p.y - cur.y) * 0.5;
				const kd = k / Math.max(0.35, dir.y);
				segs.push([cur, { x: cur.x + dir.x * kd, y: cur.y + dir.y * kd }, { x: p.x, y: p.y - k }, p]);
			} else if (Math.abs(p.x - cur.x) < 0.5) segs.push(line(cur, p));
			else segs.push(sCurve(cur, p));
			cur = p;
		};

		const sections = [...document.querySelectorAll<HTMLElement>("[data-trace]")];
		let side = 0; // 0 = gauche, 1 = droite
		let parkLen = 0;
		let park: Pt | null = null;
		sections.forEach((sec, i) => {
			const kind = sec.dataset.trace;
			const r = this.docRect(sec);
			const k = Math.min(r.h * 0.22, vh * 0.27, 240);
			const forced = sec.dataset.traceSide;
			if (forced) side = forced === "right" ? 1 : 0;
			const x = m.pair ? (side ? laneR : laneL) : laneL;

			if (kind === "timeline") {
				const lineEl = sec.querySelector("[data-trace-line]");
				if (lineEl) {
					const lr = this.docRect(lineEl);
					const lx = lr.x + lr.w / 2;
					go({ x: lx, y: lr.y });
					go({ x: lx, y: lr.bottom });
					return;
				}
			}
			if (kind === "final") {
				const target = sec.querySelector("[data-trace-park]");
				if (target) {
					const pr = this.docRect(target);
					const px = m.pair ? laneL : laneL;
					const py = pr.bottom + (m.pair ? 44 : 30);
					const R = Math.min(m.pair ? 140 : 70, Math.max(40, pr.x + pr.w * 0.25 - px));
					go({ x: px, y: Math.max(cur.y + 10, r.y + k) });
					go({ x: px, y: py - R });
					// quart de tour vers la droite, puis on se gare devant l'adresse
					const c = 0.5523 * R;
					segs.push([{ x: px, y: py - R }, { x: px, y: py - R + c }, { x: px + R - c, y: py }, { x: px + R, y: py }]);
					cur = { x: px + R, y: py };
					parkLen = Math.max(0, pr.x + Math.min(pr.w * 0.55, 260) - cur.x);
					park = { x: cur.x + parkLen, y: py };
					segs.push(line(cur, park));
					cur = park;
					return;
				}
			}
			const first = segs.length === 0;
			go({ x, y: Math.max(cur.y + 10, r.y + k, first ? cur.y + vh * 0.55 : 0) });
			go({ x, y: Math.max(cur.y + 10, r.bottom - k) });
			if (m.pair && !sec.dataset.traceSide && i < sections.length - 1) side = 1 - side;
		});

		this.samples = sampleBeziers(segs, 6);
		this.total = this.samples[this.samples.length - 1]?.len ?? 0;

		// y « effectif » croissant : la dernière ligne droite (horizontale) se dessine sur ~1/2 écran
		const parkStart = this.total - parkLen;
		let maxY = -Infinity;
		this.yEff = this.samples.map((s) => {
			const extra = parkLen && s.len > parkStart ? (s.len - parkStart) * 1.1 : 0;
			maxY = Math.max(maxY, s.y + extra);
			return maxY;
		});

		this.render(m, this.hero.exitHalf);
		this.update(window.scrollY);
	}

	/** `fromHalf` : écartement de départ (traces du hero), resserré sur ~1/2 écran */
	private render(m: ReturnType<typeof traceMetrics>, fromHalf = 0) {
		this.layer.replaceChildren();
		this.chunks = [];
		const S = this.samples;
		if (S.length < 2) return;
		const half = m.pair ? m.spacing / 2 : 0;
		const pad = Math.max(half, fromHalf) + m.width + 30;
		const tread = [m.width * 0.26, m.width * 0.17];
		const period = tread[0] + tread[1];
		const tracks = m.pair ? [1, -1] : [0];
		const fan = window.innerHeight * 0.55;
		const ease = (t: number) => t * t * (3 - 2 * t);
		const halfAt = (len: number) => (fromHalf > half && len < fan ? fromHalf + (half - fromHalf) * ease(len / fan) : half);
		const cum = tracks.map(() => 0); // longueur cumulée de chaque trace (continuité du motif)

		// tranches d'environ 900 px de haut
		let a = 0;
		while (a < S.length - 1) {
			let b = a + 1;
			while (b < S.length - 1 && S[b].y - S[a].y < 900 && b - a < 400) b++;
			const part = S.slice(a, b + 1);
			let minX = Infinity,
				minY = Infinity,
				maxX = -Infinity,
				maxY = -Infinity;
			for (const s of part) {
				minX = Math.min(minX, s.x);
				maxX = Math.max(maxX, s.x);
				minY = Math.min(minY, s.y);
				maxY = Math.max(maxY, s.y);
			}
			minX -= pad;
			minY -= pad;
			maxX += pad;
			maxY += pad;
			const id = `tm${++this.uid}`;
			const svg = svgEl("svg", {
				viewBox: `${minX} ${minY} ${maxX - minX} ${maxY - minY}`,
				width: maxX - minX,
				height: maxY - minY,
				"aria-hidden": "true",
				focusable: "false",
			});
			Object.assign(svg.style, { position: "absolute", left: `${minX}px`, top: `${minY}px`, overflow: "visible" });
			const center = part.map((s, i) => (i ? "L" : "M") + s.x.toFixed(1) + " " + s.y.toFixed(1)).join("");
			const mask = svgEl("mask", { id, maskUnits: "userSpaceOnUse", x: minX, y: minY, width: maxX - minX, height: maxY - minY });
			const mp = svgEl("path", {
				d: center,
				fill: "none",
				stroke: "#fff",
				"stroke-width": pad * 2,
				"stroke-linecap": "butt",
				"stroke-linejoin": "round",
				pathLength: 1,
				"stroke-dasharray": "1 1",
				"stroke-dashoffset": this.reduced ? 0 : 1,
			});
			mask.append(mp);
			const defs = svgEl("defs");
			defs.append(mask);
			svg.append(defs);

			const g = svgEl("g", { mask: `url(#${id})` });
			const tg = svgEl("g", { opacity: m.opacity, fill: "none", stroke: GOLD, "stroke-width": m.width, "stroke-linejoin": "round" });
			tracks.forEach((sign, ti) => {
				const offAt = (s: Sample) => sign * halfAt(s.len);
				const d = offsetPath(S, offAt, a, b);
				// longueur de ce morceau de trace décalée
				let len = 0;
				for (let i = a + 1; i <= b; i++) {
					const p = S[i - 1];
					const q = S[i];
					const op = offAt(p);
					const oq = offAt(q);
					len += Math.hypot(q.x + q.nx * oq - (p.x + p.nx * op), q.y + q.ny * oq - (p.y + p.ny * op));
				}
				tg.append(svgEl("path", { d, "stroke-opacity": 0.32 }));
				tg.append(svgEl("path", { d, "stroke-dasharray": `${tread[0].toFixed(2)} ${tread[1].toFixed(2)}`, "stroke-dashoffset": (cum[ti] % period).toFixed(2) }));
				cum[ti] += len;
			});
			g.append(tg);

			// deux traces de dérapage plus marquées au démarrage (hero de secours : la vidéo a les siennes)
			if (a === 0 && this.hero.mode !== "frames") {
				// deux traces de gomme qui s'écartent sur les premiers mètres (la voiture a patiné)
				const skidEnd = S.findIndex((s) => s.len > Math.min(m.pair ? 170 : 110, this.total * 0.3));
				const n = Math.max(2, Math.min(skidEnd, b));
				const skid = svgEl("g", { fill: "none", stroke: GOLD, "stroke-opacity": 0.3, "stroke-width": m.width * 0.8, "stroke-linecap": "round" });
				const sides = m.pair ? [1, -1] : [1, -1];
				const base = m.pair ? half : m.width * 0.6;
				for (const sd of sides) {
					skid.append(svgEl("path", { d: offsetPath(S, (s, i) => sd * (base + (1 - i / n) * (m.pair ? 10 : 5)), 0, n) }));
				}
				g.append(skid);
			}
			svg.append(g);
			this.layer.append(svg);
			this.chunks.push({ mask: mp, from: S[a].len, to: S[b].len, svg });
			a = b;
		}
	}

	/** Longueur dessinée pour une position de défilement donnée */
	private lengthFor(scrollY: number) {
		const head = scrollY + window.innerHeight * HEAD;
		const Y = this.yEff;
		if (!Y.length || head <= Y[0]) return 0;
		if (head >= Y[Y.length - 1]) return this.total;
		let lo = 0;
		let hi = Y.length - 1;
		while (hi - lo > 1) {
			const mid = (lo + hi) >> 1;
			if (Y[mid] <= head) lo = mid;
			else hi = mid;
		}
		const t = (head - Y[lo]) / (Y[hi] - Y[lo] || 1);
		return this.samples[lo].len + (this.samples[hi].len - this.samples[lo].len) * t;
	}

	update(scrollY: number) {
		if (!this.chunks.length) return;
		const len = this.reduced ? this.total : this.lengthFor(scrollY);
		if (Math.abs(len - this.drawn) < 0.5 && len !== 0 && len !== this.total) return;
		this.drawn = len;
		for (const c of this.chunks) {
			const f = clamp((len - c.from) / (c.to - c.from || 1), 0, 1);
			c.mask.setAttribute("stroke-dashoffset", String(1 - f));
		}
		this.onHead?.(scrollY + window.innerHeight * HEAD, len >= this.total - 1);
	}
}
