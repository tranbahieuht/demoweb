import type { Locale } from "@/i18n/routing";
export type Localized = Record<Locale, string>;
export type PropertyType = "apartment" | "house" | "villa" | "residence";
export type RentalStatus = "available" | "rented" | "pending";
export interface Property {
  id: string;
  slug: string;
  name: Localized;
  description: Localized;
  location: string;
  district: string;
  type: PropertyType;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  status: RentalStatus;
  images: string[];
  amenities: string[];
  featured: boolean;
  createdAt: string;
}
export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  method: string;
  message: string;
  propertyId?: string;
  propertyName?: string;
  createdAt: string;
  status: "new" | "contacted" | "resolved";
}
export interface DemoState {
  properties: Property[];
  inquiries: Inquiry[];
}
