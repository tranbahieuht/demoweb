"use client";
import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  Star,
  MoveDown,
} from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Photo } from "./photo";
import {
  Reveal,
  Counter,
  Magnetic,
  SignatureMotion,
  HeroParallax,
  TextReveal,
  ImageReveal,
} from "./animations";
import { Select } from "./ui/select";
import { ContactInvitation } from "./site-shell";
import { PropertyCard } from "./property-card";
import { demoStatistics } from "@/data/properties";
import { useDemoData } from "@/lib/mock-service";
import type { Locale } from "@/i18n/routing";
export function Home() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const { properties } = useDemoData();
  const reduced = useReducedMotion();
  const router = useRouter();
  const [category, setCategory] = useState("apartment");
  const [review, setReview] = useState(0);
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [budget, setBudget] = useState("");
  const track = useRef<HTMLDivElement>(null);
  const featured = properties.filter((p) => p.featured);
  const signature =
    properties.find((p) => p.slug === "the-palm-house") ??
    properties.find((p) => p.type === "villa");
  const categories = [
    { type: "apartment", image: "apartment" },
    { type: "house", image: "house" },
    { type: "villa", image: "villa" },
  ];
  const reviewers = [
    { name: "Charlotte & James", country: "United Kingdom", home: "Thảo Điền" },
    { name: "Minh & Linh", country: "Việt Nam", home: "Tây Hồ" },
    { name: "Sofia Ivanova", country: "Россия", home: "Thủ Thiêm" },
  ];
  const searchHomes = () => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (type) params.set("type", type);
    if (budget) params.set("maxPrice", budget);
    router.push(`/properties?${params}`);
  };
  return (
    <>
      <section className="hero" aria-label={t("heroKicker")}>
        <motion.div
          className="hero-image"
          initial={{ scale: 1.08, clipPath: "inset(3% 3% 3% 3%)" }}
          animate={{ scale: 1, clipPath: "inset(0% 0% 0% 0%)" }}
          transition={{ duration: reduced ? 0 : 1.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <HeroParallax>
            <Photo src="/images/hero.jpg" alt={t("heroAlt")} priority />
            <div className="hero-shade" />
          </HeroParallax>
        </motion.div>
        <div className="hero-topline">
          <span>{t("heroKicker")}</span>
          <span>10°48′ N · 106°43′ E</span>
        </div>
        <div className="hero-copy">
          <TextReveal
            as="h1"
            text={`${t("heroLine1")}\n${t("heroLine2")}`}
            italicLast
            mode="load"
            delay={0.18}
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: reduced ? 0 : 0.45,
              duration: reduced ? 0 : 0.8,
            }}
          >
            {t("heroBody")}
          </motion.p>
          <Magnetic>
            <Link href="/properties" className="hero-explore">
              {t("explore")}
              <span>
                <ArrowUpRight size={22} />
              </span>
            </Link>
          </Magnetic>
        </div>
        <div className="hero-property-note">
          <span>{signature?.name[locale]}</span>
          <p>Thảo Điền, Ho Chi Minh City</p>
          <span>01 — 12</span>
        </div>
        <motion.div
          className="hero-search"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduced ? 0 : 0.8,
            delay: reduced ? 0 : 0.55,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <label>
            <span>{t("location")}</span>
            <Select
              label={t("location")}
              value={location}
              onValueChange={setLocation}
              options={[
                { value: "", label: t("allLocations") },
                ...["Ho Chi Minh City", "Hanoi", "Da Nang", "Hoi An"].map(
                  (city) => ({ value: city, label: city }),
                ),
              ]}
            />
          </label>
          <label>
            <span>{t("propertyType")}</span>
            <Select
              label={t("propertyType")}
              value={type}
              onValueChange={setType}
              options={[
                { value: "", label: t("allTypes") },
                ...["apartment", "house", "villa", "residence"].map((type) => ({
                  value: type,
                  label: t(type),
                })),
              ]}
            />
          </label>
          <label>
            <span>{t("budget")}</span>
            <Select
              label={t("budget")}
              value={budget}
              onValueChange={setBudget}
              options={[
                { value: "", label: t("anyBudget") },
                ...[30000000, 60000000, 100000000].map((price) => ({
                  value: String(price),
                  label: `≤ ${new Intl.NumberFormat(locale).format(price)} VND`,
                })),
              ]}
            />
          </label>
          <button className="button dark" onClick={searchHomes}>
            {t("search")}
            <ArrowUpRight size={20} />
          </button>
        </motion.div>
      </section>
      <div className="hero-after">
        <span>{t("brandStrap")}</span>
        <a href="#company">
          {t("scroll")}
          <MoveDown size={15} />
        </a>
        <span>{t("established")}</span>
      </div>
      <section
        id="company"
        className="intro section-pad"
        aria-label={t("introTitle")}
      >
        <Reveal>
          <div className="eyebrow">{t("introKicker")}</div>
          <TextReveal className="intro-heading" text={t("introTitle")} />
        </Reveal>
        <div className="intro-composition">
          <div className="intro-main-photo">
            <ImageReveal className="image-fill">
              <Photo
                src="/images/residence.jpg"
                alt={t("residence")}
                sizes="(max-width: 700px) 90vw, 55vw"
              />
            </ImageReveal>
            <span className="image-caption">{t("quietLiving")}</span>
          </div>
          <div className="intro-side">
            <ImageReveal className="intro-small-photo" delay={0.1}>
              <Photo
                src="/images/detail2.jpg"
                alt={t("overview")}
                sizes="30vw"
              />
            </ImageReveal>
            <Reveal>
              <p className="body-copy">{t("introBody")}</p>
              <Link href="/contact" className="text-link">
                {t("aboutLink")}
                <ArrowUpRight size={17} />
              </Link>
            </Reveal>
          </div>
        </div>
        <Reveal className="statistics">
          {demoStatistics.map((stat) => (
            <div key={stat.key}>
              <strong>
                <Counter value={stat.value} suffix={stat.suffix} />
              </strong>
              <span>{t(stat.key)}</span>
            </div>
          ))}
        </Reveal>
        <p className="demo-note stat-note">{t("demoStats")}</p>
      </section>
      <section
        className="categories section-pad"
        aria-label={t("categoryTitle")}
      >
        <Reveal className="section-heading">
          <div className="eyebrow">{t("categoryKicker")}</div>
          <TextReveal text={t("categoryTitle")} />
        </Reveal>
        <div className="category-stage">
          <AnimatePresence mode="sync">
            {categories
              .filter((c) => c.type === category)
              .map((c) => (
                <motion.div
                  key={c.type}
                  className="category-background"
                  initial={{ opacity: 0, scale: 1.035 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduced ? 0 : 0.65 }}
                >
                  <Photo src={`/images/${c.image}.jpg`} alt={t(c.type)} />
                </motion.div>
              ))}
          </AnimatePresence>
          <div className="category-shade" />
          <div className="category-choices">
            {categories.map((c, i) => (
              <div
                className={`category-choice ${category === c.type ? "selected" : ""}`}
                key={c.type}
                onMouseEnter={() => setCategory(c.type)}
              >
                <button
                  onClick={() => setCategory(c.type)}
                  aria-pressed={category === c.type}
                >
                  <span className="category-number">0{i + 1}</span>
                  <h3>{t(c.type)}</h3>
                  <p>{t(`${c.type}Caption`)}</p>
                </button>
                <Link
                  href={`/properties?type=${c.type}`}
                  className="category-arrow"
                  aria-label={`${t("explore")}: ${t(c.type)}`}
                >
                  <ArrowUpRight size={26} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="featured section-pad" aria-label={t("featuredTitle")}>
        <Reveal className="featured-heading">
          <div>
            <div className="eyebrow">{t("featuredKicker")}</div>
            <TextReveal text={t("featuredTitle")} />
          </div>
          <Link href="/properties" className="text-link">
            {t("viewAll")}
            <ArrowUpRight size={18} />
          </Link>
        </Reveal>
        <div ref={track} className="featured-track" data-lenis-prevent>
          {featured.map((property, i) => (
            <Reveal
              key={property.id}
              className={i % 2 ? "offset-property" : ""}
            >
              <PropertyCard property={property} editorial />
            </Reveal>
          ))}
        </div>
        <div className="featured-bottom">
          <span className="small muted">
            {t("selectedAddresses", { count: featured.length })}
          </span>
          <div className="arrow-controls">
            <button
              aria-label={t("previous")}
              onClick={() =>
                track.current?.scrollBy({
                  left: -550,
                  behavior: reduced ? "instant" : "smooth",
                })
              }
            >
              <ArrowLeft size={20} />
            </button>
            <button
              aria-label={t("next")}
              onClick={() =>
                track.current?.scrollBy({
                  left: 550,
                  behavior: reduced ? "instant" : "smooth",
                })
              }
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>
      {signature && (
        <SignatureMotion>
          <div className="signature-frame">
            <Photo
              src={signature.images[0]}
              alt={signature.name[locale]}
              className="signature-image"
            />
            <div className="signature-shade" />
          </div>
          <div className="signature-copy">
            <div className="eyebrow">{t("signatureKicker")}</div>
            <TextReveal text={t("signatureTitle")} />
            <p>{t("signatureBody")}</p>
            <Link
              href={`/properties/${signature.slug}`}
              className="text-link light"
            >
              {t("details")}
              <ArrowUpRight size={18} />
            </Link>
            <div className="signature-bottom">
              <span>{signature.name[locale]}</span>
              <span>
                {signature.area} m² / {signature.bedrooms} {t("beds")}
              </span>
            </div>
          </div>
        </SignatureMotion>
      )}
      <section
        id="team"
        className="team section-pad"
        aria-label={t("teamTitle")}
      >
        <Reveal className="team-heading">
          <div className="eyebrow">{t("teamKicker")}</div>
          <TextReveal text={t("teamTitle")} />
          <p>{t("teamBody")}</p>
        </Reveal>
        <div className="team-grid">
          {[
            { name: "Clara Nguyễn", role: "director" },
            { name: "Daniel Trần", role: "advisor" },
            { name: "Sophie Lê", role: "concierge" },
          ].map((member, i) => (
            <Reveal key={member.name} delay={i * 0.08} className="team-person">
              <Link
                href="/contact"
                className="team-portrait"
                aria-label={`${t("contact")}: ${member.name}`}
              >
                <ImageReveal className="image-fill" parallax={false}>
                  <Photo
                    src={`/images/team${i + 1}.jpg`}
                    alt={member.name}
                    sizes="(max-width: 600px) 100vw, 30vw"
                  />
                </ImageReveal>
                <span>
                  <ArrowUpRight size={24} />
                </span>
              </Link>
              <h3>{member.name}</h3>
              <span className="team-role">{t(member.role)}</span>
              <p>{t(`team${i + 1}Bio`)}</p>
            </Reveal>
          ))}
        </div>
        <p className="demo-note">{t("demoReviews")}</p>
      </section>
      <section
        id="testimonials"
        className="testimonials section-pad"
        aria-label={t("reviewsKicker")}
      >
        <div className="eyebrow">{t("reviewsKicker")}</div>
        <div className="review-stars" aria-label="5 / 5">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star size={14} fill="currentColor" key={i} />
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={review}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: reduced ? 0 : 0.3 }}
          >
            <blockquote>{t(`review${review + 1}`)}</blockquote>
            <p className="review-person">
              {reviewers[review].name}
              <span>
                {reviewers[review].country} · {reviewers[review].home}
              </span>
            </p>
          </motion.div>
        </AnimatePresence>
        <div className="review-controls">
          <button
            aria-label={t("previous")}
            onClick={() => setReview((review + 2) % 3)}
          >
            <ArrowLeft size={18} />
          </button>
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              className={`review-dot ${review === i ? "selected" : ""}`}
              aria-label={`${t("next")} ${i + 1}`}
              aria-pressed={review === i}
              onClick={() => setReview(i)}
            />
          ))}
          <button
            aria-label={t("next")}
            onClick={() => setReview((review + 1) % 3)}
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </section>
      <ContactInvitation />
    </>
  );
}
