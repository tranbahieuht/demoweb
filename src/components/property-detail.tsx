"use client";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowLeft,
  ArrowUpRight,
  Maximize,
  BedDouble,
  Bath,
  Check,
  MapPin,
} from "lucide-react";
import { useDemoData } from "@/lib/mock-service";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Gallery } from "./gallery";
import { InquiryForm } from "./inquiry-form";
import { PropertyCard, formatPrice } from "./property-card";
import { Reveal, TextReveal } from "./animations";
import type { CSSProperties } from "react";
import { MapPlaceholder } from "./map-placeholder";
export function PropertyDetail({ slug }: { slug: string }) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const { properties } = useDemoData();
  const property = properties.find((p) => p.slug === slug);
  if (!property)
    return (
      <div className="empty-state">
        <h1>{t("notFound")}</h1>
        <Link href="/properties" className="button dark">
          {t("backCollection")}
          <ArrowUpRight size={18} />
        </Link>
      </div>
    );
  const related = properties
    .filter((p) => p.id !== property.id && p.type === property.type)
    .slice(0, 3);
  const inquiryTitle = t(
    property.status === "available" ? "viewingTitle" : "availabilityInquiry",
  );
  return (
    <div className="detail-page">
      <div className="detail-breadcrumb">
        <Link href="/properties">
          <ArrowLeft size={15} />
          {t("backCollection")}
        </Link>
        <span>{property.id}</span>
      </div>
      <Gallery
        key={property.id}
        images={property.images}
        title={property.name[locale]}
      />
      <section className="detail-content section-pad">
        <Reveal className="detail-title">
          <div>
            <div className="eyebrow">
              {t(property.type)} / {property.district}
            </div>
            <TextReveal as="h1" text={property.name[locale]} />
            <p>
              <MapPin size={16} />
              {property.district}, {property.location}, Vietnam
            </p>
          </div>
          <div className="detail-rent">
            <span className={`status-tag status-${property.status}`}>
              {t(property.status)}
            </span>
            <strong>{formatPrice(property.price, locale)}</strong>
            <span>/ {t("month")}</span>
            <a className="button dark" href="#inquiry">
              {inquiryTitle}
              <ArrowUpRight size={18} />
            </a>
          </div>
        </Reveal>
        <div className="detail-columns">
          <div>
            <Reveal className="detail-overview">
              <TextReveal text={t("overview")} />
              <p className="body-copy">{property.description[locale]}</p>
              <div className="detail-specs">
                <div>
                  <Maximize size={22} />
                  <strong>{property.area} m²</strong>
                  <span>{t("area")}</span>
                </div>
                <div>
                  <BedDouble size={22} />
                  <strong>{property.bedrooms}</strong>
                  <span>{t("bedrooms")}</span>
                </div>
                <div>
                  <Bath size={22} />
                  <strong>{property.bathrooms}</strong>
                  <span>{t("bathrooms")}</span>
                </div>
              </div>
            </Reveal>
            <Reveal className="detail-section">
              <TextReveal text={t("amenities")} />
              <ul className="amenity-list">
                {property.amenities.map((amenity) => (
                  <li key={amenity}>
                    <Check size={17} />
                    {t.has(amenity) ? t(amenity) : amenity}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal className="detail-section">
              <TextReveal text={t("terms")} />
              <p className="body-copy">{t("termsBody")}</p>
            </Reveal>
            <Reveal className="detail-section">
              <TextReveal text={t("neighborhood")} />
              <MapPlaceholder
                location={`${property.district}, ${property.location}`}
              />
            </Reveal>
          </div>
          <aside id="inquiry" className="detail-inquiry">
            <div className="eyebrow">{t("contactKicker")}</div>
            <TextReveal text={inquiryTitle} />
            <p>{t("inquiryBody")}</p>
            <InquiryForm
              propertyId={property.id}
              propertyName={property.name[locale]}
            />
          </aside>
        </div>
      </section>
      {related.length > 0 && (
        <section className="related-properties section-pad">
          <div className="eyebrow">{t("collection")}</div>
          <TextReveal text={t("related")} />
          <div
            className="property-grid"
            style={
              {
                "--related-count": Math.min(related.length, 3),
              } as CSSProperties
            }
          >
            {related.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
