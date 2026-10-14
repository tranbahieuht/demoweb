"use client";
import { useTranslations } from "next-intl";
import { ArrowUpRight, Phone, Mail, Clock3 } from "lucide-react";
import { demoCompany } from "@/data/properties";
import { InquiryForm } from "./inquiry-form";
import { MapPlaceholder } from "./map-placeholder";
import { Photo } from "./photo";
import { Reveal, TextReveal, ImageReveal } from "./animations";
export function ContactPage() {
  const t = useTranslations();
  return (
    <div className="contact-page">
      <section className="contact-heading section-pad">
        <Reveal>
          <div className="eyebrow">{t("contactKicker")}</div>
          <TextReveal as="h1" text={t("contactTitle")} />
        </Reveal>
        <div className="contact-lead">
          <p>{t("contactBody")}</p>
          <span>MAISON / VIETNAM</span>
        </div>
      </section>
      <section className="contact-layout section-pad">
        <div className="contact-info">
          <ImageReveal className="contact-office-photo">
            <Photo src="/images/residence.jpg" alt={t("office")} sizes="45vw" />
          </ImageReveal>
          <div className="office-details">
            <TextReveal text={t("office")} />
            <p>
              {demoCompany.address}
              <br />
              {demoCompany.city}
            </p>
            <div className="contact-shortcuts">
              <a href="tel:+842800002026">
                <Phone size={16} />
                <span>{demoCompany.phone}</span>
                <ArrowUpRight size={14} />
              </a>
              <a href={`mailto:${demoCompany.email}`}>
                <Mail size={16} />
                <span>{demoCompany.email}</span>
                <ArrowUpRight size={14} />
              </a>
            </div>
            <p className="office-hours">
              <Clock3 size={14} />
              {t("hours")}
            </p>
            <p className="demo-note">{t("officeDemo")}</p>
          </div>
        </div>
        <div className="contact-form-panel">
          <div className="eyebrow">{t("startConversation")}</div>
          <TextReveal text={t("formTitle")} />
          <p className="form-introduction">{t("formHelp")}</p>
          <InquiryForm />
        </div>
      </section>
      <section className="contact-map section-pad">
        <MapPlaceholder
          location={`${demoCompany.address}, ${demoCompany.city}`}
        />
      </section>
    </div>
  );
}
