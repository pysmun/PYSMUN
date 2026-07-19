import { Reveal } from "./reveal";

export function PageIntro({ eyebrow, title, accent, description, meta }: { eyebrow: string; title: string; accent?: string; description: string; meta?: React.ReactNode }) {
  return (
    <section className="page-intro">
      <div className="container page-intro__grid">
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="display">{title}<br />{accent && <em>{accent}</em>}</h1>
        </Reveal>
        <Reveal className="page-intro__meta" delay={1}>
          <p>{description}</p>
          {meta}
        </Reveal>
      </div>
    </section>
  );
}
