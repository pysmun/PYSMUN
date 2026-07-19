import { ArrowLeft, Bell } from "lucide-react";
import Link from "next/link";
import { PageIntro } from "./page-intro";

export function ComingSoonApplication({ eyebrow, title, description, items }: { eyebrow: string; title: string; description: string; items: string[] }) {
  return (
    <main id="main-content" className="page-shell">
      <PageIntro eyebrow={eyebrow} title={title} accent="applications" description={description} meta={<div className="button-row"><span className="status-pill" data-status="coming-soon">Opening soon</span></div>} />
      <section className="section section--light">
        <div className="container split-content">
          <div>
            <p className="eyebrow">What to expect</p>
            <h2 className="headline">Prepare your<br /><em>best case.</em></h2>
          </div>
          <div className="stack-list">
            {items.map((item, index) => <div key={item}><span>0{index + 1}</span><p>{item}</p></div>)}
            <div className="notice-card"><Bell size={20} /><p>Application dates and final requirements will be announced through official PYSMUN channels.</p></div>
            <Link className="btn btn--dark" href="/applications"><ArrowLeft size={15} /> All applications</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
