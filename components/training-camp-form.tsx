"use client";

import { ArrowLeft, ArrowRight, Check, Copy, LoaderCircle } from "lucide-react";
import Script from "next/script";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Field, FormRail, FormSuccess, PhoneField, ReviewLedger, SelectField, StepNumeral, TextareaField } from "@/components/application-form-kit";
import { ApplicationPhotoField } from "@/components/application-photo-field";
import { cnicPattern, formatCnic } from "@/lib/cnic";
import { emailPattern, formatPakistaniNationalNumber, pakistaniMobileMessage, pakistaniNationalMobilePattern } from "@/lib/contact-validation";
import { bootcampFacts } from "@/lib/content";
import { paymentAccount } from "@/lib/payment";

type Values = {
  fullName: string; cnic: string; email: string; whatsapp: string; alternatePhone: string; age: string;
  city: string; institution: string; educationLevel: string; experience: string;
  motivation: string; requirements: string; referral: string; transactionReference: string; consent: boolean; website: string;
};

const initialValues: Values = { fullName: "", cnic: "", email: "", whatsapp: "", alternatePhone: "", age: "", city: "", institution: "", educationLevel: "", experience: "", motivation: "", requirements: "", referral: "", transactionReference: "", consent: false, website: "" };

const stepFields: (keyof Values)[][] = [
  ["fullName", "cnic", "email", "whatsapp", "age", "city"],
  ["institution", "educationLevel", "experience", "motivation"],
  ["transactionReference"],
  ["consent"],
];

const stepNames = ["Identity", "Background", "Payment", "Declaration"];
const lastStep = stepNames.length - 1;

function CopyableDetail({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // The value stays selectable by hand.
    }
  };

  return (
    <div>
      <span>{label}</span>
      <span className="payment-slip__value">
        <strong>{value}</strong>
        <button type="button" className="payment-slip__copy" data-copied={copied || undefined} onClick={copy} aria-label={`Copy ${label.toLowerCase()}`}>
          {copied ? <><Check aria-hidden="true" /> Copied</> : <><Copy aria-hidden="true" /> Copy</>}
        </button>
      </span>
    </div>
  );
}

const experienceLabels: Record<string, string> = {
  none: "No previous MUNs",
  "one-two": "1–2 conferences",
  "three-plus": "3 or more conferences",
};

