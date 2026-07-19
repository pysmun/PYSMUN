import type { Metadata } from "next";
import { PageMotionField } from "@/components/page-motion-field";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "About",
  description: "Discover the story, mission, vision and values behind Pakistan Youth Summit Model United Nations.",
};

const mission = [
  ["Voice", "Develop confident leaders", "Build the confidence to research, articulate and lead."],
  ["World", "Advance global awareness", "Connect local perspectives with the issues shaping our world."],
  ["Dialogue", "Encourage respectful debate", "Make disagreement thoughtful, informed and constructive."],
  ["Community", "Build youth community", "Create lasting connections across institutions and backgrounds."],
];

const values = [
  ["Leadership", "Step forward with purpose."],
  ["Integrity", "Do the work with honesty."],
  ["Respect", "Disagree without diminishing."],
  ["Diversity", "Make room for every perspective."],
  ["Innovation", "Question what is expected."],
  ["Excellence", "Raise the standard together."],
];

const reasons = [
  ["The standard", "Conference standard", "A structured setting modelled on serious Model United Nations practice."],
  ["The preparation", "Practical training", "Guidance in procedure, research, speaking and negotiation."],
  ["The network", "A wider\nnetwork", "Meet driven students from institutions and communities across Pakistan."],
  ["The growth", "Transferable skills", "Build confidence, critical thinking and collaborative discipline."],
  ["The recognition", "Recognition earned", "Certificates and awards that recognize preparation and performance."],
  ["The room", "Room for everyone", "A welcoming space for first-time and experienced delegates alike."],
];

export default function AboutPage() {
  return (
    <main id="main-content" className="about-page">
      <section className="about-overview">
        <div className="about-overview__header">
          <PageMotionField word="ORIGIN" className="about-motion-field" />
          <Reveal>
            <p className="eyebrow">About PYSMUN</p>
            <h1>Empowering tomorrow&apos;s <em>leaders.</em></h1>
          </Reveal>
          <Reveal delay={1}>
            <p className="about-overview__intro">Pakistan Youth Summit Model United Nations is a student-led youth diplomacy platform developing future leaders through public speaking, critical thinking and meaningful collaboration.</p>
          </Reveal>
        </div>

        <div className="about-origin">
          <Reveal className="about-origin__number">
            <p className="eyebrow">Founded by</p>
            <div className="about-origin__founders">
              <span>Three</span>
              <p>passionate students<br /><em>one shared vision</em></p>
            </div>
          </Reveal>
          <Reveal className="about-origin__story" delay={1}>
            <p className="eyebrow">Our story</p>
            <h2>Built by students who wanted more from the room.</h2>
            <p>PYSMUN was created to bring high-quality Model United Nations opportunities to Pakistan—giving young minds a serious space to engage with global issues and grow into confident changemakers.</p>
          </Reveal>
        </div>
      </section>

      <section className="about-mission">
        <div className="about-mission__heading">
          <Reveal>
            <p className="eyebrow">Our mission</p>
            <h2>Leadership is not announced. <em>It is practiced.</em></h2>
            <div className="about-mission__summary">
              <span>04 commitments</span>
              <p>From finding your voice to strengthening the room around you.</p>
            </div>
          </Reveal>
        </div>
        <div className="about-mission__list">
          {mission.map(([theme, title, description], index) => (
            <Reveal className="about-mission__item" delay={(index % 2) as 0 | 1} key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div className="about-mission__copy">
                <small>{theme}</small>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="about-vision">
        <span className="about-vision__backdrop" aria-hidden="true">VISION</span>
        <div className="about-vision__frame">
          <Reveal className="about-vision__lead">
            <p className="eyebrow">Our vision</p>
            <p>A national stage.<br /><em>A human purpose.</em></p>
          </Reveal>
          <Reveal className="about-vision__statement" delay={1}>
            <h2>Confidence to speak.<br /><em>Purpose to lead.</em></h2>
            <p>To become one of Pakistan&apos;s leading youth platforms—one that inspires students to lead with confidence, empathy and purpose.</p>
            <div className="about-vision__pillars" aria-label="Our vision is built around confidence, empathy and purpose">
              <span><small>01</small>Confidence</span>
              <span><small>02</small>Empathy</span>
              <span><small>03</small>Purpose</span>
            </div>
          </Reveal>
        </div>
        <div className="about-values">
          <div className="about-values__heading">
            <p className="eyebrow">Core values</p>
            <p>Six standards that shape how we build, debate and lead.</p>
          </div>
          <div className="about-values__grid">
            {values.map(([value, description], index) => (
              <Reveal className="about-values__item" delay={(index % 3) as 0 | 1 | 2} tapFeedback key={value}>
                <div>
                  <strong>{value}</strong>
                  <p>{description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="about-reasons">
        <div className="about-reasons__heading">
          <Reveal>
            <p className="eyebrow">Why choose PYSMUN</p>
            <h2>What you gain <em>from the room.</em></h2>
          </Reveal>
          <Reveal delay={1}>
            <p>Every part of the experience is designed to leave you more capable, more connected and more confident than when you entered.</p>
          </Reveal>
        </div>
        <div className="about-reasons__list">
          {reasons.map(([theme, title, description]) => (
            <Reveal className="about-reasons__item" tapFeedback key={title}>
              <span>{theme}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
