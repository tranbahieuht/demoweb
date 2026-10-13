"use client";
import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Expand } from "lucide-react";
import { Photo } from "./photo";
import { Dialog } from "./ui/dialog";
export function Gallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const t = useTranslations();
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const touch = useRef<number | null>(null);
  const move = (direction: number) =>
    setActive((n) => (n + direction + images.length) % images.length);
  const controls = (
    <>
      <button aria-label={t("previous")} onClick={() => move(-1)}>
        <ArrowLeft size={22} />
      </button>
      <span>
        {String(active + 1).padStart(2, "0")} /{" "}
        {String(images.length).padStart(2, "0")}
      </span>
      <button aria-label={t("next")} onClick={() => move(1)}>
        <ArrowRight size={22} />
      </button>
    </>
  );
  const photo = (
    <AnimatePresence initial={false} mode="sync">
      <motion.div
        key={active}
        className="gallery-slide"
        initial={{ opacity: 0, scale: 1.025 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduced ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <Photo
          src={images[active]}
          alt={`${title} — ${active + 1}`}
          priority={active === 0}
        />
      </motion.div>
    </AnimatePresence>
  );
  const touchProps = {
    onTouchCancel: () => {
      touch.current = null;
    },
    onTouchStart: (e: React.TouchEvent) => {
      touch.current = e.touches[0].clientX;
    },
    onTouchEnd: (e: React.TouchEvent) => {
      if (touch.current !== null) {
        const diff = touch.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 45) move(diff > 0 ? 1 : -1);
        touch.current = null;
      }
    },
  };
  return (
    <div className="gallery">
      <div className="gallery-main" {...touchProps}>
        {photo}
        <button
          className="gallery-expand"
          aria-label={t("gallery")}
          onClick={() => setOpen(true)}
        >
          <Expand size={18} />
          <span>{t("gallery")}</span>
        </button>
        <div className="gallery-controls">{controls}</div>
      </div>
      <div className="gallery-thumbnails">
        {images.map((src, i) => (
          <button
            key={`${src}-${i}`}
            onClick={() => setActive(i)}
            aria-label={`${title} — ${i + 1}`}
            aria-pressed={active === i}
            className={active === i ? "active" : ""}
          >
            <Photo src={src} alt={`${title} — ${i + 1}`} sizes="150px" />
          </button>
        ))}
      </div>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        className="gallery-dialog"
        closeLabel={t("close")}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            move(-1);
          }
          if (event.key === "ArrowRight") {
            event.preventDefault();
            move(1);
          }
        }}
      >
        <div className="fullscreen-image" {...touchProps} tabIndex={0}>
          {photo}
        </div>
        <div className="gallery-controls">{controls}</div>
        <p className="small gallery-demo">{t("demoLabel")}</p>
      </Dialog>
    </div>
  );
}
