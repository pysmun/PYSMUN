import type { Metadata } from "next";
import { AdminConsole } from "@/components/admin-console";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <main id="main-content" className="admin-page">
      <AdminConsole />
    </main>
  );
}
