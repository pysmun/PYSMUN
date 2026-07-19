import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ContactChannel } from "@/components/contact-channel";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact the PYSMUN team by email, WhatsApp or Instagram for questions about applications, participation or collaboration.",
};

const channels = [
  { label: "Email", value: "pysmun@gmail.com", href: "mailto:pysmun@gmail.com", icon: "email" },
  { label: "WhatsApp", value: "+92 319 4302277", href: "https://wa.me/923194302277", icon: "whatsapp" },
  { label: "Instagram", value: "@pys.mun", href: "https://www.instagram.com/pys.mun/", icon: "instagram" },
] as const;

export default function ContactPage() {
  return (
    <main id="main-content" className="contact-page">
      <section className="contact-overview">
        <div className="container contact-overview__inner">
          <div><p className="eyebrow">Contact PYSMUN</p><h1>Get in <em>touch.</em></h1></div>
          <div className="contact-overview__intro"><span>We’re here to help</span><p>Questions about applications, participation or collaboration? We would love to hear from you.</p></div>
        </div>
      </section>

      <section className="contact-register" aria-labelledby="contact-details-title">
        <div className="container contact-register__inner">
          <aside className="contact-details">
            <header><p className="eyebrow" id="contact-details-title">Direct channels</p><p>Choose the channel that works best for you.</p></header>
            <div className="contact-channels">
              {channels.map(({ label, value, href, icon }) => (
                <ContactChannel key={label} label={label} value={value} href={href} icon={icon} />
              ))}
            </div>
            <div className="contact-faq"><p>Looking for a quick answer?</p><Link href="/faq">Visit the FAQ <ArrowUpRight aria-hidden="true" /></Link></div>
          </aside>

          <div className="contact-form-panel">
            <header><p className="eyebrow">Send an enquiry</p><h2>Tell us what <em>you need.</em></h2></header>
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}
