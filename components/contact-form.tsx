"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowUpRight, Copy } from "lucide-react";
import { emailPattern, normalizePakistaniMobile, pakistaniMobileMessage } from "@/lib/contact-validation";

type FieldName = "name" | "email" | "phone" | "subject" | "message";
type FieldErrors = Partial<Record<FieldName, string>>;

const fieldOrder: FieldName[] = ["name", "email", "phone", "subject", "message"];

const contactAddress = "pysmun@gmail.com";

function validate(values: Record<FieldName, string>): FieldErrors {
  const errors: FieldErrors = {};

  if (values.name.length < 2) errors.name = "Please enter your full name.";
  if (!emailPattern.test(values.email)) {
    errors.email = "Enter a complete email address.";
  }
  if (values.phone && !normalizePakistaniMobile(values.phone)) {
    errors.phone = pakistaniMobileMessage;
  }
  if (values.subject.length < 3) errors.subject = "Tell us what your enquiry is about.";
  if (values.message.length < 10) errors.message = "Please add a little more detail.";

  return errors;
}

export function ContactForm() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState("");
  const [composed, setComposed] = useState<{ subject: string; body: string } | null>(null);
  const [copied, setCopied] = useState(false);

  function clearError(field: FieldName) {
    setStatus("");
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function composeEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const values: Record<FieldName, string> = {
      name: String(form.get("name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
      subject: String(form.get("subject") ?? "").trim(),
      message: String(form.get("message") ?? "").trim(),
    };
    const nextErrors = validate(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStatus("Please check the highlighted fields.");
      const firstInvalid = fieldOrder.find((field) => nextErrors[field]);
      if (firstInvalid) {
        formElement.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${firstInvalid}"]`)?.focus();
      }
      return;
    }

    setErrors({});
    const phone = values.phone ? normalizePakistaniMobile(values.phone) : "";
    const body = [
      `Name: ${values.name}`,
      `Email: ${values.email}`,
      `Phone: ${phone || "Not provided"}`,
      "",
      values.message,
    ].join("\n");

    setComposed({ subject: values.subject, body });
    setCopied(false);
    setStatus("Your email app should open with the message ready. If nothing opens, use the copy option below.");
    window.location.assign(`mailto:${contactAddress}?subject=${encodeURIComponent(values.subject)}&body=${encodeURIComponent(body)}`);
  }

  async function copyMessage() {
    if (!composed) return;
    try {
      await navigator.clipboard.writeText(`To: ${contactAddress}\nSubject: ${composed.subject}\n\n${composed.body}`);
      setCopied(true);
    } catch {
      setStatus("Copying failed — please select and copy the message manually.");
    }
  }

  function fieldClass(field: FieldName) {
    return errors[field] ? "contact-form__field contact-form__field--error" : "contact-form__field";
  }

  function errorMessage(field: FieldName) {
    return errors[field] ? <small className="contact-form__error" id={`${field}-error`}>{errors[field]}</small> : null;
  }

  return (
    <form className="contact-form" method="post" onSubmit={composeEmail} noValidate>
      <div className="contact-form__grid">
        <label className={fieldClass("name")}><span>Full name</span><input name="name" autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-error" : undefined} onInput={() => clearError("name")} />{errorMessage("name")}</label>
        <label className={fieldClass("email")}><span>Email</span><input name="email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} onInput={() => clearError("email")} />{errorMessage("email")}</label>
        <label className={fieldClass("phone")}><span>Phone <small>(optional)</small></span><input name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={22} placeholder="0300 1234567" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "phone-error" : undefined} onInput={() => clearError("phone")} />{errorMessage("phone")}</label>
        <label className={fieldClass("subject")}><span>Subject</span><input name="subject" aria-invalid={Boolean(errors.subject)} aria-describedby={errors.subject ? "subject-error" : undefined} onInput={() => clearError("subject")} />{errorMessage("subject")}</label>
      </div>
      <label className={`${fieldClass("message")} contact-form__message`}><span>Message</span><textarea name="message" rows={5} aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? "message-error" : undefined} onInput={() => clearError("message")} />{errorMessage("message")}</label>
      <div className="contact-form__footer">
        <p className={Object.keys(errors).length ? "contact-form__status contact-form__status--error" : "contact-form__status"} role="status" aria-live="polite">{status || "Submitting opens your email app with the message ready to send."}</p>
        <button type="submit">Send message <ArrowUpRight aria-hidden="true" /></button>
      </div>
      {composed && (
        <div className="contact-form__fallback">
          <p>No email app? Copy your message and send it to <strong>{contactAddress}</strong> from anywhere.</p>
          <button type="button" onClick={copyMessage}><Copy aria-hidden="true" /> {copied ? "Copied" : "Copy message"}</button>
        </div>
      )}
    </form>
  );
}
