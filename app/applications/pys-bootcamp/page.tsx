import type { Metadata } from "next";
import { PysBootcampForm } from "@/components/training-camp-form";
import { bootcampFacts } from "@/lib/content";

export const metadata: Metadata = { title: "PYS Bootcamp Application", description: `Apply for the official PYS Bootcamp, ${bootcampFacts.dates} in ${bootcampFacts.city}.` };

export default function PysBootcampApplicationPage() {
  return <main id="main-content" className="form-page"><aside className="form-aside"><div><p className="eyebrow">PYS Bootcamp</p><h1>Start before<br /><em>the gavel.</em></h1><p>A practical introduction to procedure, speaking, negotiation and resolution writing.</p></div><div className="form-aside__foot"><div className="form-aside__fee"><span>Bootcamp fee</span><strong>{bootcampFacts.fee}</strong></div><span className="status-pill" data-status="open">Applications open</span><p className="form-aside__facts"><span>{bootcampFacts.datesShort}</span><span>{bootcampFacts.city}</span><span>Application deadline: {bootcampFacts.deadline}</span></p></div></aside><section className="form-main"><PysBootcampForm /></section></main>;
}
