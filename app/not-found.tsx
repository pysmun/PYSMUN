import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { NotFoundField } from "@/components/not-found-field";

export const metadata: Metadata = { title: "Page Not Found" };

export default function NotFound() {
  return (
    <main id="main-content" className="not-found-page">
      <NotFoundField />
      <div className="not-found">
        <p className="eyebrow">Error 404</p>
        <h1>This page has<br /><em>left the room.</em></h1>
        <p className="not-found__note">The address you followed does not exist or has moved. These doors are still open.</p>
        <div className="not-found__links">
          <Link href="/">Back to home <ArrowUpRight aria-hidden="true" /></Link>
          <Link href="/applications">View applications <ArrowUpRight aria-hidden="true" /></Link>
          <Link href="/status">Check application status <ArrowUpRight aria-hidden="true" /></Link>
        </div>
      </div>
    </main>
  );
}
