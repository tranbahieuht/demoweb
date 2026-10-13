import { PropertyDetail } from "@/components/property-detail";
import { seedProperties } from "@/data/properties";
import type { Locale } from "@/i18n/routing";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const property = seedProperties.find((p) => p.slug === slug);
  return {
    title: property?.name[locale] ?? "The Maison Collection",
    description: property?.description[locale],
  };
}
export default async function DetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PropertyDetail slug={slug} />;
}
