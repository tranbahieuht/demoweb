"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  LayoutDashboard,
  Building2,
  MessagesSquare,
  ArrowUpRight,
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  ArrowRight,
  RotateCcw,
  Check,
  X,
  Inbox,
} from "lucide-react";
import { mockService, useDemoData } from "@/lib/mock-service";
import type { Inquiry, Property, RentalStatus } from "@/lib/types";
import type { Locale } from "@/i18n/routing";
import { Wordmark } from "./site-shell";
import { Photo } from "./photo";
import { Dialog } from "./ui/dialog";
import { formatPrice } from "./property-card";
const statuses: RentalStatus[] = ["available", "rented", "pending"];
const localeList: Locale[] = ["en", "vi", "ru", "ko", "zh"];
const amenityOptions = [
  "pool",
  "furnished",
  "balcony",
  "parking",
  "gardenAmenity",
  "gym",
  "security",
  "riverView",
  "petFriendly",
];
const amenityLabels: Record<string, string> = {
  pool: "Private pool",
  furnished: "Fully furnished",
  balcony: "Balcony",
  parking: "Parking",
  gardenAmenity: "Garden",
  gym: "Gym",
  security: "24-hour security",
  riverView: "River view",
  petFriendly: "Pet friendly",
};
const localSchema = z.object({
  en: z.string().trim().min(2, "English content is required."),
  vi: z.string(),
  ru: z.string(),
  ko: z.string(),
  zh: z.string(),
});
const editorSchema = z.object({
  slug: z
    .string()
    .min(3)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers, and hyphens.",
    ),
  name: localSchema,
  description: localSchema.extend({
    en: z.string().trim().min(20, "Please write at least 20 characters."),
  }),
  location: z.string().min(2),
  district: z.string().min(2),
  type: z.enum(["apartment", "house", "villa", "residence"]),
  price: z.number().positive("Enter a positive price."),
  area: z.number().positive(),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().int().min(0),
  status: z.enum(statuses),
  imageUrls: z
    .string()
    .trim()
    .min(1, "At least one image is required.")
    .refine(
      (v) =>
        v
          .split("\n")
          .filter(Boolean)
          .every(
            (url) =>
              url.trim().startsWith("/images/") ||
              /^https:\/\/images\.unsplash\.com\/.+/.test(url.trim()),
          ),
      "Use local /images/ paths or HTTPS images.unsplash.com URLs.",
    ),
  amenities: z.array(z.string()),
  featured: z.boolean(),
});
type EditorValues = z.infer<typeof editorSchema>;
function PropertyEditor({
  property,
  properties,
  onDone,
}: {
  property: Property | null;
  properties: Property[];
  onDone: () => void;
}) {
  const [locale, setLocale] = useState<Locale>("en");
  const [saveError, setSaveError] = useState("");
  const emptyText = { en: "", vi: "", ru: "", ko: "", zh: "" };
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EditorValues>({
    resolver: zodResolver(editorSchema),
    defaultValues: property
      ? { ...property, imageUrls: property.images.join("\n") }
      : {
          slug: "",
          name: { ...emptyText },
          description: { ...emptyText },
          location: "Ho Chi Minh City",
          district: "Thảo Điền",
          type: "apartment",
          price: 30000000,
          area: 100,
          bedrooms: 2,
          bathrooms: 2,
          status: "available",
          imageUrls: "/images/apartment.jpg",
          amenities: ["furnished", "security"],
          featured: false,
        },
  });
  const amenities = useWatch({ control, name: "amenities" });
  const submit = (values: EditorValues) => {
    setSaveError("");
    if (
      properties.some((p) => p.slug === values.slug && p.id !== property?.id)
    ) {
      setSaveError("This URL slug is already used by another home.");
      return;
    }
    const localize = (text: EditorValues["name"]) =>
      Object.fromEntries(
        localeList.map((l) => [l, text[l].trim() || text.en.trim()]),
      ) as Property["name"];
    const next: Property = {
      id:
        property?.id ?? `MSN-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      slug: values.slug,
      name: localize(values.name),
      description: localize(values.description),
      location: values.location.trim(),
      district: values.district.trim(),
      type: values.type,
      price: values.price,
      area: values.area,
      bedrooms: values.bedrooms,
      bathrooms: values.bathrooms,
      status: values.status,
      images: values.imageUrls
        .split("\n")
        .map((v) => v.trim())
        .filter(Boolean),
      amenities: values.amenities,
      featured: values.featured,
      createdAt: property?.createdAt ?? new Date().toISOString(),
    };
    try {
      mockService.saveProperty(next);
      onDone();
    } catch {
      setSaveError(
        "Browser storage is unavailable. Enable storage and try again.",
      );
    }
  };
  const numeric = (
    key: "price" | "area" | "bedrooms" | "bathrooms",
    label: string,
  ) => (
    <label className="field">
      <span>{label}</span>
      <input
        type="number"
        min={key === "bedrooms" || key === "bathrooms" ? 0 : 1}
        step={key === "price" ? 1000000 : 1}
        {...register(key, { valueAsNumber: true })}
      />
      {errors[key] && (
        <span className="field-error">{errors[key]?.message}</span>
      )}
    </label>
  );
  return (
    <form
      className="admin-edit-form"
      onSubmit={handleSubmit(submit)}
      noValidate
    >
      <div className="localized-content">
        <div
          className="locale-tabs"
          role="tablist"
          aria-label="Content language"
        >
          {localeList.map((l) => (
            <button
              type="button"
              role="tab"
              aria-selected={locale === l}
              key={l}
              className={locale === l ? "active" : ""}
              onClick={() => setLocale(l)}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <label className="field">
          <span>Property name · {locale.toUpperCase()}</span>
          <input {...register(`name.${locale}`)} />
          {errors.name?.[locale] && (
            <span className="field-error">{errors.name[locale]?.message}</span>
          )}
        </label>
        <label className="field">
          <span>Description · {locale.toUpperCase()}</span>
          <textarea rows={4} {...register(`description.${locale}`)} />
          {errors.description?.[locale] && (
            <span className="field-error">
              {errors.description[locale]?.message}
            </span>
          )}
        </label>
        <p className="demo-note">
          English content is required. Empty translations use the English text.
          Existing homes include all five languages.
        </p>
      </div>
      <fieldset>
        <legend>Address & property</legend>
        <label className="field">
          <span>URL slug</span>
          <input {...register("slug")} />
          {errors.slug && (
            <span className="field-error">{errors.slug.message}</span>
          )}
        </label>
        <label className="field">
          <span>Type</span>
          <select {...register("type")}>
            {["apartment", "house", "villa", "residence"].map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>City</span>
          <input {...register("location")} />
          {errors.location && (
            <span className="field-error">{errors.location.message}</span>
          )}
        </label>
        <label className="field">
          <span>Neighborhood</span>
          <input {...register("district")} />
          {errors.district && (
            <span className="field-error">{errors.district.message}</span>
          )}
        </label>
        {numeric("price", "Monthly rent · VND")}
        {numeric("area", "Area · m²")}
        {numeric("bedrooms", "Bedrooms")}
        {numeric("bathrooms", "Bathrooms")}
        <label className="field">
          <span>Rental status</span>
          <select {...register("status")}>
            {statuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </label>
        <label className="check-field">
          <input type="checkbox" {...register("featured")} />
          Featured on homepage
        </label>
      </fieldset>
      <label className="field">
        <span>Gallery image URLs · one per line</span>
        <textarea rows={4} {...register("imageUrls")} />
        {errors.imageUrls && (
          <span className="field-error">{errors.imageUrls.message}</span>
        )}
      </label>
      <div>
        <p className="small muted" style={{ marginBottom: 16 }}>
          Amenities
        </p>
        <div className="admin-amenities">
          {amenityOptions.map((amenity) => (
            <label className="check-field" key={amenity}>
              <input
                type="checkbox"
                checked={amenities.includes(amenity)}
                onChange={(e) =>
                  setValue(
                    "amenities",
                    e.target.checked
                      ? [...amenities, amenity]
                      : amenities.filter((a) => a !== amenity),
                    { shouldDirty: true },
                  )
                }
              />
              {amenityLabels[amenity]}
            </label>
          ))}
        </div>
      </div>
      {Object.keys(errors).length > 0 && (
        <p className="field-error" role="alert">
          Review the highlighted fields. English name and description are
          required.
        </p>
      )}
      {saveError && (
        <p className="field-error" role="alert">
          {saveError}
        </p>
      )}
      <div className="form-actions">
        <button type="button" className="button outline" onClick={onDone}>
          Cancel
        </button>
        <button className="button dark" type="submit" disabled={isSubmitting}>
          Save property
          <Check size={17} />
        </button>
      </div>
    </form>
  );
}
export function Admin() {
  const { properties, inquiries } = useDemoData();
  const [tab, setTab] = useState("overview");
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editing, setEditing] = useState<Property | null | undefined>(
    undefined,
  );
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [confirm, setConfirm] = useState<{
    title: string;
    body: string;
    action: () => void;
  } | null>(null);
  const [notice, setNotice] = useState<{ text: string; error: boolean } | null>(
    null,
  );
  const perform = (action: () => void, message: string) => {
    try {
      action();
      setNotice({ text: message, error: false });
    } catch {
      setNotice({
        text: "Browser storage is unavailable. Your change was not saved.",
        error: true,
      });
    }
  };
  const changeTab = (next: string) => {
    setTab(next);
    setQ("");
    setStatusFilter("");
    setNotice(null);
  };
  const counts = {
    available: properties.filter((p) => p.status === "available").length,
    rented: properties.filter((p) => p.status === "rented").length,
    pending: properties.filter((p) => p.status === "pending").length,
    new: inquiries.filter((i) => i.status === "new").length,
  };
  const filteredProperties = useMemo(
    () =>
      properties.filter(
        (p) =>
          (!q ||
            `${p.name.en} ${p.id} ${p.location} ${p.district}`
              .toLowerCase()
              .includes(q.toLowerCase())) &&
          (!statusFilter || p.status === statusFilter),
      ),
    [properties, q, statusFilter],
  );
  const filteredInquiries = useMemo(
    () =>
      inquiries.filter(
        (i) =>
          (!q ||
            `${i.name} ${i.email} ${i.propertyName ?? ""}`
              .toLowerCase()
              .includes(q.toLowerCase())) &&
          (!statusFilter || i.status === statusFilter),
      ),
    [inquiries, q, statusFilter],
  );
  const actualSelected = selectedInquiry
    ? inquiries.find((i) => i.id === selectedInquiry.id)
    : null;
  const askDeleteProperty = (p: Property) =>
    setConfirm({
      title: "Delete this home?",
      body: `${p.name.en} (${p.id}) will be removed from this browser’s demo collection.`,
      action: () =>
        perform(() => mockService.deleteProperty(p.id), "Property deleted."),
    });
  const askDeleteInquiry = (i: Inquiry) =>
    setConfirm({
      title: "Delete this inquiry?",
      body: `The inquiry from ${i.name} will be removed from this browser.`,
      action: () => {
        perform(() => mockService.deleteInquiry(i.id), "Inquiry deleted.");
        setSelectedInquiry(null);
      },
    });
  const title = {
    overview: "Your collection, at a glance.",
    properties: "Property collection",
    inquiries: "Customer inquiries",
  }[tab];
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Link href="/en" className="brand">
          <Wordmark />
        </Link>
        <span className="admin-demo-badge">DEMO MODE</span>
        <nav className="admin-nav" aria-label="Administration">
          {[
            { key: "overview", label: "Overview", icon: LayoutDashboard },
            { key: "properties", label: "Properties", icon: Building2 },
            { key: "inquiries", label: "Inquiries", icon: MessagesSquare },
          ].map((n) => (
            <button
              key={n.key}
              onClick={() => changeTab(n.key)}
              className={tab === n.key ? "active" : ""}
            >
              <n.icon />
              {n.label}
              {n.key === "inquiries" && counts.new > 0 && (
                <span>({counts.new})</span>
              )}
            </button>
          ))}
        </nav>
        <Link className="admin-back" href="/en">
          View website
          <ArrowUpRight size={15} />
        </Link>
        <p className="demo-note">
          Demonstration workspace.
          <br />
          Changes stay in this browser.
        </p>
      </aside>
      <main className="admin-main">
        <div className="admin-topbar">
          <span>MAISON / RESIDENCE MANAGEMENT</span>
          <span className="admin-avatar" aria-label="Demo user">
            m
          </span>
        </div>
        <div className="admin-page-title">
          <div>
            <h1>{title}</h1>
            <p>
              {tab === "overview"
                ? "A considered view of your homes and conversations."
                : tab === "properties"
                  ? "Manage your homes, pricing, and availability."
                  : "Every new beginning starts with a conversation."}
            </p>
          </div>
          {tab === "properties" && (
            <button className="button dark" onClick={() => setEditing(null)}>
              <Plus size={16} />
              Add property
            </button>
          )}
        </div>
        {notice && (
          <div
            role="status"
            className={`admin-notice ${notice.error ? "error" : ""}`}
          >
            {notice.text}
            <button aria-label="Dismiss notice" onClick={() => setNotice(null)}>
              <X size={15} />
            </button>
          </div>
        )}
        {tab === "overview" && (
          <>
            <div className="admin-metrics">
              {[
                { label: "Total properties", value: properties.length },
                { label: "Available homes", value: counts.available },
                { label: "Rented homes", value: counts.rented },
                { label: "Pending homes", value: counts.pending },
                { label: "Total inquiries", value: inquiries.length },
                { label: "New conversations", value: counts.new },
              ].map((metric) => (
                <div className="admin-metric" key={metric.label}>
                  <span>{metric.label}</span>
                  <strong>{String(metric.value).padStart(2, "0")}</strong>
                </div>
              ))}
            </div>
            <div className="admin-dashboard-bottom">
              <section className="admin-panel">
                <div className="admin-panel-header">
                  <h2>Your collection</h2>
                  <button onClick={() => changeTab("properties")}>
                    Manage homes
                    <ArrowUpRight size={13} />
                  </button>
                </div>
                <p className="small muted">
                  Rental availability across the collection
                </p>
                <div
                  className="occupancy-bar"
                  role="img"
                  aria-label={`${counts.available} available, ${counts.rented} rented, ${counts.pending} pending`}
                >
                  <span
                    style={{
                      width: `${(counts.available / (properties.length || 1)) * 100}%`,
                      background: "#777866",
                    }}
                  />
                  <span
                    style={{
                      width: `${(counts.rented / (properties.length || 1)) * 100}%`,
                      background: "#d8c8b2",
                    }}
                  />
                  <span
                    style={{
                      width: `${(counts.pending / (properties.length || 1)) * 100}%`,
                      background: "#a98060",
                    }}
                  />
                </div>
                <div className="occupancy-legend">
                  <span>Available · {counts.available}</span>
                  <span>Rented · {counts.rented}</span>
                  <span>Pending · {counts.pending}</span>
                </div>
                <div className="admin-count">
                  {properties.filter((p) => p.featured).length} featured homes ·{" "}
                  {new Set(properties.map((p) => p.location)).size} destinations
                </div>
              </section>
              <section className="admin-panel">
                <div className="admin-panel-header">
                  <h2>Latest conversations</h2>
                  <button onClick={() => changeTab("inquiries")}>
                    View all
                    <ArrowUpRight size={13} />
                  </button>
                </div>
                {inquiries.length ? (
                  inquiries.slice(0, 3).map((i) => (
                    <button
                      className="admin-inquiry-preview"
                      key={i.id}
                      onClick={() => setSelectedInquiry(i)}
                    >
                      <div>
                        <strong>{i.name}</strong>
                        <span>{i.propertyName ?? "General inquiry"}</span>
                      </div>
                      <ArrowUpRight size={15} />
                    </button>
                  ))
                ) : (
                  <div className="admin-empty">
                    <Inbox size={25} />
                    <p>No inquiries yet.</p>
                    <p>Submit an inquiry on the website to see it here.</p>
                  </div>
                )}
              </section>
            </div>
            <div className="admin-helper">
              <p>
                <strong>Demonstration workspace.</strong> Changes remain in this
                browser. Public inquiry forms create records here; they do not
                send messages.
              </p>
              <p>
                Manage each inquiry from first contact to resolution. Restore
                the original collection whenever you want a fresh demonstration.
              </p>
              <button
                className="text-link"
                onClick={() =>
                  setConfirm({
                    title: "Restore the demonstration?",
                    body: "This replaces all property edits with the original 12 homes and removes all inquiries saved in this browser.",
                    action: () =>
                      perform(
                        () => mockService.reset(),
                        "Original demo collection restored.",
                      ),
                  })
                }
              >
                <RotateCcw size={14} />
                Restore original demo
              </button>
            </div>
          </>
        )}
        {tab === "properties" && (
          <>
            <div className="admin-toolbar">
              <label className="keyword-search">
                <Search size={17} />
                <input
                  placeholder="Search homes or reference…"
                  aria-label="Search properties"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </label>
              <select
                aria-label="Filter property status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All statuses</option>
                {statuses.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Monthly rent</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Featured</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProperties.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="admin-property-cell">
                          <div className="admin-property-thumb">
                            <Photo
                              src={p.images[0]}
                              alt={p.name.en}
                              sizes="70px"
                            />
                          </div>
                          <div>
                            <strong>{p.name.en}</strong>
                            <span>
                              {p.id} · {p.district}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td data-label="Monthly rent">
                        {formatPrice(p.price, "en")}
                      </td>
                      <td data-label="Type">{p.type}</td>
                      <td data-label="Status">
                        <select
                          className="status-select"
                          aria-label={`Status of ${p.name.en}`}
                          value={p.status}
                          onChange={(e) =>
                            perform(
                              () =>
                                mockService.saveProperty({
                                  ...p,
                                  status: e.target.value as RentalStatus,
                                }),
                              "Rental status updated.",
                            )
                          }
                        >
                          {statuses.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td data-label="Featured">
                        <label className="admin-feature-toggle">
                          <input
                            type="checkbox"
                            className="accent-stone-700"
                            aria-label={`Feature ${p.name.en}`}
                            checked={p.featured}
                            onChange={(e) =>
                              perform(
                                () =>
                                  mockService.saveProperty({
                                    ...p,
                                    featured: e.target.checked,
                                  }),
                                "Featured collection updated.",
                              )
                            }
                          />
                        </label>
                      </td>
                      <td>
                        <div className="admin-row-actions">
                          <button
                            aria-label={`Edit ${p.name.en}`}
                            onClick={() => setEditing(p)}
                          >
                            <Pencil size={13} />
                          </button>
                          <Link
                            href={`/en/properties/${p.slug}`}
                            aria-label={`View ${p.name.en}`}
                            className="inline-flex items-center justify-center w-7 h-7 border border-stone-300"
                          >
                            <Eye size={13} />
                          </Link>
                          <button
                            aria-label={`Delete ${p.name.en}`}
                            onClick={() => askDeleteProperty(p)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!filteredProperties.length && (
                <div className="admin-empty">No homes match your search.</div>
              )}
            </div>
            <p className="admin-count">
              {filteredProperties.length} properties in this view
            </p>
          </>
        )}
        {tab === "inquiries" && (
          <>
            <div className="admin-toolbar">
              <label className="keyword-search">
                <Search size={17} />
                <input
                  placeholder="Search names, emails, or properties…"
                  aria-label="Search inquiries"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </label>
              <select
                aria-label="Filter inquiry status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All statuses</option>
                {["new", "contacted", "resolved"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Property</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInquiries.map((i) => (
                    <tr key={i.id}>
                      <td>
                        <strong className="font-medium">{i.name}</strong>
                        <br />
                        <span className="muted">{i.email}</span>
                      </td>
                      <td data-label="Property">
                        {i.propertyName ?? "General inquiry"}
                        <br />
                        <span className="muted">{i.propertyId ?? "—"}</span>
                      </td>
                      <td data-label="Submitted">
                        {new Date(i.createdAt).toLocaleString("en-GB", {
                          timeZone: "Asia/Ho_Chi_Minh",
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td data-label="Status">
                        <select
                          className="status-select"
                          aria-label={`Status of inquiry from ${i.name}`}
                          value={i.status}
                          onChange={(e) =>
                            perform(
                              () =>
                                mockService.updateInquiry(
                                  i.id,
                                  e.target.value as Inquiry["status"],
                                ),
                              "Inquiry status updated.",
                            )
                          }
                        >
                          {["new", "contacted", "resolved"].map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <div className="admin-row-actions">
                          <button
                            aria-label={`View inquiry from ${i.name}`}
                            onClick={() => setSelectedInquiry(i)}
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            aria-label={`Delete inquiry from ${i.name}`}
                            onClick={() => askDeleteInquiry(i)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!filteredInquiries.length && (
                <div className="admin-empty">
                  <MessagesSquare size={25} />
                  No inquiries in this view. Submit the public contact form to
                  start.
                </div>
              )}
            </div>
            <p className="admin-count">
              {filteredInquiries.length} inquiries in this view · Vietnam time
              (UTC+7)
            </p>
          </>
        )}
      </main>
      <Dialog
        open={editing !== undefined}
        onOpenChange={(open) => {
          if (!open) setEditing(undefined);
        }}
        title={editing ? "Edit property" : "Add a new property"}
        className="admin-edit-dialog"
      >
        {editing !== undefined && (
          <PropertyEditor
            key={editing?.id ?? "new"}
            property={editing}
            properties={properties}
            onDone={() => setEditing(undefined)}
          />
        )}
      </Dialog>
      <Dialog
        open={!!actualSelected}
        onOpenChange={(open) => {
          if (!open) setSelectedInquiry(null);
        }}
        title="A new conversation"
      >
        {actualSelected && (
          <>
            <div className="inquiry-detail-grid">
              {[
                { label: "Customer", value: actualSelected.name },
                { label: "Preferred contact", value: actualSelected.method },
                { label: "Email", value: actualSelected.email },
                { label: "Phone", value: actualSelected.phone },
                {
                  label: "Property",
                  value: actualSelected.propertyName ?? "General inquiry",
                },
                { label: "Reference", value: actualSelected.propertyId ?? "—" },
                {
                  label: "Submitted · Vietnam time",
                  value: new Date(actualSelected.createdAt).toLocaleString(
                    "en-GB",
                    { timeZone: "Asia/Ho_Chi_Minh" },
                  ),
                },
              ].map((field) => (
                <div key={field.label}>
                  <span>{field.label}</span>
                  {field.value}
                </div>
              ))}
              <label className="field">
                <span>Inquiry status</span>
                <select
                  value={actualSelected.status}
                  onChange={(e) =>
                    perform(
                      () =>
                        mockService.updateInquiry(
                          actualSelected.id,
                          e.target.value as Inquiry["status"],
                        ),
                      "Inquiry status updated.",
                    )
                  }
                >
                  {["new", "contacted", "resolved"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="inquiry-message">{actualSelected.message}</div>
            <p className="inquiry-modal-note">
              Demo record. This inquiry has not been sent to a company.
            </p>
          </>
        )}
      </Dialog>
      <Dialog
        open={!!confirm}
        onOpenChange={(open) => {
          if (!open) setConfirm(null);
        }}
        title={confirm?.title ?? "Confirm"}
        className="admin-confirm-dialog"
      >
        <p>{confirm?.body}</p>
        <div className="form-actions">
          <button className="button outline" onClick={() => setConfirm(null)}>
            Cancel
          </button>
          <button
            className="button dark"
            onClick={() => {
              confirm?.action();
              setConfirm(null);
            }}
          >
            Confirm
            <ArrowRight size={17} />
          </button>
        </div>
      </Dialog>
    </div>
  );
}
