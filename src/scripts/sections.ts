// Interactions des sections : compteurs, galerie, avant/après, FAQ, apparitions, ancres.
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

	// Tablette et ordinateur : section épinglée (CSS sticky), la bande défile de droite à gauche
	mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
		const dist = () => {
			const last = track.lastElementChild as HTMLElement;
			const pad = parseFloat(getComputedStyle(track).paddingRight) || 0;
			return Math.max(0, last.offsetLeft + last.offsetWidth + pad - track.clientWidth);
		};
		// la bande avance un peu plus vite que le défilement (galerie moins longue à parcourir)
		const SPEED = 0.8;
		const setHeight = () => {
			sec.style.height = `${dist() * SPEED + window.innerHeight}px`;
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

	// Mobile : carrousel natif au doigt avec accroche
	mm.add("(max-width: 767px), (prefers-reduced-motion: reduce)", () => {
		const onScroll = () => setBar(track.scrollLeft / Math.max(1, track.scrollWidth - track.clientWidth));
		track.addEventListener("scroll", onScroll, { passive: true });
		onScroll();
		return () => track.removeEventListener("scroll", onScroll);
	});
}

export function initBeforeAfter(reduced: boolean) {
	document.querySelectorAll<HTMLElement>("[data-ba]").forEach((ba) => {
		const range = ba.querySelector<HTMLInputElement>("[data-ba-range]")!;
		const handle = ba.querySelector<HTMLElement>("[data-ba-handle]")!;
		const state = { pos: 50 };
		const set = (p: number) => {
			state.pos = clamp(p, 0, 100);
			ba.style.setProperty("--pos", `${state.pos}%`);
			range.value = String(Math.round(state.pos));
		};
		let dragging = false;
		let demo: gsap.core.Tween | null = null;
		const fromX = (x: number) => {
			const r = ba.getBoundingClientRect();
			set(((x - r.left) / r.width) * 100);
		};
		const down = (e: PointerEvent) => {
			dragging = true;
			demo?.kill();
			fromX(e.clientX);
			e.preventDefault();
		};
		handle.addEventListener("pointerdown", down);
		ba.addEventListener("pointerdown", (e) => {
			if (e.pointerType === "mouse" && e.target !== handle) down(e);
		});
		window.addEventListener("pointermove", (e) => dragging && fromX(e.clientX));
		window.addEventListener("pointerup", () => (dragging = false));
		window.addEventListener("pointercancel", () => (dragging = false));
		range.addEventListener("input", () => {
			demo?.kill();
			set(Number(range.value));
		});

		if (reduced) return;
		// petite démonstration la première fois que la photo est bien visible
		const io = new IntersectionObserver(
			(entries) => {
				if (!entries.some((e) => e.isIntersecting)) return;
				io.disconnect();
				demo = gsap.to(state, {
					keyframes: [{ pos: 24 }, { pos: 76 }, { pos: 50 }],
					duration: 2.6,
					ease: "power2.inOut",
					delay: 0.3,
					onUpdate: () => set(state.pos),
				});
			},
			{ threshold: 0.6 },
		);
		io.observe(ba);
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
