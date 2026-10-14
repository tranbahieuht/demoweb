import { notFound } from "next/navigation";
import { Admin } from "@/components/admin";

export const metadata = {
  title: "Demo Administration | Maison",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  // Retain the existing tools for explicit local demos, outside the public site.
  if (
    process.env.NODE_ENV !== "development" ||
    process.env.MAISON_DEMO_ADMIN !== "true"
  ) {
    notFound();
  }
  return <Admin />;
}
