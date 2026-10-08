// Séquence d'images WebP dessinée dans un <canvas> au rythme du défilement.
import { cover } from "./util";

export type FrameSet = { urls: string[]; width: number; height: number };

// File de chargement partagée : priorités respectées, 6 requêtes en parallèle.
const queue: { url: string; resolve: (img: HTMLImageElement | null) => void; priority: number }[] = [];
let active = 0;
const MAX = 6;

function pump() {
	queue.sort((a, b) => a.priority - b.priority);
	while (active < MAX && queue.length) {
		const job = queue.shift()!;
		active++;
		const img = new Image();
		img.decoding = "async";
		img.onload = () => {
			active--;
			job.resolve(img);
			pump();
		};
		img.onerror = () => {
			active--;
			job.resolve(null);
			pump();
		};
		img.src = job.url;
	}
}

function loadImage(url: string, priority: number) {
	return new Promise<HTMLImageElement | null>((resolve) => {
		queue.push({ url, resolve, priority });
		pump();
	});
}

export class FrameSequence {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	set: FrameSet;
	images: (HTMLImageElement | null)[];
	focus = { x: 0.5, y: 0.5 };
	current = -1;
	drawn = -1;
	loaded = 0;
	cssW = 0;
	cssH = 0;
	private loadingStarted = new Set<number>();

	constructor(canvas: HTMLCanvasElement, set: FrameSet) {
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d", { alpha: false })!;
		this.set = set;
		this.images = new Array(set.urls.length).fill(null);
	}

	get count() {
		return this.set.urls.length;
	}

	/** Charge les images [from, to) ; `onEach` reçoit le nombre d'images prêtes */
	load(from: number, to: number, priority: number, onEach?: () => void) {
		const jobs: Promise<void>[] = [];
		for (let i = from; i < Math.min(to, this.count); i++) {
			if (this.loadingStarted.has(i)) continue;
			this.loadingStarted.add(i);
			jobs.push(
				loadImage(this.set.urls[i], priority + i / 1000).then((img) => {
					this.images[i] = img;
					this.loaded++;
					onEach?.();
					// si on attendait cette image, on redessine
					if (this.current >= 0 && this.drawn !== this.current && this.nearest(this.current) === i) this.draw(true);
				}),
			);
		}
		return Promise.all(jobs);
	}

	resize(w: number, h: number) {
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		this.cssW = w;
		this.cssH = h;
		const bw = Math.round(w * dpr);
		const bh = Math.round(h * dpr);
		if (this.canvas.width !== bw || this.canvas.height !== bh) {
			this.canvas.width = bw;
			this.canvas.height = bh;
		}
		this.draw(true);
	}

	/** Image chargée la plus proche (d'abord en arrière, sinon en avant) */
	nearest(i: number) {
		for (let k = i; k >= 0; k--) if (this.images[k]) return k;
		for (let k = i + 1; k < this.count; k++) if (this.images[k]) return k;
		return -1;
	}

	setProgress(p: number) {
		const i = Math.round(Math.min(1, Math.max(0, p)) * (this.count - 1));
		if (i === this.current) return;
		this.current = i;
		this.draw();
	}

	draw(force = false) {
		if (this.current < 0) this.current = 0;
		const k = this.nearest(this.current);
		if (k < 0 || (!force && k === this.drawn)) return;
		const img = this.images[k]!;
		const { width: bw, height: bh } = this.canvas;
		const c = cover(img.naturalWidth, img.naturalHeight, bw, bh, this.focus.x, this.focus.y);
		this.ctx.drawImage(img, c.x, c.y, c.w, c.h);
		this.drawn = k;
	}
}
