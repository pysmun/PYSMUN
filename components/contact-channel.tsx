"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, AtSign, Check, Copy, Mail, MessageCircle } from "lucide-react";

type ContactIcon = "email" | "whatsapp" | "instagram";

type ContactChannelProps = {
  label: string;
  value: string;
  href: string;
  icon: ContactIcon;
};

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      // Local review links may not expose the secure Clipboard API. Use the
      // selection fallback below so copying still works there.
    }
  }

  const input = document.createElement("textarea");
  input.value = value;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  input.remove();
}

export function ContactChannel({ label, value, href, icon }: ContactChannelProps) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<number | null>(null);
  const external = href.startsWith("http");
  const Icon = icon === "email" ? Mail : icon === "whatsapp" ? MessageCircle : AtSign;

  useEffect(() => () => {
    if (resetTimer.current) window.clearTimeout(resetTimer.current);
  }, []);

  const handleCopy = async () => {
    try {
      await copyText(value);
      setCopied(true);
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="contact-channel">
      <a
        className="contact-channel__link"
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
        draggable={false}
        onDragStart={(event) => event.preventDefault()}
      >
        <span className="contact-channel__icon"><Icon aria-hidden="true" /></span>
        <span className="contact-channel__value"><small>{label}</small><strong>{value}</strong></span>
        <ArrowUpRight className="contact-channel__open" aria-hidden="true" />
      </a>
      <button
        className="contact-channel__copy"
        type="button"
        onClick={handleCopy}
        aria-label={`Copy ${label}: ${value}`}
        title={`Copy ${label}`}
      >
        {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
      </button>
    </div>
  );
}
