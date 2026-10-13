import { ContactPage } from "@/components/contact-page";
import { getTranslations } from "next-intl/server";
export async function generateMetadata() {
  const t = await getTranslations();
  return { title: t("contact") };
}
export default function Page() {
  return <ContactPage />;
}
