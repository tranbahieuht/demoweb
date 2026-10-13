"use client";
import { useEffect, useRef, type ReactNode } from "react";
import {
  motion,
  useReducedMotion,
  useInView,
  useMotionValue,
  useSpring,
  animate,
} from "motion/react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";
gsap.registerPlugin(ScrollTrigger);
export function SmoothScroll() {
  const pathname = usePathname();
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    let teardown = () => {};
    const start = () => {
      teardown();
      if (query.matches || !window.matchMedia("(pointer: fine)").matches)
        return;
      const lenis = new Lenis({
        duration: 1.05,
        smoothWheel: true,
        anchors: true,
        autoRaf: false,
        prevent: (node) =>
          node.closest("[data-lenis-prevent]") !== null ||
          node.closest('[role="dialog"]') !== null,
      });
      lenis.on("scroll", ScrollTrigger.update);
      const update = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(update);
      teardown = () => {
        gsap.ticker.remove(update);
        lenis.destroy();
      };
    };
    start();
    query.addEventListener("change", start);
    return () => {
      teardown();
      query.removeEventListener("change", start);
    };
  }, [pathname]);
  return null;
}
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32 }}
      animate={reduced ? { opacity: 1, y: 0 } : undefined}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{
        duration: reduced ? 0 : 0.85,
        delay: reduced ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
export function Magnetic({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0),
    y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 22 }),
    sy = useSpring(y, { stiffness: 220, damping: 22 });
  return (
    <motion.span
      className={`magnetic ${className}`}
      style={{ x: sx, y: sy }}
      onPointerMove={(event) => {
        if (reduced || event.pointerType !== "mouse") return;
        const rect = event.currentTarget.getBoundingClientRect();
        x.set((event.clientX - rect.left - rect.width / 2) * 0.1);
        y.set((event.clientY - rect.top - rect.height / 2) * 0.15);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}
export function HeroParallax({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add(
      "(min-width: 900px) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
      () => {
        const ctx = gsap.context(() => {
          gsap.fromTo(
            ".photo",
            { scale: 1.09, yPercent: -1 },
            {
              scale: 1.06,
              yPercent: 2,
              ease: "none",
              scrollTrigger: {
                trigger: ref.current?.closest(".hero"),
                start: "top top",
                end: "bottom top",
                scrub: 1,
              },
            },
          );
        }, ref);
        return () => ctx.revert();
      },
    );
    return () => media.revert();
  }, []);
  return (
    <div className="hero-image-inner" ref={ref}>
      {children}
    </div>
  );
}
export function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!ref.current) return;
    if (reduced) {
      ref.current.textContent = String(value);
      return;
    }
    if (!inView) return;
    const control = animate(0, value, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (latest) => {
        if (ref.current)
          ref.current.textContent = Math.round(latest).toString();
      },
    });
    return () => control.stop();
  }, [inView, value, reduced]);
  return (
    <span>
      <span ref={ref}>{value}</span>
      <span className="stat-suffix">{suffix}</span>
    </span>
  );
}
export function SignatureMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add(
      "(min-width: 900px) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
      () => {
        const ctx = gsap.context(() => {
          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: ref.current,
              start: "top top",
              end: "+=85%",
              scrub: 1,
              pin: true,
              anticipatePin: 1,
            },
          });
          timeline
            .fromTo(
              ".signature-frame",
              { clipPath: "inset(10% 12% 10% 12%)" },
              { clipPath: "inset(0% 0% 0% 0%)", ease: "none", duration: 1 },
            )
            .fromTo(
              ".signature-image",
              { scale: 1.14 },
              { scale: 1, ease: "none", duration: 1 },
              0,
            )
            .fromTo(
              ".signature-copy",
              { y: 60, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.6 },
              0.3,
            );
        }, ref);
        return () => ctx.revert();
      },
    );
    return () => media.revert();
  }, []);
  return (
    <section ref={ref} className="signature">
      {children}
    </section>
  );
}
export function PageTransition({ children }: { children: ReactNode }) {
  return <div className="page-transition">{children}</div>;
}
export function TextReveal({
  text,
  as = "h2",
  className = "",
  mode = "scroll",
  delay = 0,
  italicLast = false,
}: {
  text: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
  mode?: "scroll" | "load";
  delay?: number;
  italicLast?: boolean;
}) {
  const reduced = useReducedMotion();
  const Heading = as === "h1" ? motion.h1 : as === "h3" ? motion.h3 : motion.h2;
  const lines = text.split("\n");
  return (
    <Heading
      className={`text-reveal ${className}`}
      aria-label={text.replace(/\n/g, " ")}
      initial="hidden"
      animate={mode === "load" || reduced ? "visible" : undefined}
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: reduced ? 0 : 0.13,
            delayChildren: reduced ? 0 : delay,
          },
        },
      }}
    >
      {lines.map((line, index) => (
        <span className="text-mask" key={`${line}-${index}`}>
          <motion.span
            className="text-line"
            variants={{
              hidden: { y: "105%" },
              visible: {
                y: 0,
                transition: {
                  duration: reduced ? 0 : 1,
                  ease: [0.22, 1, 0.36, 1],
                },
              },
            }}
          >
            {italicLast && index === lines.length - 1 ? <em>{line}</em> : line}
          </motion.span>
        </span>
      ))}
    </Heading>
  );
}
export function ImageReveal({
  children,
  className = "",
  delay = 0,
  parallax = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  parallax?: boolean;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.12 });
  useEffect(() => {
    if (!parallax) return;
    const media = gsap.matchMedia();
    media.add(
      "(min-width: 900px) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
      () => {
        const ctx = gsap.context(() => {
          gsap.fromTo(
            ".image-reveal-media .photo",
            { scale: 1.09, yPercent: -3 },
            {
              scale: 1.03,
              yPercent: 3,
              ease: "none",
              scrollTrigger: {
                trigger: ref.current,
                start: "top bottom",
                end: "bottom top",
                scrub: 1,
              },
            },
          );
        }, ref);
        return () => ctx.revert();
      },
    );
    return () => media.revert();
  }, [parallax]);
  return (
    <div ref={ref} className={`image-reveal ${className}`}>
      <motion.div
        className="image-reveal-media"
        initial={{ clipPath: "inset(0 0 100% 0)" }}
        animate={{
          clipPath: inView || reduced ? "inset(0 0 0% 0)" : "inset(0 0 100% 0)",
        }}
        transition={{
          duration: reduced ? 0 : 1.1,
          delay: reduced ? 0 : delay,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
