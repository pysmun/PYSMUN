"use client";

import type { Session } from "@supabase/supabase-js";
import { ArrowRight, ArrowUpRight, Check, Copy, Download, LoaderCircle, LogOut, RefreshCw, TriangleAlert, X } from "lucide-react";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { getSupabaseBrowserClient, supabaseDashboardUrl } from "@/lib/supabase-browser";
import { timeAgo } from "@/lib/time";

type ApplicationRow = {
  id: string;
  reference_code: string;
  program_slug: "training-camp" | "campus-ambassador";
  applicant_email: string;
  applicant_phone: string;
  applicant_cnic: string;
  photo_path: string;
  review_status: string;
  payment_status: string;
  payment_reference: string | null;
  receipt_path: string | null;
  payload: Record<string, unknown>;
  submitted_at: string;
};

const programNames: Record<ApplicationRow["program_slug"], string> = {
  "training-camp": "PYS Bootcamp",
  "campus-ambassador": "Campus Ambassador",
};

const reviewStatuses = ["received", "under_review", "accepted", "waitlisted", "rejected"] as const;
const paymentStatuses = ["proof_submitted", "confirmed", "invalid"] as const;

const statusLabels: Record<string, string> = {
  received: "Received",
  under_review: "Under review",
  accepted: "Accepted",
  waitlisted: "Waitlisted",
  rejected: "Rejected",
  pending: "No receipt",
  proof_submitted: "Awaiting verification",
  confirmed: "Payment confirmed",
  invalid: "Payment issue",
};

function fieldLabel(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}


const csvSkippedPayloadKeys = ["email", "whatsapp", "cnic", "consent", "website", "turnstileToken", "transactionReference"];

const detailSkippedKeys = ["fullName", "email", "whatsapp", "cnic", "consent", "website", "turnstileToken", "transactionReference"];
const longTextKeys = ["motivation", "outreachPlan", "requirements"];

const payloadValueLabels: Record<string, string> = {
  none: "None",
  "one-two": "1–2 conferences",
  "three-plus": "3 or more conferences",
  some: "Some experience",
  extensive: "Extensive experience",
  school: "School",
  college: "College",
  university: "University",
  other: "Other",
  student: "Student",
  "society-member": "Society or council member",
  "society-lead": "Society or council lead",
};

