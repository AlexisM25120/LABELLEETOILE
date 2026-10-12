// Interactions des sections : compteurs, galerie, avant/après, mur, FAQ, apparitions, ancres.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type Lenis from "lenis";
import { clamp, debounce } from "./util";

const fmt = (v: number, dec: number) => v.toFixed(dec).replace(".", ",");

export function initCounters(reduced: boolean) {
	if (reduced) return;
	document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
		const target = parseFloat(el.dataset.count!);
		const dec = Number(el.dataset.decimals || 0);
		const obj = { v: 0 };
		el.textContent = fmt(0, dec);
		ScrollTrigger.create({
			trigger: el,
			start: "top 90%",
			once: true,
			onEnter: () =>
				gsap.to(obj, {
					v: target,
					duration: target > 100 ? 2 : 1.5,
					ease: "power3.out",
					onUpdate: () => (el.textContent = fmt(obj.v, dec)),
				}),
		});
	});
	document.querySelectorAll<HTMLElement>("[data-words]").forEach((el) => {
		gsap.from(el, {
			yPercent: 35,
			autoAlpha: 0,
			duration: 1.1,
			ease: "expo.out",
			scrollTrigger: { trigger: el, start: "top 90%", once: true },
		});
	});
}

export function initFades(reduced: boolean) {
	if (reduced) return;
	document.querySelectorAll<HTMLElement>("[data-fade]").forEach((el) => {
		gsap.from(el, {
			y: 42,
			autoAlpha: 0,
			duration: 1.1,
			ease: "expo.out",
			scrollTrigger: { trigger: el, start: "top 90%", once: true },
		});
	});
}

export function initGallery(lenis: Lenis | undefined) {
	const sec = document.querySelector<HTMLElement>("[data-gallery]");
	if (!sec) return;
	const track = sec.querySelector<HTMLElement>("[data-gal-track]")!;
	const bar = sec.querySelector<HTMLElement>("[data-gal-bar]")!;
	const setBar = (p: number) => (bar.style.transform = `scaleX(${0.08 + 0.92 * clamp(p, 0, 1)})`);
	const mm = gsap.matchMedia();

	// Section épinglée (CSS sticky), la bande défile de droite à gauche au scroll, mobile compris
	const pin = sec.querySelector<HTMLElement>("[data-gal-pin]")!;
	mm.add("(prefers-reduced-motion: no-preference)", () => {
		const dist = () => {
			const last = track.lastElementChild as HTMLElement;
			const pad = parseFloat(getComputedStyle(track).paddingRight) || 0;
			return Math.max(0, last.offsetLeft + last.offsetWidth + pad - track.clientWidth);
		};
		// la bande avance un peu plus vite que le défilement (galerie moins longue à parcourir)
		const SPEED = 0.8;
		// hauteur de l'écran épinglé (100svh) : stable quand la barre d'adresse iOS bouge
		const setHeight = () => {
			sec.style.height = `${dist() * SPEED + (pin.offsetHeight || window.innerHeight)}px`;
		};
		setHeight();
		ScrollTrigger.addEventListener("refreshInit", setHeight);
		const tween = gsap.to(track, {
			x: () => -dist(),
			ease: "none",
			scrollTrigger: {
				trigger: sec,
				start: "top top",
				end: () => `+=${dist() * SPEED}`,
				scrub: true,
				invalidateOnRefresh: true,
				onUpdate: (self) => setBar(self.progress),
			},
		});
		// clavier : amener la carte qui reçoit le focus à l'écran
		const onFocus = (e: FocusEvent) => {
			const card = (e.target as HTMLElement).closest<HTMLElement>("li");
			if (!card) return;
			const top = sec.getBoundingClientRect().top + window.scrollY;
			const y = top + clamp(card.offsetLeft - 120, 0, dist()) * SPEED;
			lenis ? lenis.scrollTo(y, { immediate: true }) : window.scrollTo(0, y);
		};
		track.addEventListener("focusin", onFocus);
		return () => {
			ScrollTrigger.removeEventListener("refreshInit", setHeight);
			track.removeEventListener("focusin", onFocus);
			tween.scrollTrigger?.kill();
			tween.kill();
			sec.style.height = "";
			gsap.set(track, { clearProps: "transform" });
		};
	});

	// Animations réduites : carrousel natif au doigt avec accroche
	mm.add("(prefers-reduced-motion: reduce)", () => {
		const onScroll = () => setBar(track.scrollLeft / Math.max(1, track.scrollWidth - track.clientWidth));
		track.addEventListener("scroll", onScroll, { passive: true });
		onScroll();
		return () => track.removeEventListener("scroll", onScroll);
	});
}

