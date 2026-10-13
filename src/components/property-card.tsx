"use client";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import {
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  BedDouble,
  Maximize,
  MapPin,
  Bath,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Property } from "@/lib/types";
import type { Locale } from "@/i18n/routing";
import { Photo } from "./photo";
export function formatPrice(price: number, locale: string) {
  return new Intl.NumberFormat(locale === "vi" ? "vi-VN" : locale, {
    style: "currency",
    currency: "VND",
    currencyDisplay: "code",
    maximumFractionDigits: 0,
  }).format(price);
}
export function PropertyCard({
  property,
  editorial = false,
}: {
  property: Property;
  editorial?: boolean;
}) {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const [active, setActive] = useState(0);
  return (
    <article className={`property-card ${editorial ? "editorial-card" : ""}`}>
      <div className="property-image-wrap">
        <Link
          href={`/properties/${property.slug}`}
          className="property-image"
          aria-label={`${t("details")}: ${property.name[locale]}`}
        >
          <Photo
            key={property.images[active]}
            src={property.images[active]}
            alt={property.name[locale]}
            sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 40vw"
          />
          <span className={`status-tag status-${property.status}`}>
            {t(property.status)}
          </span>
          <span className="image-arrow">
            <ArrowUpRight size={24} />
          </span>
          <span className="property-type-label">{t(property.type)}</span>
        </Link>
        {editorial && property.images.length > 1 && (
          <div className="card-gallery-controls">
            <button
              aria-label={`${t("previous")}: ${property.name[locale]}`}
              onClick={() =>
                setActive(
                  (active + property.images.length - 1) %
                    property.images.length,
                )
              }
            >
              <ArrowLeft size={14} />
            </button>
            <span>
              {active + 1} / {property.images.length}
            </span>
            <button
              aria-label={`${t("next")}: ${property.name[locale]}`}
              onClick={() => setActive((active + 1) % property.images.length)}
            >
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
      <div className="property-card-content">
        <div className="property-location">
          <MapPin size={12} />
          {property.district} · {property.location}
        </div>
        <div className="property-title-row">
          <h3>
            <Link href={`/properties/${property.slug}`}>
              {property.name[locale]}
            </Link>
          </h3>
          <ArrowUpRight size={20} />
        </div>
        <div className="property-meta">
          <span>
            <Maximize size={14} />
            {property.area} m²
          </span>
          <span>
            <BedDouble size={14} />
            {property.bedrooms} {t("beds")}
          </span>
          <span>
            <Bath size={14} />
            {property.bathrooms} {t("baths")}
          </span>
        </div>
        <div className="property-price">
          {formatPrice(property.price, locale)}
          <span> / {t("month")}</span>
        </div>
        <div className="card-reference">
          <span>{property.id}</span>
          <Link href={`/properties/${property.slug}`}>
            {t("details")}
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>
    </article>
  );
}
