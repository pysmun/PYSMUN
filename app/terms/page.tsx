import type { Metadata } from "next";
import Link from "next/link";
import { PageMotionField } from "@/components/page-motion-field";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms governing use of the PYSMUN website, registrations and participation in PYSMUN events.",
};

const terms = [
  { number: "01", title: "Acceptance", content: <p>By using our website or registering for PYSMUN events, you agree to these Terms.</p> },
  { number: "02", title: "Registration", content: <p>Participants must provide accurate and complete information. PYSMUN reserves the right to verify details.</p> },
  { number: "03", title: "Payments", content: <p>Registration fees are non-refundable unless otherwise stated by PYSMUN.</p> },
  {
    number: "04",
    title: "Code of Conduct",
    content: <><p>Participants must:</p><ul><li>Respect others</li><li>Follow committee rules</li><li>Avoid harassment and discrimination</li><li>Maintain professional behavior</li></ul></>,
  },
  { number: "05", title: "Intellectual Property", content: <p>PYSMUN logos, branding, website content and event materials are owned by PYSMUN and may not be copied or used without permission.</p> },
  { number: "06", title: "Event Changes", content: <p>PYSMUN reserves the right to modify schedules, speakers, committees or venues if necessary.</p> },
  { number: "07", title: "Liability", content: <p>PYSMUN is not responsible for personal belongings, travel arrangements or circumstances beyond our control.</p> },
  { number: "08", title: "Termination", content: <p>PYSMUN reserves the right to remove participants who violate the Code of Conduct or these Terms and Conditions.</p> },
];

export default function TermsPage() {
  return (
    <main id="main-content" className="terms-page">
      <section className="terms-overview">
        <div className="container terms-overview__inner">
          <PageMotionField word="PROTOCOL" floorLift={0.5} leftInset={0.4} className="terms-motion-field" />
          <div><p className="eyebrow">Legal / Participation</p><h1>Terms &amp;<br /><em>Conditions.</em></h1></div>
          <div className="terms-overview__intro"><span>Before you enter the room</span><p>Please read these terms carefully before using our website or participating in PYSMUN events.</p></div>
        </div>
      </section>

      <section className="terms-register" aria-labelledby="terms-register-title">
        <div className="container">
          <header className="terms-register__header"><p className="eyebrow" id="terms-register-title">The agreement</p><p>Eight clear conditions governing registration, conduct and participation.</p></header>
          <ol className="terms-grid">
            {terms.map((term) => <li className="terms-clause" key={term.number}><span className="terms-clause__number">{term.number}</span><div><h2>{term.title}</h2><div className="terms-clause__copy">{term.content}</div></div></li>)}
          </ol>
          <div className="terms-contact">
            <div><p className="eyebrow">Questions</p><h2>Need something<br /><em>clarified?</em></h2></div>
            <div><p>For any questions about these Terms and Conditions, contact the PYSMUN team.</p><Link href="mailto:pysmun@gmail.com">pysmun@gmail.com</Link></div>
          </div>
        </div>
      </section>
    </main>
  );
}
