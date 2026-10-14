import { NextResponse } from "next/server";
import { z } from "zod";
import nodemailer from "nodemailer";
import { site } from "@/lib/site";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  budget: z.string().trim().max(80).optional().or(z.literal("")),
  message: z.string().trim().min(15).max(5000),
  // Honeypot — fylls bara i av bottar.
  website: z.string().max(0).optional().or(z.literal("")),
  locale: z.enum(["sv", "en"]).optional(),
});

/**
 * Autosvaret går till en adress som vem som helst kan skriva in, så det får
 * inte kunna bära främmande innehåll (annars blir formuläret en spamkanon mot
 * tredje part). Därför ekar vi varken meddelandet eller företaget — bara ett
 * förnamn, och bara om det är ett rent ord utan länkar eller tecken.
 */
function safeFirstName(name: string) {
  const first = name.split(/\s+/)[0] ?? "";
  return /^[\p{L}'-]{1,30}$/u.test(first) ? first : null;
}

const autoReply = {
  sv: {
    subject: "Tack för ditt meddelande — Oskar Östlind",
    greeting: (n: string | null) => (n ? `Hej ${n}!` : "Hej!"),
    lines: [
      "Tack för att du hörde av dig. Jag har fått ditt meddelande och återkommer inom 1–3 arbetsdagar.",
      "Vill du lägga till något — en länk, en skiss eller en deadline — svara bara på det här mejlet.",
    ],
    signoff: "Vänliga hälsningar",
  },
  en: {
    subject: "Thanks for your message — Oskar Östlind",
    greeting: (n: string | null) => (n ? `Hi ${n},` : "Hi,"),
    lines: [
      "Thanks for reaching out. I've received your message and will get back to you within 1–3 business days.",
      "Want to add something — a link, a sketch or a deadline? Just reply to this email.",
    ],
    signoff: "Best regards",
  },
} as const;

/**
 * Enkel rate limiting i minnet: 3 meddelanden per IP per 10 minuter.
 * Räcker för en portfölj och kräver ingen extern tjänst.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 3;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) return true;
  recent.push(now);
  hits.set(ip, recent);

  // Städa bort gamla nycklar så att kartan inte växer obegränsat.
  if (hits.size > 500) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }
  return false;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("cf-connecting-ip") ??
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json({ error: "rate_limit" }, { status: 429 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const { name, email, company, budget, message, website, locale = "sv" } = parsed.data;

  // Honeypot ifylld — låtsas att allt gick bra, men skicka ingenting.
  if (website) return NextResponse.json({ ok: true });

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_TO } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.error("SMTP saknar konfiguration — se .env.example");
    return NextResponse.json({ error: "server" }, { status: 500 });
  }

  const port = Number(SMTP_PORT ?? 465);

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const rows: [string, string][] = [
    ["Namn", name],
    ["E-post", email],
    ["Företag", company || "—"],
    ["Budget", budget || "—"],
  ];

  try {
    await transporter.sendMail({
      // Avsändaren måste vara den autentiserade adressen, annars nekar SMTP-servern.
      // DMARC på oskarostlind.se är p=reject: skicka aldrig "från" @oskarostlind.se via en annan server.
      from: `"${name} via ${site.domain}" <${SMTP_USER}>`,
      to: CONTACT_TO ?? site.email,
      replyTo: `"${name}" <${email}>`,
      subject: `Ny förfrågan från ${name}${company ? ` (${company})` : ""}`,
      text: [
        ...rows.map(([k, v]) => `${k}: ${v}`),
        "",
        "Meddelande:",
        message,
      ].join("\n"),
      html: `
        <div style="font-family:system-ui,sans-serif;line-height:1.6;color:#111">
          <h2 style="margin:0 0 16px">Ny förfrågan via ${site.domain}</h2>
          <table cellpadding="0" cellspacing="0" style="margin-bottom:20px">
            ${rows
              .map(
                ([k, v]) =>
                  `<tr><td style="padding:2px 16px 2px 0;color:#666">${k}</td><td>${escapeHtml(v)}</td></tr>`
              )
              .join("")}
          </table>
          <div style="white-space:pre-wrap;border-left:3px solid #00b8cc;padding-left:14px">${escapeHtml(
            message
          )}</div>
        </div>
      `,
    });

  } catch (error) {
    console.error("Kunde inte skicka kontaktmejl:", error);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }

  // Autosvar till avsändaren. Misslyckas det har förfrågan ändå kommit fram,
  // så besökaren får ett lyckat svar — felet loggas bara.
  const copy = autoReply[locale];
  const greeting = copy.greeting(safeFirstName(name));
  try {
    await transporter.sendMail({
      from: `"${site.name}" <${SMTP_USER}>`,
      to: email,
      replyTo: site.email,
      subject: copy.subject,
      headers: { "Auto-Submitted": "auto-replied", "X-Auto-Response-Suppress": "All" },
      text: [greeting, "", ...copy.lines.flatMap((l) => [l, ""]), copy.signoff, site.name, `https://${site.domain}`, site.email].join("\n"),
      html: `
        <div style="font-family:system-ui,-apple-system,sans-serif;line-height:1.65;color:#111;max-width:560px">
          <p style="margin:0 0 16px;font-size:16px">${greeting}</p>
          ${copy.lines.map((l) => `<p style="margin:0 0 16px">${l}</p>`).join("")}
          <p style="margin:24px 0 0">${copy.signoff}</p>
          <div style="margin-top:8px;padding-left:14px;border-left:3px solid #00b8cc">
            <div style="font-weight:600">${site.name}</div>
            <a href="https://${site.domain}" style="color:#007c8a;text-decoration:none">${site.domain}</a><br>
            <a href="mailto:${site.email}" style="color:#007c8a;text-decoration:none">${site.email}</a>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Kunde inte skicka autosvar:", error);
  }

  return NextResponse.json({ ok: true });
}

