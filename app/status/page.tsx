import type { Metadata } from "next";
import { ApplicationStatusLookup } from "@/components/application-status-lookup";

export const metadata: Metadata = {
  title: "Check Application Status",
  description: "Check the status of your PYSMUN application using your Application ID and email.",
  robots: { index: false, follow: false },
};

export default function StatusPage() {
  return (
    <main id="main-content" className="status-page">
      <section className="container status-shell">
        <ApplicationStatusLookup />
      </section>
    </main>
  );
}