function LongText({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const needsToggle = text.length > 220;
  return (
    <div className="admin-longtext__body" data-open={open || undefined}>
      <p>{text}</p>
      {needsToggle && (
        <button type="button" className="admin-longtext__toggle" onClick={() => setOpen((value) => !value)}>
          {open ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

type ExportContext = { programFilter: string; statusFilter: string; paymentFilter: string; search: string };

function exportFileName(count: number, context: ExportContext) {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
  const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const parts = ["pysmun-applications"];
  if (context.programFilter !== "all") parts.push(context.programFilter === "training-camp" ? "bootcamp" : "campus");
  if (context.statusFilter !== "all") parts.push(slug(statusLabels[context.statusFilter] ?? context.statusFilter));
  if (context.paymentFilter !== "all") parts.push(context.paymentFilter === "free" ? "free" : slug(statusLabels[context.paymentFilter] ?? context.paymentFilter));
  const searchSlug = slug(context.search).slice(0, 24);
  if (searchSlug) parts.push(`search-${searchSlug}`);
  parts.push(stamp, `${count}-rows`);
  return `${parts.join("_")}.csv`;
}

function exportRowsAsCsv(rows: ApplicationRow[], context: ExportContext) {
  const payloadKeys = Array.from(new Set(rows.flatMap((row) => Object.keys(row.payload)))).filter((key) => !csvSkippedPayloadKeys.includes(key)).sort();
  const headers = ["reference", "program", "submitted_at", "review_status", "payment_status", "transaction_reference", "email", "phone", "cnic", ...payloadKeys];

  // Quote everything and neutralize leading formula characters so a cell can
  // never execute when the file is opened in Excel/Sheets.
  const cell = (value: unknown) => {
    let text = value == null ? "" : String(value);
    if (/^[=+\-@\t]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  };

  const lines = [
    headers.join(","),
    ...rows.map((row) => [
      row.reference_code,
      programNames[row.program_slug],
      row.submitted_at,
      row.review_status,
      row.program_slug === "training-camp" ? row.payment_status : "free",
      row.payment_reference ?? "",
      row.applicant_email,
      row.applicant_phone,
      row.applicant_cnic,
      ...payloadKeys.map((key) => row.payload[key]),
    ].map(cell).join(",")),
  ];

  const blob = new Blob([`﻿${lines.join("\r\n")}`], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = exportFileName(rows.length, context);
  link.click();
  URL.revokeObjectURL(link.href);
}

export function AdminConsole() {
  const supabase = getSupabaseBrowserClient();
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [programFilter, setProgramFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"oldest" | "newest">("oldest");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ url: string; title: string; trx?: string | null } | null>(null);
  const [staged, setStaged] = useState<Partial<Pick<ApplicationRow, "review_status" | "payment_status">>>({});
  const [fileUrls, setFileUrls] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!lightbox) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setLightbox(null); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [lightbox]);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      // Only redo the visible access check when the signed-in user actually
      // changes; token refreshes (e.g. on tab focus) re-verify silently.
      const nextId = nextSession?.user.id ?? null;
      if (nextId !== userIdRef.current) {
        userIdRef.current = nextId;
        setIsAdmin(null);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  const loadApplications = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setNotice("");
    const { data, error } = await supabase
      .from("applications")
      .select("id,reference_code,program_slug,applicant_email,applicant_phone,applicant_cnic,photo_path,review_status,payment_status,payment_reference,receipt_path,payload,submitted_at")
      .order("submitted_at", { ascending: false });
    if (error) setNotice(`Could not load applications: ${error.message}`);
    else setRows((data ?? []) as ApplicationRow[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (!supabase || !session) return;
    let cancelled = false;
    supabase.rpc("is_admin").then(({ data, error }) => {
      if (cancelled) return;
      const admitted = !error && data === true;
      setIsAdmin(admitted);
      if (admitted) void loadApplications();
    });
    return () => { cancelled = true; };
  }, [supabase, session, loadApplications]);

  async function openFile(row: ApplicationRow, path: string) {
    if (!supabase) return;
    if (fileUrls[path]) return;
    const { data, error } = await supabase.storage.from("application-photos").createSignedUrl(path, 600);
    if (error || !data?.signedUrl) setNotice("Could not open the file. Check storage policies.");
    else setFileUrls((current) => ({ ...current, [path]: data.signedUrl }));
  }

  function stageChange(row: ApplicationRow, field: "review_status" | "payment_status", value: string) {
    setStaged((current) => {
      const next = { ...current };
      if (row[field] === value) delete next[field];
      else next[field] = value;
      return next;
    });
  }

  async function saveStaged(row: ApplicationRow) {
    if (!supabase) return;
    setUpdatingId(row.id);
    setNotice("");
    const changes: Record<string, string> = { ...staged } as Record<string, string>;
    if (staged.payment_status) changes.payment_updated_at = new Date().toISOString();
    const { error } = await supabase.from("applications").update(changes).eq("id", row.id);
    if (error) setNotice(`Update failed: ${error.message}`);
    else {
      setRows((current) => current.map((item) => (item.id === row.id ? { ...item, ...staged } : item)));
      setStaged({});
    }
    setUpdatingId(null);
  }

  if (!supabase) {
    return <section className="admin-shell"><div className="admin-panel"><h1>Admin</h1><p>Supabase is not configured. Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.</p></div></section>;
  }

  if (!session) return <AdminLogin onError={setNotice} notice={notice} />;

  if (isAdmin === null) {
    return <section className="admin-shell"><div className="admin-panel admin-panel--center"><LoaderCircle className="spin" aria-hidden="true" /><p>Checking access…</p></div></section>;
  }

  if (!isAdmin) {
    return (
      <section className="admin-shell">
        <div className="admin-panel">
          <h1>Not authorized</h1>
          <p>This account is signed in but is not on the organizer list.</p>
          <button className="admin-ghost-btn" onClick={() => supabase.auth.signOut()}><LogOut aria-hidden="true" /> Sign out</button>
        </div>
      </section>
    );
  }

  const dashboardUrl = supabaseDashboardUrl();
  const query = search.trim().toLowerCase();

  const referenceUses = new Map<string, ApplicationRow[]>();
  for (const row of rows) {
    const trx = row.payment_reference?.trim().toLowerCase();
    if (!trx) continue;
    referenceUses.set(trx, [...(referenceUses.get(trx) ?? []), row]);
  }
  const duplicatesOf = (row: ApplicationRow) => {
    const trx = row.payment_reference?.trim().toLowerCase();
    if (!trx) return [];
    return (referenceUses.get(trx) ?? []).filter((other) => other.id !== row.id);
  };

  const stats = {
    total: rows.length,
    awaiting: rows.filter((row) => row.program_slug === "training-camp" && row.payment_status === "proof_submitted").length,
    confirmed: rows.filter((row) => row.program_slug === "training-camp" && row.payment_status === "confirmed").length,
    invalid: rows.filter((row) => row.program_slug === "training-camp" && row.payment_status === "invalid").length,
    campus: rows.filter((row) => row.program_slug === "campus-ambassador").length,
  };

  const showPayment = (payment: string) => { setProgramFilter("all"); setStatusFilter("all"); setPaymentFilter(payment); };

  const copyValue = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(key);
      window.setTimeout(() => setCopiedId((current) => (current === key ? null : current)), 1600);
    } catch {
      setNotice("Could not copy — select the text manually.");
    }
  };

  const copyButton = (key: string, text: string, label: string) => (
    <button type="button" className="admin-copy" onClick={() => copyValue(key, text)} aria-label={label}>
      {copiedId === key ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
    </button>
  );
  const filtered = rows.filter((row) => {
    if (programFilter !== "all" && row.program_slug !== programFilter) return false;
    if (statusFilter !== "all" && row.review_status !== statusFilter) return false;
    if (paymentFilter === "free" && row.program_slug !== "campus-ambassador") return false;
    if (paymentFilter !== "all" && paymentFilter !== "free" && (row.program_slug !== "training-camp" || row.payment_status !== paymentFilter)) return false;
    if (!query) return true;
    const queryDigits = query.replace(/\D/g, "");
    const haystack = [
      String(row.payload.fullName ?? ""),
      row.applicant_email,
      row.reference_code,
      row.applicant_cnic,
      String(row.payload.city ?? ""),
      String(row.payload.institution ?? ""),
    ].join(" ").toLowerCase();
    if (haystack.includes(query)) return true;
    return queryDigits.length >= 4 && `${row.applicant_phone}${row.applicant_cnic}`.replace(/\D/g, "").includes(queryDigits);
  });
  const visible = [...filtered].sort((a, b) => (sortOrder === "oldest" ? a.submitted_at.localeCompare(b.submitted_at) : b.submitted_at.localeCompare(a.submitted_at)));

  return (
    <section className="admin-shell admin-shell--wide">
      <header className="admin-header">
        <div>
          <p className="eyebrow">PYSMUN Admin</p>
          <h1>Applications</h1>
        </div>
        <div className="admin-header__actions">
          <span>{session.user.email}</span>
          <button className="admin-ghost-btn" onClick={() => loadApplications()} disabled={loading}>{loading ? <LoaderCircle className="spin" aria-hidden="true" /> : <RefreshCw aria-hidden="true" />} Refresh</button>
          <button className="admin-ghost-btn" onClick={() => supabase.auth.signOut()}><LogOut aria-hidden="true" /> Sign out</button>
        </div>
      </header>

      <div className="admin-stats">
        <button data-active={(programFilter === "all" && statusFilter === "all" && paymentFilter === "all") || undefined} onClick={() => { setProgramFilter("all"); setStatusFilter("all"); setPaymentFilter("all"); }}>
          <strong>{stats.total}</strong><span>Total</span>
        </button>
        <button data-active={paymentFilter === "proof_submitted" || undefined} onClick={() => showPayment("proof_submitted")}>
          <strong data-tone="gold">{stats.awaiting}</strong><span>Awaiting</span>
        </button>
        <button data-active={paymentFilter === "confirmed" || undefined} onClick={() => showPayment("confirmed")}>
          <strong data-tone="green">{stats.confirmed}</strong><span>Confirmed</span>
        </button>
        <button data-active={paymentFilter === "invalid" || undefined} onClick={() => showPayment("invalid")}>
          <strong data-tone="red">{stats.invalid}</strong><span>Issues</span>
        </button>
        <button data-active={paymentFilter === "free" || undefined} onClick={() => showPayment("free")}>
          <strong>{stats.campus}</strong><span>Campus</span>
        </button>
      </div>

      <div className="admin-toolbar">
        <input
          className="admin-search"
          placeholder="Search name, email, phone, city, institution, CNIC or Application ID"
          title="Searches names, emails, phone numbers, cities, institutions, CNICs and Application IDs"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select value={programFilter} onChange={(event) => setProgramFilter(event.target.value)}>
          <option value="all">All programs</option>
          <option value="training-camp">PYS Bootcamp</option>
          <option value="campus-ambassador">Campus Ambassador</option>
        </select>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="all">All statuses</option>
          {reviewStatuses.map((status) => <option value={status} key={status}>{statusLabels[status]}</option>)}
        </select>
        <select value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)}>
          <option value="all">All payments</option>
          {paymentStatuses.map((status) => <option value={status} key={status}>{statusLabels[status]}</option>)}
          <option value="free">Free (Campus)</option>
        </select>
        <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as "oldest" | "newest")}>
          <option value="oldest">Oldest first</option>
          <option value="newest">Newest first</option>
        </select>
        <button className="admin-ghost-btn" onClick={() => exportRowsAsCsv(visible, { programFilter, statusFilter, paymentFilter, search: query })} disabled={visible.length === 0}><Download aria-hidden="true" /> Export CSV</button>
        <span className="admin-count">{visible.length} of {rows.length}</span>
      </div>

      {notice && <p className="admin-notice" role="alert">{notice}</p>}

      <div className="admin-list">
        {visible.map((row) => {
          const expanded = expandedId === row.id;
          return (
            <article className="admin-row" data-expanded={expanded || undefined} key={row.id}>
              <button
                className="admin-row__summary"
                onClick={() => {
                  setExpandedId(expanded ? null : row.id);
                  setStaged({});
                  if (!expanded) {
                    void openFile(row, row.photo_path);
                    if (row.receipt_path) void openFile(row, row.receipt_path);
                  }
                }}
                aria-expanded={expanded}
              >
                <strong>{String(row.payload.fullName ?? "—")}</strong>
                <span>{row.reference_code}</span>
                <span>{programNames[row.program_slug]}</span>
                <span className="admin-row__chips">
                  <span className="admin-chip" data-status={row.review_status}>{statusLabels[row.review_status] ?? row.review_status}</span>
                  {row.program_slug === "training-camp"
                    ? <span className="admin-chip" data-payment={row.payment_status}>{statusLabels[row.payment_status] ?? row.payment_status}</span>
                    : <span className="admin-chip" data-payment="free">Free</span>}
                </span>
              </button>

              {expanded && (
                <div className="admin-row__detail" data-free={row.program_slug !== "training-camp" || undefined}>
                  <figure className="admin-detail__portrait">
                    {fileUrls[row.photo_path]
                      ? <button type="button" className="admin-media-open" onClick={() => setLightbox({ url: fileUrls[row.photo_path], title: `Applicant photo · ${row.reference_code}` })} aria-label="View photo full size">
                          {/* eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL */}
                          <img src={fileUrls[row.photo_path]} alt={`Applicant photo for ${row.reference_code}`} />
                        </button>
                      : <span className="admin-media-loading"><LoaderCircle className="spin" aria-hidden="true" /></span>}
                  </figure>

                  <div className="admin-detail__profile">
                    <dl className="admin-fields">
                      <div><dt>Application ID</dt><dd className="admin-fields__reference">{row.reference_code}
                        {copyButton(`${row.id}-ref`, row.reference_code, `Copy ${row.reference_code}`)}
                      </dd></div>
                      <div><dt>Submitted</dt><dd>{new Date(row.submitted_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}<em className="admin-ago">{timeAgo(row.submitted_at)}</em></dd></div>
                      <div><dt>Email</dt><dd className="admin-fields__contact">
                        <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(row.applicant_email)}`} target="_blank" rel="noreferrer">{row.applicant_email}</a>
                        {copyButton(`${row.id}-email`, row.applicant_email, "Copy email address")}
                      </dd></div>
                      <div><dt>Phone</dt><dd className="admin-fields__contact">
                        <a href={`https://wa.me/${row.applicant_phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">{row.applicant_phone}</a>
                        {copyButton(`${row.id}-phone`, row.applicant_phone, "Copy phone number")}
                      </dd></div>
                      <div><dt>CNIC</dt><dd>{row.applicant_cnic}</dd></div>
                      {Object.entries(row.payload)
                        .filter(([key, value]) => !detailSkippedKeys.includes(key) && !longTextKeys.includes(key) && value !== "" && value !== null)
                        .map(([key, value]) => (
                          <div key={key}><dt>{fieldLabel(key)}</dt><dd>{payloadValueLabels[String(value)] ?? String(value)}</dd></div>
                        ))}
                    </dl>
                    {longTextKeys.some((key) => row.payload[key]) && (
                      <div className="admin-longtext">
                        {longTextKeys
                          .filter((key) => typeof row.payload[key] === "string" && row.payload[key] !== "")
                          .map((key) => (
                            <div key={key}>
                              <p className="admin-longtext__label">{fieldLabel(key)}</p>
                              <LongText text={String(row.payload[key])} />
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {row.program_slug === "training-camp" && (
                    <aside className="admin-detail__payment">
                      <p className="admin-detail__payment-title">Payment verification</p>
                      <figure>
                        {row.receipt_path
                          ? fileUrls[row.receipt_path]
                            ? <button type="button" className="admin-media-open" onClick={() => setLightbox({ url: fileUrls[row.receipt_path!], title: `Payment receipt · ${row.reference_code}`, trx: row.payment_reference })} aria-label="View receipt full size">
                                {/* eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL */}
                                <img src={fileUrls[row.receipt_path]} alt={`Payment receipt for ${row.reference_code}`} />
                              </button>
                            : <span className="admin-media-loading"><LoaderCircle className="spin" aria-hidden="true" /></span>
                          : <span className="admin-media-empty">No receipt submitted</span>}
                      </figure>
                      {row.payment_reference && (
                        <div className="admin-transaction">
                          <span>Transaction reference</span>
                          <div className="admin-transaction__value">
                            <strong>{row.payment_reference}</strong>
                            {copyButton(`${row.id}-trx`, row.payment_reference, "Copy transaction reference")}
                          </div>
                        </div>
                      )}
                      {duplicatesOf(row).length > 0 && (
                        <p className="admin-duplicate" role="alert">
                          <TriangleAlert aria-hidden="true" />
                          Same transaction ID as {duplicatesOf(row).map((other) => other.reference_code).join(", ")}
                        </p>
                      )}
                    </aside>
                  )}

                  <div className="admin-actions">
                    <div>
                      <p>Application</p>
                      <div className="admin-actions__row">
                        {reviewStatuses.map((status) => {
                          const active = (staged.review_status ?? row.review_status) === status;
                          return <button key={status} disabled={active || updatingId === row.id} onClick={() => stageChange(row, "review_status", status)}>{statusLabels[status]}</button>;
                        })}
                      </div>
                    </div>
                    {row.program_slug === "training-camp" && (
                      <div>
                        <p>Payment</p>
                        <div className="admin-actions__row">
                          {paymentStatuses.map((status) => {
                            const active = (staged.payment_status ?? row.payment_status) === status;
                            return <button key={status} disabled={active || updatingId === row.id} onClick={() => stageChange(row, "payment_status", status)}>{statusLabels[status]}</button>;
                          })}
                        </div>
                      </div>
                    )}
                    <div className="admin-actions__end">
                      {dashboardUrl && (
                        <a className="admin-link" href={`${dashboardUrl}/editor`} target="_blank" rel="noreferrer">Open in Supabase <ArrowUpRight aria-hidden="true" /></a>
                      )}
                      {(() => {
                        const dirty = Object.keys(staged).length > 0;
                        return (
                          <button
                            type="button"
                            className="admin-commit"
                            data-dirty={dirty || undefined}
                            disabled={updatingId === row.id}
                            onClick={() => {
                              if (dirty) void saveStaged(row);
                              else { setExpandedId(null); setStaged({}); }
                            }}
                          >
                            {updatingId === row.id && <LoaderCircle className="spin" aria-hidden="true" />}
                            {dirty ? "Save" : "Cancel"}
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </article>
          );
        })}
        {!loading && visible.length === 0 && <p className="admin-empty">No applications match.</p>}
      </div>

      {lightbox && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={lightbox.title} onClick={() => setLightbox(null)}>
          <figure onClick={(event) => event.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL */}
            <img src={lightbox.url} alt={lightbox.title} />
            <figcaption>
              <span>{lightbox.title}</span>
              {lightbox.trx && (
                <span className="lightbox__trx">
                  <strong>{lightbox.trx}</strong>
                  {copyButton("lightbox-trx", lightbox.trx, "Copy transaction reference")}
                </span>
              )}
              <button type="button" className="lightbox__close" onClick={() => setLightbox(null)}><X aria-hidden="true" /> Close</button>
            </figcaption>
          </figure>
        </div>
      )}
    </section>
  );
}

function AdminLogin({ notice, onError }: { notice: string; onError: (message: string) => void }) {
  const supabase = getSupabaseBrowserClient();
  const [submitting, setSubmitting] = useState(false);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    onError("");
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    });
    if (error) onError("Sign in failed. Check your email and password.");
    setSubmitting(false);
  }

  return (
    <section className="admin-shell">
      <div className="admin-panel admin-panel--login">
        <h1>PYSMUN <em>Admin.</em></h1>
        <form className="admin-login" method="post" onSubmit={signIn}>
          <label className="field"><span>Email</span><input name="email" type="email" autoComplete="email" required /><small></small></label>
          <label className="field"><span>Password</span><input name="password" type="password" autoComplete="current-password" required /><small></small></label>
          <div className="form-actions">
            <button type="submit" className="form-advance" disabled={submitting}>
              <span>Organizers only</span>
              <strong>{submitting ? "Signing in" : "Sign in"}</strong>
              {submitting ? <LoaderCircle className="spin" size={20} /> : <ArrowRight size={20} />}
            </button>
          </div>
        </form>
        {notice && <p className="admin-notice" role="alert">{notice}</p>}
        <p className="admin-panel__note">Access is limited to listed PYSMUN organizers.</p>
      </div>
    </section>
  );
}
