"use client";
import {
  useState,
  useSyncExternalStore,
  useTransition,
  type ReactNode,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight, Menu, ArrowRight, Globe2 } from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { demoCompany } from "@/data/properties";
import { Dialog } from "./ui/dialog";
import { SmoothScroll, Magnetic, TextReveal, Reveal } from "./animations";
import { Select } from "./ui/select";
const languages: { value: Locale; label: string }[] = [
  { value: "en", label: "English" },
  { value: "vi", label: "Tiếng Việt" },
  { value: "ru", label: "Русский" },
  { value: "ko", label: "한국어" },
  { value: "zh", label: "简体中文" },
];
export function LanguageSelect({ full = false }: { full?: boolean }) {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <div
      className={`language-select ${full ? "full" : ""} ${pending ? "is-pending" : ""}`}
    >
      <Globe2 size={14} />
      <Select
        label={t("language")}
        value={locale}
        options={languages}
        displayValue={
          full
            ? languages.find((l) => l.value === locale)?.label
            : locale.toUpperCase()
        }
        disabled={pending}
        onValueChange={(next) =>
          startTransition(() =>
            router.replace(
              `${pathname}${window.location.search}${window.location.hash}`,
              { locale: next as Locale },
            ),
          )
        }
      />
    </div>
  );
}
export function Wordmark() {
  return (
    <span className="wordmark">
      maison<span className="wordmark-sub">RESIDENCES · VIETNAM</span>
    </span>
  );
}
const subscribeScroll = (callback: () => void) => {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
};
const scrollSnapshot = () => window.scrollY > 64;
const serverScrollSnapshot = () => false;
export function Header() {
  const t = useTranslations();
  const [menu, setMenu] = useState(false);
  const pathname = usePathname();
  const scrolled = useSyncExternalStore(
    subscribeScroll,
    scrollSnapshot,
    serverScrollSnapshot,
  );
  const nav = [
    { label: "home", href: "/" },
    { label: "propertiesNav", href: "/properties" },
    { label: "contactNav", href: "/contact" },
  ];
  return (
    <header
      className={`site-header ${pathname === "/" ? "on-home" : ""} ${scrolled ? "is-scrolled" : ""}`}
    >
      <Link href="/" aria-label="Maison home" className="brand">
        <Wordmark />
      </Link>
      <nav className="desktop-nav" aria-label={t("exploreLabel")}>
        {nav.map((n) => (
          <Link
            className={
              (n.href === "/" ? pathname === "/" : pathname.startsWith(n.href))
                ? "active"
                : ""
            }
            aria-current={
              (n.href === "/" ? pathname === "/" : pathname.startsWith(n.href))
                ? "page"
                : undefined
            }
            key={n.label}
            href={n.href}
          >
            {t(n.label)}
          </Link>
        ))}
      </nav>
      <div className="header-actions">
        <LanguageSelect />
        <Magnetic>
          <Link href="/contact" className="nav-cta">
            {t("contact")}
            <ArrowUpRight size={16} />
          </Link>
        </Magnetic>
        <button
          className="menu-button"
          aria-label={t("menu")}
          onClick={() => setMenu(true)}
        >
          <Menu size={24} />
        </button>
      </div>
      <Dialog
        open={menu}
        onOpenChange={setMenu}
        title="maison"
        className="menu-dialog"
        closeLabel={t("close")}
      >
        <nav>
          {nav.map((n, i) => (
            <Link
              href={n.href}
              key={n.label}
              onClick={() => setMenu(false)}
              style={{ "--menu-index": i } as React.CSSProperties}
            >
              <span>0{i + 1}</span>
              {t(n.label)}
              <ArrowUpRight />
            </Link>
          ))}
        </nav>
        <div className="menu-bottom">
          <p>{t("footerBody")}</p>
          <LanguageSelect full />
          <span className="demo-note">{t("demoLabel")}</span>
        </div>
      </Dialog>
    </header>
  );
}
export function ContactInvitation() {
  const t = useTranslations();
  return (
    <section className="contact-invitation">
      <Reveal>
        <div className="eyebrow">{t("personalInvite")}</div>
      </Reveal>
      <div className="contact-invitation-main">
        <TextReveal text={t("nextChapter")} />
        <div>
          <p>{t("contactInvite")}</p>
          <Magnetic>
            <Link
              href="/contact"
              className="round-link"
              aria-label={t("startConversation")}
            >
              <ArrowUpRight size={38} />
            </Link>
          </Magnetic>
        </div>
      </div>
      <Link href="/contact" className="text-link light">
        {t("startConversation")}
        <ArrowRight size={18} />
      </Link>
    </section>
  );
}
export function Footer() {
  const t = useTranslations();
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Link href="/">
            <Wordmark />
          </Link>
          <p>{t("footerBody")}</p>
          <span className="demo-note">{t("demoLabel")}</span>
        </div>
        <div>
          <h3>{t("exploreLabel")}</h3>
          <Link href="/">{t("home")}</Link>
          <Link href="/properties">{t("propertiesNav")}</Link>
          <Link href="/contact">{t("contactNav")}</Link>
        </div>
        <div>
          <h3>{t("collection")}</h3>
          {["apartment", "house", "villa", "residence"].map((type) => (
            <Link key={type} href={`/properties?type=${type}`}>
              {t(type)}
            </Link>
          ))}
        </div>
        <div className="footer-address">
          <h3>{t("visitUs")}</h3>
          <p>
            {demoCompany.address}
            <br />
            {demoCompany.city}
          </p>
          <a href={`mailto:${demoCompany.email}`}>{demoCompany.email}</a>
          <a href="tel:+842800002026">{demoCompany.phone}</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} Maison. {t("copyright")}
        </p>
        <LanguageSelect full />
        <a href="#top" aria-label={t("home")}>
          <ArrowUpRight size={18} />
        </a>
      </div>
    </footer>
  );
}
export function SiteShell({ children }: { children: ReactNode }) {
  const t = useTranslations();
  const pathname = usePathname();
  return (
    <div className={`site-shell ${pathname === "/" ? "is-home" : ""}`}>
      <SmoothScroll />
      <a className="skip-link" href="#main">
        {t("skip")}
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </div>
  );
}
