import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { PageMotionField } from "@/components/page-motion-field";

export const metadata: Metadata = {
  title: "Executive Council",
  description: "Meet the PYSMUN Executive Council as its members are revealed.",
};

export default function ExecutiveCouncilPage() {
  return (
    <main id="main-content" className="council-page">
      <section className="council-overview">
        <div className="container council-overview__inner">
          <header className="council-overview__header">
            <PageMotionField word="EXECUTIVES" mobileWord="EXECS" className="council-motion-field" />
            <div>
              <p className="eyebrow">Executive Council</p>
              <h1>The room is<br /><em>taking shape.</em></h1>
            </div>
            <div className="council-overview__intro">
              <span className="status-pill" data-status="open">Reveal series now live</span>
              <p>The Executive Council is being introduced one member at a time on social media. The complete team will appear here after the final reveal.</p>
            </div>
          </header>

          <div className="council-reveal">
            <span className="council-reveal__word" aria-hidden="true">COUNCIL</span>
            <div>
              <p className="eyebrow">Until the final reveal</p>
              <h2>Meet the team<br /><em>one reveal at a time.</em></h2>
            </div>
            <Link className="council-reveal__link" href="https://www.instagram.com/pys.mun/" target="_blank" rel="noreferrer">
              <span>Follow the reveal</span>
              <strong>@pys.mun</strong>
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