export function PysBootcampForm() {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState(initialValues);
  const [photo, setPhoto] = useState<File | null>(null);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  // Turnstile only auto-renders widgets present when its script first loads;
  // our widget mounts on the final step, so render it explicitly.
  useEffect(() => {
    if (!siteKey || step !== lastStep) return;
    const element = document.querySelector<HTMLElement>(".cf-turnstile");
    if (!element || element.childElementCount > 0) return;
    const turnstile = (window as { turnstile?: { render?: (el: HTMLElement, options: { sitekey: string; theme?: string }) => void } }).turnstile;
    turnstile?.render?.(element, { sitekey: siteKey, theme: "light" });
  }, [siteKey, step]);

  const update = (name: keyof Values, value: string | boolean) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => { const next = { ...current }; delete next[name]; return next; });
    setMessage("");
  };

  const setFileError = (field: "photo" | "receipt") => (error?: string) => {
    setErrors((current) => {
      const next = { ...current };
      if (error) next[field] = [error];
      else delete next[field];
      return next;
    });
  };
  const setPhotoError = setFileError("photo");
  const setReceiptError = setFileError("receipt");

  const validateStep = () => {
    const nextErrors: Record<string, string[]> = {};
    for (const field of stepFields[step]) {
      const value = values[field];
      if (value === "" || value === false) nextErrors[field] = ["This field is required"];
    }
    if (step === 0 && !cnicPattern.test(values.cnic)) nextErrors.cnic = ["Enter a valid CNIC in 12345-1234567-1 format"];
    if (step === 0 && values.email && !emailPattern.test(values.email)) nextErrors.email = ["Enter a valid email address"];
    if (step === 0 && values.whatsapp && !pakistaniNationalMobilePattern.test(values.whatsapp)) nextErrors.whatsapp = [pakistaniMobileMessage];
    if (step === 0 && values.alternatePhone && !pakistaniNationalMobilePattern.test(values.alternatePhone)) nextErrors.alternatePhone = [pakistaniMobileMessage];
    const age = Number(values.age);
    if (step === 0 && values.age && (!Number.isInteger(age) || age < 15 || age > 23)) nextErrors.age = ["Applicants must be between 15 and 23"];
    if (step === 0 && !photo) nextErrors.photo = ["Applicant photo is required"];
    if (step === 1 && values.motivation.trim().length < 30) nextErrors.motivation = ["Please write at least 30 characters"];
    if (step === 2 && values.transactionReference.trim().length < 4) nextErrors.transactionReference = ["Enter the transaction ID from your payment"];
    if (step === 2 && !receipt) nextErrors.receipt = ["Payment receipt is required"];
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const scrollToForm = () => {
    window.requestAnimationFrame(() => document.querySelector(".form-main")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  // Waits two frames so freshly-set error state has rendered, then centers the
  // topmost errored field so failures are never off screen.
  const scrollToFirstError = () => {
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
      const target = document.querySelector<HTMLElement>('.application-form [aria-invalid="true"], .application-form .photo-picker--error, .application-form .form-error');
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const alreadyVisible = rect.top >= 90 && rect.bottom <= window.innerHeight - 16;
      if (!alreadyVisible) target.scrollIntoView({ behavior: "smooth", block: "center" });
      const focusable = (target.matches("input, select, textarea, button")
        ? target
        : target.querySelector<HTMLElement>("input, select, textarea, button"))
        ?? target.previousElementSibling?.querySelector<HTMLElement>("input");
      focusable?.focus({ preventScroll: true });
    }));
  };

  // A double-fired click on Continue would land its second click on the button
  // that replaced it (the next step's Continue, or Submit) and act on the new
  // step instantly. Ignore advance/submit actions briefly after a step change.
  const stepChangedAt = useRef(0);
  const stepJustChanged = () => Date.now() - stepChangedAt.current < 350;
  const markStepChange = () => { stepChangedAt.current = Date.now(); };

  const next = () => {
    if (stepJustChanged()) return;
    if (validateStep()) { markStepChange(); setMessage(""); setStep((current) => Math.min(lastStep, current + 1)); scrollToForm(); }
    else scrollToFirstError();
  };
  const goTo = (index: number) => { if (index < step) { markStepChange(); setMessage(""); setStep(index); scrollToForm(); } };

  const returnToFirstInvalidStep = (issues: Record<string, string[]>) => {
    const invalidStep = issues.photo?.length
      ? 0
      : issues.receipt?.length
        ? 2
        : stepFields.findIndex((fields) => fields.some((field) => issues[field]?.length));
    if (invalidStep < 0) return;
    markStepChange();
    setStep(invalidStep);
    scrollToFirstError();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    // A submit event on an intermediate step (e.g. Enter in a single-input
    // step) must do nothing; only the explicit Continue button advances.
    if (step !== lastStep) return;
    if (stepJustChanged()) return;
    if (!validateStep()) { scrollToFirstError(); return; }
    setStatus("submitting");
    setMessage("");
    const token = document.querySelector<HTMLInputElement>('input[name="cf-turnstile-response"]')?.value;
    try {
      const submission = new FormData();
      submission.set("payload", JSON.stringify({
        ...values,
        whatsapp: `+92${values.whatsapp}`,
        alternatePhone: values.alternatePhone ? `+92${values.alternatePhone}` : "",
        age: Number(values.age),
        turnstileToken: token,
      }));
      if (photo) submission.set("photo", photo);
      if (receipt) submission.set("receipt", receipt);
      const response = await fetch("/api/applications/pys-bootcamp", {
        method: "POST",
        body: submission,
      });
      const result = await response.json() as { message: string; referenceCode?: string; issues?: Record<string, string[]> };
      if (!response.ok) {
        const issues = result.issues || {};
        setErrors(issues);
        returnToFirstInvalidStep(issues);
        setMessage(result.message);
        setStatus("idle");
        return;
      }
      setReference(result.referenceCode || "Received");
      setStatus("success");
    } catch {
      setMessage("A network error interrupted the submission. Please try again.");
      setStatus("idle");
    }
  };

  if (status === "success") {
    return <FormSuccess
      title={<>You’re in<br /><em>the room.</em></>}
      note="Seats are first-come-first-served, and yours is now in the queue."
      reference={reference}
      steps={[
        "Your payment is verified within 24 hours",
        "Your seat is confirmed by email and WhatsApp",
        `Camp details arrive before ${bootcampFacts.datesShort}`,
      ]}
    />;
  }

  return (
    <form className="application-form" method="post" onSubmit={submit} noValidate>
      {siteKey && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />}
      <input className="honeypot" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={(event) => update("website", event.target.value)} aria-hidden="true" />
      <FormRail steps={stepNames} current={step} onStepSelect={goTo} />

      <div className="form-step" key={step}>
        <StepNumeral step={step} />
        {step === 0 && <fieldset><legend>Let’s start with you.</legend><p className="form-legend-copy">Use contact details you check regularly. We will use them for application updates.</p><div className="field-grid">
          <Field label="Full name" name="fullName" value={values.fullName} error={errors.fullName} onChange={update} autoComplete="name" />
          <Field label="CNIC / B-Form number" name="cnic" value={values.cnic} error={errors.cnic} onChange={update} transform={formatCnic} inputMode="numeric" maxLength={15} placeholder="12345-1234567-1" autoComplete="off" />
          <Field label="Email address" name="email" type="email" value={values.email} error={errors.email} onChange={update} autoComplete="email" />
          <PhoneField label="WhatsApp number" name="whatsapp" value={values.whatsapp} error={errors.whatsapp} onChange={update} autoComplete="tel-national" />
          <Field label="Age" name="age" type="number" value={values.age} error={errors.age} onChange={update} min="15" max="23" />
          <Field label="City" name="city" value={values.city} error={errors.city} onChange={update} autoComplete="address-level2" />
          <PhoneField label="Alternate phone (optional)" name="alternatePhone" value={values.alternatePhone} error={errors.alternatePhone} onChange={update} wide />
          <ApplicationPhotoField file={photo} error={errors.photo} onChange={(file) => { setPhoto(file); if (file) setPhotoError(); }} onError={setPhotoError} wide />
        </div></fieldset>}

        {step === 1 && <fieldset><legend>Your starting point.</legend><p className="form-legend-copy">Previous experience is not required. Honest answers help us shape a useful camp.</p><div className="field-grid">
          <Field label="Institution" name="institution" value={values.institution} error={errors.institution} onChange={update} />
          <SelectField label="Education level" name="educationLevel" value={values.educationLevel} error={errors.educationLevel} onChange={update} options={[["school","School"],["college","College"],["university","University"],["other","Other"]]} />
          <SelectField label="Previous MUN experience" name="experience" value={values.experience} error={errors.experience} onChange={update} options={[["none","No previous MUNs"],["one-two","1–2 conferences"],["three-plus","3 or more conferences"]]} />
          <Field label="How did you hear about PYSMUN? (optional)" name="referral" value={values.referral} error={errors.referral} onChange={update} />
          <TextareaField label="What do you hope to learn?" name="motivation" value={values.motivation} error={errors.motivation} onChange={update} maxLength={700} minLength={30} />
          <TextareaField label="Accessibility or dietary requirements (optional)" name="requirements" value={values.requirements} onChange={update} maxLength={500} hint="Shared only with organizers who need this information." />
        </div></fieldset>}

        {step === 2 && <fieldset><legend>Reserve your seat.</legend><p className="form-legend-copy">Seats are first-come-first-served. Send the fee, then attach your receipt. Payments are verified within 24 hours.</p>
          <div className="payment-slip">
            <div className="payment-slip__fee"><span>Bootcamp fee</span><strong>{bootcampFacts.fee}</strong></div>
            <div className="payment-slip__rows">
              <div><span>Bank</span><strong>{paymentAccount.bank}</strong></div>
              <div><span>Account title</span><strong>{paymentAccount.title}</strong></div>
              <CopyableDetail label="Account number" value={paymentAccount.number} />
              <CopyableDetail label="IBAN" value={paymentAccount.iban} />
            </div>
            <p className="payment-slip__note">{paymentAccount.pending ? "Final account details will be published here before applications open." : "Send exactly the fee amount, keep your receipt, and enter the transaction ID below."}</p>
          </div>
          <div className="field-grid">
            <Field label="Transaction / TRX ID" name="transactionReference" value={values.transactionReference} error={errors.transactionReference} onChange={update} autoComplete="off" placeholder="e.g. 9284716352" wide />
            <ApplicationPhotoField file={receipt} error={errors.receipt} onChange={(file) => { setReceipt(file); if (file) setReceiptError(); }} onError={setReceiptError} label="Payment receipt" prompt="Attach your payment screenshot" note="Checked against your transaction ID during verification." requiredMessage="Payment receipt is required" wide />
          </div></fieldset>}

        {step === 3 && <fieldset><legend>Review and submit.</legend><p className="form-legend-copy">Check your information before sending it to the PYSMUN team.</p>
          <ReviewLedger photo={photo} receipt={receipt} rows={[["Program", `PYS Bootcamp · ${bootcampFacts.datesShort}`], ["Name", values.fullName], ["CNIC", values.cnic], ["Email", values.email], ["WhatsApp", `+92 ${formatPakistaniNationalNumber(values.whatsapp)}`], ["Age / city", `${values.age} · ${values.city}`], ["Institution", values.institution], ["Experience", experienceLabels[values.experience] || values.experience], ["Fee paid", bootcampFacts.fee], ["Transaction ID", values.transactionReference]]} />
          <label className="consent"><input type="checkbox" checked={values.consent} onChange={(event) => update("consent", event.target.checked)} /><span>I confirm this information is accurate and consent to PYSMUN securely using my details, CNIC, photo and payment information to process my application and contact me about the PYS Bootcamp. I understand the fee is non-refundable.</span></label>{errors.consent && <p className="form-error">{errors.consent[0]}</p>}{siteKey && <div className="cf-turnstile" data-sitekey={siteKey} data-theme="light" />}</fieldset>}
      </div>

      {message && <p className="form-message form-message--mobile" role="alert">{message}</p>}
      <div className="form-actions">
        {step > 0 && <button type="button" className="form-back" onClick={() => goTo(step - 1)}><ArrowLeft size={15} /> Back</button>}
        {step < lastStep
          ? <button type="button" className="form-advance" onClick={next}><span data-error={message ? true : undefined} role={message ? "alert" : undefined}>{message || <>Next · {stepNames[step + 1]}</>}</span><strong>Continue</strong><ArrowRight size={20} /></button>
          : <button type="submit" className="form-advance" disabled={status === "submitting"}><span data-error={message ? true : undefined} role={message ? "alert" : undefined}>{message || "Final step"}</span><strong>{status === "submitting" ? "Sending" : "Submit application"}</strong>{status === "submitting" ? <LoaderCircle className="spin" size={20} /> : <ArrowRight size={20} />}</button>}
      </div>
    </form>
  );
}
