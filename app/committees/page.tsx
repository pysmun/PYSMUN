import type { Metadata } from "next";
import { PageMotionField } from "@/components/page-motion-field";
import { Reveal } from "@/components/reveal";
import { committees } from "@/lib/content";

export const metadata: Metadata = {
  title: "Committees — UNSC, UNHRC, DISEC & More",
  description: "Explore PYSMUN's eight Model United Nations committees, from the UN Security Council, Human Rights Council and WHO to crisis and fictional committees.",
};

export default function CommitteesPage() {
  return (
    <main id="main-content" className="committees-page">
      <section className="committees-overview">
        <div className="container committees-overview__inner">
          <header className="committees-overview__header">
            <PageMotionField word="UNITED NATIONS" mobileWord="UN" className="committees-motion-field" />
            <div>
              <p className="eyebrow">PYSMUN Committees</p>
              <h1>Eight rooms. <em>Six revealed.</em></h1>
            </div>
            <div className="committees-overview__meta">
              <p>From global security and human rights to two fictional worlds still under wraps.</p>
              <span>Final reveals, agendas and dais announcements will follow.</span>
            </div>
          </header>
          <Reveal className="committee-list-page committee-list-page--overview">
            {committees.map((committee) => (
              <div className={`committee-row${committee.sealed ? " committee-row--sealed" : ""}`} key={committee.code}>
                <strong>{committee.code}</strong><h2>{committee.name}</h2><p>{committee.tone}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>
    </main>
  );
}
