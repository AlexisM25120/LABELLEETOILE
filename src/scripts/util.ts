export type Pt = { x: number; y: number };
export type Box = { x: number; y: number; w: number; h: number };

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a), 0, 1);
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const isMobile = () => window.matchMedia("(max-width: 767px)").matches;
export const isDesktop = () => window.matchMedia("(min-width: 1024px)").matches;

/**
 * Recadrage « cover » avec point focal : l'image remplit la zone, le point focal
 * reste au centre tant que les bords le permettent.
 */
export function cover(srcW: number, srcH: number, dstW: number, dstH: number, fx = 0.5, fy = 0.5) {
	const scale = Math.max(dstW / srcW, dstH / srcH);
	const w = srcW * scale;
	const h = srcH * scale;
	const x = clamp(dstW / 2 - fx * w, dstW - w, 0);
	const y = clamp(dstH / 2 - fy * h, dstH - h, 0);
	return { scale, x, y, w, h };
}

export type Sample = { x: number; y: number; len: number; nx: number; ny: number };

/** Échantillonne une suite de segments de Bézier cubiques (points de contrôle à plat) */
export function sampleBeziers(segs: [Pt, Pt, Pt, Pt][], step = 6): Sample[] {
	const out: Sample[] = [];
	let len = 0;
	let prev: Pt | null = null;
	for (const [p0, p1, p2, p3] of segs) {
		const approx = Math.hypot(p1.x - p0.x, p1.y - p0.y) + Math.hypot(p2.x - p1.x, p2.y - p1.y) + Math.hypot(p3.x - p2.x, p3.y - p2.y);
		const n = Math.max(2, Math.ceil(approx / step));
		const first: number = prev ? 1 : 0;
		for (let i = first; i <= n; i++) {
			const t: number = i / n;
			const mt: number = 1 - t;
			const x: number = mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x;
			const y: number = mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y;
			if (prev) len += Math.hypot(x - prev.x, y - prev.y);
			out.push({ x, y, len, nx: 0, ny: 0 });
			prev = { x, y };
		}
	}
	// normales (gauche du sens de marche)
	for (let i = 0; i < out.length; i++) {
		const a = out[Math.max(0, i - 1)];
		const b = out[Math.min(out.length - 1, i + 1)];
		const dx = b.x - a.x;
		const dy = b.y - a.y;
		const d = Math.hypot(dx, dy) || 1;
		out[i].nx = -dy / d;
		out[i].ny = dx / d;
	}
	return out;
}

/** Courbe lisse (Catmull-Rom) passant par tous les points, en segments de Bézier cubiques */
export function catmullRom(pts: Pt[]): [Pt, Pt, Pt, Pt][] {
	const segs: [Pt, Pt, Pt, Pt][] = [];
	for (let i = 0; i < pts.length - 1; i++) {
		const p0 = pts[Math.max(0, i - 1)];
		const p1 = pts[i];
		const p2 = pts[i + 1];
		const p3 = pts[Math.min(pts.length - 1, i + 2)];
		segs.push([
			p1,
			{ x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 },
			{ x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 },
			p2,
		]);
	}
	return segs;
}

/** Polyligne décalée parallèlement (offset > 0 : côté gauche), en chaîne SVG */
export function offsetPath(samples: Sample[], offset: number | ((s: Sample, i: number) => number), from = 0, to = samples.length - 1): string {
	let d = "";
	for (let i = from; i <= to; i++) {
		const s = samples[i];
		const o = typeof offset === "function" ? offset(s, i) : offset;
		d += (i === from ? "M" : "L") + (s.x + s.nx * o).toFixed(1) + " " + (s.y + s.ny * o).toFixed(1);
	}
	return d;
}

/** Contour fermé d'une bande de largeur variable autour d'une ligne décalée */
export function ribbonPath(samples: Sample[], center: (s: Sample, i: number) => number, half: (s: Sample, i: number) => number): string {
	let left = "";
	let right = "";
	for (let i = 0; i < samples.length; i++) {
		const s = samples[i];
		const c = center(s, i);
		const h = half(s, i);
		left += (i === 0 ? "M" : "L") + (s.x + s.nx * (c + h)).toFixed(1) + " " + (s.y + s.ny * (c + h)).toFixed(1);
	}
	for (let i = samples.length - 1; i >= 0; i--) {
		const s = samples[i];
		const c = center(s, i);
		const h = half(s, i);
		right += "L" + (s.x + s.nx * (c - h)).toFixed(1) + " " + (s.y + s.ny * (c - h)).toFixed(1);
	}
	return left + right + "Z";
}

export function pointAt(samples: Sample[], len: number): Sample {
	if (len <= 0) return samples[0];
	const last = samples[samples.length - 1];
	if (len >= last.len) return last;
	let lo = 0;
	let hi = samples.length - 1;
	while (hi - lo > 1) {
		const mid = (lo + hi) >> 1;
		if (samples[mid].len < len) lo = mid;
		else hi = mid;
	}
	const a = samples[lo];
	const b = samples[hi];
	const t = (len - a.len) / (b.len - a.len || 1);
	return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), len, nx: a.nx, ny: a.ny };
}

export function svgEl<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}): SVGElementTagNameMap[K] {
	const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
	for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
	return el;
}

export function debounce<T extends (...a: any[]) => void>(fn: T, ms = 150) {
	let id = 0;
	return (...a: Parameters<T>) => {
		clearTimeout(id);
		id = window.setTimeout(() => fn(...a), ms);
	};
}

export const storage = {
	get(key: string) {
		try {
			return sessionStorage.getItem(key);
		} catch {
			return null;
		}
	},
	set(key: string, value: string) {
		try {
			sessionStorage.setItem(key, value);
		} catch {}
	},
};

/** Rend la main au navigateur (affichage, saisie) avant la suite du travail */
export function yieldToMain() {
	const s = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler;
	if (s?.yield) return s.yield();
	return new Promise<void>((r) => setTimeout(r, 0));
}
