import Link from "next/link";
export default function NotFound() {
  return (
    <div className="empty-state">
      <span className="eyebrow">MAISON / 404</span>
      <h1>
        A different path
        <br />
        to a beautiful place.
      </h1>
      <Link href="/en" className="button dark">
        Back to Maison ↗
      </Link>
    </div>
  );
}
