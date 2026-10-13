import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { PropertyListing } from "@/components/property-listing";
export async function generateMetadata() {
  const t = await getTranslations();
  return { title: t("collection") };
}
export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <div className="loading-state" aria-busy="true">
          MAISON
        </div>
      }
    >
      <PropertyListing />
    </Suspense>
  );
}
