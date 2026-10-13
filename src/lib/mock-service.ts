"use client";
import { useSyncExternalStore } from "react";
import { z } from "zod";
import { seedProperties } from "@/data/properties";
import type { DemoState, Inquiry, Property } from "./types";
const storageKey = "maison-demo-v1";
const localText = z.object({
  en: z.string(),
  vi: z.string(),
  ru: z.string(),
  ko: z.string(),
  zh: z.string(),
});
const propertySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: localText,
  description: localText,
  location: z.string(),
  district: z.string(),
  type: z.enum(["apartment", "house", "villa", "residence"]),
  price: z.number().positive(),
  area: z.number().positive(),
  bedrooms: z.number().int().nonnegative(),
  bathrooms: z.number().int().nonnegative(),
  status: z.enum(["available", "rented", "pending"]),
  images: z.array(z.string()).min(1),
  amenities: z.array(z.string()),
  featured: z.boolean(),
  createdAt: z.string(),
});
const inquirySchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
  email: z.string(),
  method: z.string(),
  message: z.string(),
  propertyId: z.string().optional(),
  propertyName: z.string().optional(),
  createdAt: z.string(),
  status: z.enum(["new", "contacted", "resolved"]),
});
const stateSchema = z.object({
  properties: z.array(propertySchema),
  inquiries: z.array(inquirySchema),
});
const initial: DemoState = { properties: seedProperties, inquiries: [] };
let state: DemoState = initial;
let loaded = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());
function readStorage() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = stateSchema.safeParse(JSON.parse(raw));
      if (parsed.success) state = parsed.data;
    }
  } catch {
    /* A blocked store remains readable using seed data. Writes report errors. */
  }
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  ensureLoaded();
  const sync = (event: StorageEvent) => {
    if (event.key === storageKey) {
      state = initial;
      readStorage();
      emit();
    }
  };
  window.addEventListener("storage", sync);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", sync);
  };
}
function ensureLoaded() {
  if (!loaded) {
    loaded = true;
    readStorage();
  }
}
function commit(next: DemoState) {
  // Write first: a failed browser write must never be reported as a successful submission.
  localStorage.setItem(storageKey, JSON.stringify(next));
  state = next;
  emit();
}
export function useDemoData() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => initial,
  );
}
export const mockService = {
  saveProperty(property: Property) {
    ensureLoaded();
    const next = state.properties.some((p) => p.id === property.id)
      ? state.properties.map((p) => (p.id === property.id ? property : p))
      : [property, ...state.properties];
    commit({ ...state, properties: next });
  },
  deleteProperty(id: string) {
    ensureLoaded();
    commit({
      ...state,
      properties: state.properties.filter((p) => p.id !== id),
    });
  },
  saveInquiry(input: Omit<Inquiry, "id" | "status" | "createdAt">) {
    ensureLoaded();
    const inquiry: Inquiry = {
      ...input,
      id: crypto.randomUUID(),
      status: "new",
      createdAt: new Date().toISOString(),
    };
    commit({ ...state, inquiries: [inquiry, ...state.inquiries] });
    return inquiry;
  },
  updateInquiry(id: string, status: Inquiry["status"]) {
    ensureLoaded();
    commit({
      ...state,
      inquiries: state.inquiries.map((i) =>
        i.id === id ? { ...i, status } : i,
      ),
    });
  },
  deleteInquiry(id: string) {
    ensureLoaded();
    commit({ ...state, inquiries: state.inquiries.filter((i) => i.id !== id) });
  },
  reset() {
    commit({ properties: structuredClone(seedProperties), inquiries: [] });
  },
};
