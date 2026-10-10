// Visionneuse plein écran des réalisations (voir Viewer.astro).
import type Lenis from "lenis";

export function initViewer(lenis: Lenis | undefined, reduced: boolean) {
	const root = document.querySelector<HTMLElement>("[data-viewer]");
	if (!root) return;
	const track = root.querySelector<HTMLElement>("[data-vw-track]")!;
	const title = root.querySelector<HTMLElement>("[data-vw-title]")!;
	const work = root.querySelector<HTMLElement>("[data-vw-work]")!;
	const counter = root.querySelector<HTMLElement>("[data-vw-count]")!;
	const btnClose = root.querySelector<HTMLButtonElement>("[data-vw-close]")!;
	const btnPrev = root.querySelector<HTMLButtonElement>("[data-vw-prev]")!;
	const btnNext = root.querySelector<HTMLButtonElement>("[data-vw-next]")!;
	let opener: HTMLElement | null = null;
	let index = 0;
	let photos = 0;

	const slides = () => [...track.children] as HTMLElement[];
	const width = () => track.clientWidth || 1;

	/** Charge en priorité la photo affichée et ses voisines */
	const warm = (i: number) => {
		slides()
			.slice(Math.max(0, i - 1), i + 3)
			.forEach((s) => s.querySelectorAll("img").forEach((img) => (img.loading = "eager")));
	};

	const update = () => {
		const n = slides().length;
		index = Math.max(0, Math.min(n - 1, Math.round(track.scrollLeft / width())));
		counter.textContent = index < photos ? `${index + 1} / ${photos}` : "";
		btnPrev.disabled = index === 0;
		btnNext.disabled = index >= n - 1;
		warm(index);
	};

	const go = (i: number, smooth = !reduced) => {
		const n = slides().length;
		const target = Math.max(0, Math.min(n - 1, i));
		track.scrollTo({ left: target * width(), behavior: smooth ? "smooth" : "auto" });
		if (!smooth) update();
	};

	const open = (id: string, start = 0, from: HTMLElement | null = null) => {
		const tpl = document.querySelector<HTMLTemplateElement>(`template[data-vw-project="${id}"]`);
		if (!tpl) return;
		opener = from;
		track.replaceChildren(tpl.content.cloneNode(true));
		photos = track.querySelectorAll("[data-vw-slide]").length;
		title.textContent = tpl.dataset.title || "";
		work.textContent = tpl.dataset.work || "";
		root.hidden = false;
		document.documentElement.classList.add("vw-open");
		lenis?.stop();
		warm(start);
		requestAnimationFrame(() => {
			go(start, false);
			btnClose.focus({ preventScroll: true });
		});
	};

	const close = () => {
		if (root.hidden) return;
		root.hidden = true;
		track.replaceChildren();
		document.documentElement.classList.remove("vw-open");
		lenis?.start();
		opener?.focus({ preventScroll: true });
	};

	// ouverture depuis la galerie (délégation : les cartes peuvent être recréées)
	document.addEventListener("click", (e) => {
		const btn = (e.target as HTMLElement).closest<HTMLElement>("[data-open-project]");
		if (!btn) return;
		e.preventDefault();
		open(btn.dataset.openProject!, Number(btn.dataset.start || 0), btn);
	});

	btnClose.addEventListener("click", close);
	btnPrev.addEventListener("click", () => go(index - 1));
	btnNext.addEventListener("click", () => go(index + 1));

	let raf = 0;
	track.addEventListener(
		"scroll",
		() => {
			cancelAnimationFrame(raf);
			raf = requestAnimationFrame(update);
		},
		{ passive: true },
	);

	// molette verticale → photo suivante / précédente (ordinateur)
	let wheelLock = 0;
	track.addEventListener(
		"wheel",
		(e) => {
			if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
			e.preventDefault();
			const now = performance.now();
			if (now - wheelLock < 450) return;
			wheelLock = now;
			go(index + (e.deltaY > 0 ? 1 : -1));
		},
		{ passive: false },
	);

	root.addEventListener("keydown", (e) => {
		if (e.key === "Escape") {
			e.preventDefault();
			close();
		} else if (e.key === "ArrowRight") {
			e.preventDefault();
			go(index + 1);
		} else if (e.key === "ArrowLeft") {
			e.preventDefault();
			go(index - 1);
		} else if (e.key === "Home") {
			e.preventDefault();
			go(0);
		} else if (e.key === "End") {
			e.preventDefault();
			go(slides().length - 1);
		} else if (e.key === "Tab") {
			// focus piégé : on fait tourner le focus nous-mêmes (Safari saute les liens au clavier)
			e.preventDefault();
			const list = focusables();
			if (!list.length) return;
			const i = list.indexOf(document.activeElement as HTMLElement);
			const next = e.shiftKey ? (i <= 0 ? list.length - 1 : i - 1) : i === -1 || i === list.length - 1 ? 0 : i + 1;
			list[next].focus();
		}
	});

	/** Éléments du dialogue atteignables au clavier : boutons actifs et liens visibles de la photo affichée */
	const focusables = () =>
		[...root.querySelectorAll<HTMLElement>("button:not([disabled]), a[href]")].filter((el) => {
			if (el.offsetParent === null) return false;
			const slide = el.closest<HTMLElement>("[data-vw-slide], [data-vw-end]");
			return !slide || slides().indexOf(slide) === index;
		});

	// si le focus s'échappe malgré tout (clic ailleurs, lecteur d'écran), on le ramène
	document.addEventListener("focusin", (e) => {
		if (!root.hidden && !root.contains(e.target as Node)) btnClose.focus({ preventScroll: true });
	});

	window.addEventListener("resize", () => {
		if (!root.hidden) go(index, false);
	});
}