/** Carte avant / après : onglets entre les deux paires (flèches du clavier comprises) */
export function initPairs() {
	document.querySelectorAll<HTMLElement>("[data-pair]").forEach((card) => {
		const tabs = [...card.querySelectorAll<HTMLButtonElement>("[data-pair-tab]")];
		const panels = [...card.querySelectorAll<HTMLElement>("[data-pair-panel]")];
		const select = (i: number, focus = false) => {
			tabs.forEach((t, k) => {
				t.setAttribute("aria-selected", String(k === i));
				t.tabIndex = k === i ? 0 : -1;
			});
			panels.forEach((p, k) => (p.hidden = k !== i));
			if (focus) tabs[i].focus();
		};
		tabs.forEach((t, i) => {
			t.addEventListener("click", () => select(i));
			t.addEventListener("keydown", (e) => {
				if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
				e.preventDefault();
				select((i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length, true);
			});
		});
	});
}

/** Mur de réalisations : parallaxe des colonnes (ordinateur) et légendes au toucher */
export function initMur(reduced: boolean) {
	const mur = document.querySelector<HTMLElement>("[data-mur]");
	if (!mur) return;
	const items = [...mur.querySelectorAll<HTMLElement>("[data-mur-toggle]")];
	items.forEach((btn) =>
		btn.addEventListener("click", () => {
			const li = btn.closest("li")!;
			const open = !li.classList.contains("is-open");
			items.forEach((b) => {
				b.closest("li")!.classList.remove("is-open");
				b.setAttribute("aria-pressed", "false");
			});
			li.classList.toggle("is-open", open);
			btn.setAttribute("aria-pressed", String(open));
		}),
	);
	if (reduced) return;
	const mm = gsap.matchMedia();
	// Mobile : 2 colonnes CSS ; chaque photo suit la vitesse de sa colonne (gauche / droite)
	mm.add("(max-width: 767px)", () => {
		const lis = [...mur.querySelectorAll<HTMLElement>("li.item")];
		const shift = (li: HTMLElement) => {
			const box = mur.getBoundingClientRect();
			const r = li.getBoundingClientRect();
			return r.left + r.width / 2 - box.left > box.width / 2 ? 60 : 22;
		};
		const tweens = lis.map((li) =>
			gsap.fromTo(
				li,
				{ y: () => shift(li) },
				{
					y: () => -shift(li),
					ease: "none",
					scrollTrigger: { trigger: mur, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
				},
			),
		);
		return () => tweens.forEach((t) => (t.scrollTrigger?.kill(), t.kill()));
	});
	mm.add("(min-width: 768px)", () => {
		const speeds = [70, -50, 130];
		const tweens = [...mur.querySelectorAll<HTMLElement>("[data-mur-col]")].map((col, i) =>
			gsap.fromTo(
				col,
				{ y: speeds[i] },
				{ y: -speeds[i], ease: "none", scrollTrigger: { trigger: mur, start: "top bottom", end: "bottom top", scrub: true } },
			),
		);
		return () => tweens.forEach((t) => (t.scrollTrigger?.kill(), t.kill()));
	});
}

export function initFaq(reduced: boolean) {
	const groups = document.querySelectorAll<HTMLElement>("[data-faq]");
	const refresh = debounce(() => ScrollTrigger.refresh(), 200);
	groups.forEach((group) => {
		const items = [...group.querySelectorAll<HTMLDetailsElement>("details")];
		const anim = (d: HTMLDetailsElement, open: boolean) => {
			const body = d.querySelector<HTMLElement>(".a")!;
			if (open) {
				d.open = true;
				const h = body.scrollHeight;
				body.animate([{ height: "0px", opacity: 0 }, { height: `${h}px`, opacity: 1 }], { duration: 420, easing: "cubic-bezier(.16,1,.3,1)" });
			} else {
				const h = body.scrollHeight;
				const a = body.animate([{ height: `${h}px`, opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 300, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" });
				a.onfinish = () => {
					d.open = false;
					a.cancel();
				};
			}
			refresh();
		};
		items.forEach((d) => {
			d.querySelector("summary")!.addEventListener("click", (e) => {
				if (reduced) return refresh();
				e.preventDefault();
				if (d.open) return anim(d, false);
				items.filter((o) => o !== d && o.open).forEach((o) => anim(o, false));
				anim(d, true);
			});
		});
	});
}

export function initAnchors(lenis: Lenis | undefined) {
	document.addEventListener("click", (e) => {
		const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
		if (!a) return;
		const id = a.getAttribute("href")!.slice(1);
		const target = id === "top" ? document.body : document.getElementById(id);
		if (!target) return;
		e.preventDefault();
		const header = document.querySelector<HTMLElement>("[data-header]");
		const offset = id === "top" ? 0 : -((header?.offsetHeight ?? 0) + 30);
		if (lenis) lenis.scrollTo(id === "top" ? 0 : target, { offset, duration: 1.4 });
		else window.scrollTo({ top: id === "top" ? 0 : target.getBoundingClientRect().top + window.scrollY + offset });
		if (id !== "top") {
			target.setAttribute("tabindex", "-1");
			target.focus({ preventScroll: true });
		}
	});
}

export function initCallback() {
	const form = document.querySelector<HTMLFormElement>("[data-callback]");
	if (!form) return;
	form.addEventListener("submit", (e) => {
		e.preventDefault();
		if (!form.checkValidity()) {
			form.reportValidity();
			return;
		}
		// Maquette : aucun envoi réel
		form.querySelector<HTMLElement>("[data-callback-ok]")!.hidden = false;
		form.reset();
	});
}
