import type { Metadata } from "next";
import { CampusAmbassadorForm } from "@/components/campus-ambassador-form";

export const metadata: Metadata = {
  title: "Campus Ambassador Application",
  description: "Apply to represent PYSMUN at your institution as a Campus Ambassador.",
};

export default function CampusAmbassadorApplicationPage() {
  return (
    <main id="main-content" className="form-page">
      <aside className="form-aside">
        <div>
          <p className="eyebrow">Campus Ambassador Program</p>
          <h1>Put your campus<br /><em>on the map.</em></h1>
          <p>Represent your institution, connect students with PYSMUN and help grow a nationwide diplomacy network.</p>
        </div>
        <div className="form-aside__foot">
          <span className="status-pill" data-status="open">Applications open</span>
          <p>Your institution → PYSMUN</p>
        </div>
      </aside>
      <section className="form-main">
        <CampusAmbassadorForm />
      </section>
    </main>
  );
}
