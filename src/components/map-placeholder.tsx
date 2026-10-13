"use client";
import { MapPin, ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
export function MapPlaceholder({ location }: { location: string }) {
  const t = useTranslations();
  return (
    <div className="map-figure">
      <div
        className="map-placeholder"
        role="group"
        aria-label={`${location} — ${t("mapNote")}`}
      >
        <div className="map-river" />
        <div className="map-road road1" />
        <div className="map-road road2" />
        <div className="map-road road3" />
        <span className="map-pin">
          <MapPin size={27} />
          <span>maison</span>
        </span>
        <div className="map-caption">
          <strong>{location}</strong>
          <span>{t("mapNote")}</span>
        </div>
      </div>
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
        target="_blank"
        rel="noreferrer"
        className="map-action"
      >
        {t("exploreArea")}
        <ArrowUpRight size={14} />
      </a>
    </div>
  );
}
