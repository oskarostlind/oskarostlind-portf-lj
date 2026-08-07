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
});

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

  const { name, email, company, budget, message, website } = parsed.data;

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
      // Avsändaren måste vara den autentiserade adressen, annars nekar Gmail.
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

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Kunde inte skicka kontaktmejl:", error);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
