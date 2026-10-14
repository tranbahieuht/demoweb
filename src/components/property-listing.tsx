"use client";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Search,
  SlidersHorizontal,
  ArrowUpRight,
  LayoutGrid,
  List,
  RotateCcw,
  X,
} from "lucide-react";
import { useDemoData } from "@/lib/mock-service";
import type { Locale } from "@/i18n/routing";
import { PropertyCard } from "./property-card";
import { Dialog } from "./ui/dialog";
import { Reveal, TextReveal } from "./animations";
import { Select } from "./ui/select";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
type Filters = {
  q: string;
  type: string;
  location: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  sort: string;
};
const defaults: Filters = {
  q: "",
  type: "",
  location: "",
  minPrice: "",
  maxPrice: "",
  bedrooms: "",
  sort: "newest",
};
export function PropertyListing() {
  const params = useSearchParams();
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const { properties } = useDemoData();
  const reduced = useReducedMotion();
  const normalize = (value: string) =>
    value
      .toLocaleLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/đ/g, "d");
  const filters = useMemo<Filters>(
    () =>
      Object.fromEntries(
        Object.entries(defaults).map(([key, value]) => [
          key,
          params.get(key) ?? value,
        ]),
      ) as Filters,
    [params],
  );
  const [drawer, setDrawer] = useState(false);
  const [view, setView] = useState("grid");
  const update = (key: keyof Filters, value: string) => {
    // Read the latest URL so consecutive edits cannot overwrite a filter before
    // useSearchParams has delivered its next render.
    const query = new URLSearchParams(window.location.search);
    if (value && value !== defaults[key]) query.set(key, value);
    else query.delete(key);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${query.size ? `?${query}` : ""}`,
    );
  };
  const reset = () => {
    window.history.replaceState(null, "", window.location.pathname);
  };
  const filtered = useMemo(
    () =>
      properties
        .filter((p) => {
          const match = normalize(
            `${p.name[locale]} ${p.name.en} ${p.location} ${p.district} ${p.id}`,
          );
          return (
            (!filters.q || match.includes(normalize(filters.q.trim()))) &&
            (!filters.type || p.type === filters.type) &&
            (!filters.location || p.location === filters.location) &&
            (!filters.minPrice || p.price >= Number(filters.minPrice)) &&
            (!filters.maxPrice || p.price <= Number(filters.maxPrice)) &&
            (!filters.bedrooms || p.bedrooms >= Number(filters.bedrooms))
          );
        })
        .sort((a, b) =>
          filters.sort === "priceAsc"
            ? a.price - b.price
            : filters.sort === "priceDesc"
              ? b.price - a.price
              : Date.parse(b.createdAt) - Date.parse(a.createdAt),
        ),
    [properties, filters, locale],
  );
  const activeCount = Object.entries(filters).filter(
    ([key, value]) => key !== "q" && key !== "sort" && !!value,
  ).length;
  const controls = (
    <>
      <label className="field">
        <span>{t("propertyType")}</span>
        <Select
          label={t("propertyType")}
          value={filters.type}
          onValueChange={(value) => update("type", value)}
          options={[
            { value: "", label: t("allTypes") },
            ...["apartment", "house", "villa", "residence"].map((type) => ({
              value: type,
              label: t(type),
            })),
          ]}
        />
      </label>
      <label className="field">
        <span>{t("location")}</span>
        <Select
          label={t("location")}
          value={filters.location}
          onValueChange={(value) => update("location", value)}
          options={[
            { value: "", label: t("allLocations") },
            ...[...new Set(properties.map((p) => p.location))].map((city) => ({
              value: city,
              label: city,
            })),
          ]}
        />
      </label>
      <label className="field">
        <span>{t("bedrooms")}</span>
        <Select
          label={t("bedrooms")}
          value={filters.bedrooms}
          onValueChange={(value) => update("bedrooms", value)}
          options={[
            { value: "", label: t("any") },
            ...[1, 2, 3, 4].map((n) => ({ value: String(n), label: `${n}+` })),
          ]}
        />
      </label>
      <label className="field">
        <span>{t("minPrice")}</span>
        <input
          aria-label={t("minPrice")}
          type="number"
          min="0"
          step="1000000"
          value={filters.minPrice}
          onChange={(e) => update("minPrice", e.target.value)}
          placeholder="0"
        />
      </label>
      <label className="field">
        <span>{t("maxPrice")}</span>
        <input
          aria-label={t("maxPrice")}
          type="number"
          min="0"
          step="1000000"
          value={filters.maxPrice}
          onChange={(e) => update("maxPrice", e.target.value)}
          placeholder="100,000,000"
        />
      </label>
      <button onClick={reset} className="reset-filters">
        <RotateCcw size={14} />
        {t("reset")}
      </button>
    </>
  );
  return (
    <div className="listing-page">
      <section className="listing-heading section-pad">
        <Reveal>
          <div className="eyebrow">{t("listingsKicker")}</div>
          <TextReveal as="h1" text={t("listingsTitle")} />
        </Reveal>
        <p>{t("listingsBody")}</p>
      </section>
      <section className="discovery section-pad">
        <div className="search-line">
          <label className="keyword-search">
            <Search size={19} />
            <input
              aria-label={t("keyword")}
              placeholder={t("keyword")}
              value={filters.q}
              onChange={(e) => update("q", e.target.value)}
            />
          </label>
          <button
            className="mobile-filter-button"
            onClick={() => setDrawer(true)}
          >
            <SlidersHorizontal size={18} />
            {t("filters")}
            {activeCount > 0 && <span>{activeCount}</span>}
          </button>
        </div>
        <div className="desktop-filters">{controls}</div>
        <div className="active-filters">
          <AnimatePresence initial={false}>
            {Object.entries(filters)
              .filter(([key, value]) => key !== "sort" && !!value)
              .map(([key, value]) => {
                const label =
                  key === "q"
                    ? value
                    : key === "type"
                      ? t(value)
                      : key === "minPrice" || key === "maxPrice"
                        ? `${key === "minPrice" ? "≥" : "≤"} ${new Intl.NumberFormat(locale).format(Number(value))} VND`
                        : key === "bedrooms"
                          ? `${value}+ ${t("beds")}`
                          : value;
                return (
                  <motion.button
                    key={key}
                    className="filter-chip"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: reduced ? 0 : 0.2 }}
                    onClick={() => update(key as keyof Filters, "")}
                    aria-label={t("removeFilter", { label })}
                  >
                    {label}
                    <X size={12} />
                  </motion.button>
                );
              })}
          </AnimatePresence>
        </div>
        <div className="results-bar">
          <p aria-live="polite">{t("results", { count: filtered.length })}</p>
          <div>
            <Select
              label={t("sort")}
              value={filters.sort}
              onValueChange={(value) => update("sort", value)}
              options={["newest", "priceAsc", "priceDesc"].map((sort) => ({
                value: sort,
                label: t(sort),
              }))}
            />
            <div className="view-controls">
              <button
                aria-label={t("grid")}
                aria-pressed={view === "grid"}
                onClick={() => setView("grid")}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                aria-label={t("list")}
                aria-pressed={view === "list"}
                onClick={() => setView("list")}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
        {filtered.length ? (
          <div
            className={`property-grid ${view === "list" ? "property-list" : ""}`}
          >
            {filtered.map((property, index) => (
              <Reveal
                key={property.id}
                delay={Math.min((index % 3) * 0.08, 0.16)}
              >
                <PropertyCard property={property} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-monogram">m.</span>
            <h2>{t("noResults")}</h2>
            <p>{t("noResultsBody")}</p>
            <button className="button dark" onClick={reset}>
              {t("reset")}
              <ArrowUpRight size={18} />
            </button>
          </div>
        )}
      </section>
      <Dialog
        open={drawer}
        onOpenChange={setDrawer}
        title={t("filters")}
        className="filter-dialog"
        closeLabel={t("close")}
      >
        <div className="drawer-controls">{controls}</div>
        <button className="button dark" onClick={() => setDrawer(false)}>
          {t("apply")} ({filtered.length})<ArrowUpRight size={18} />
        </button>
      </Dialog>
    </div>
  );
}
