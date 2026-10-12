import { NextResponse, type NextRequest } from "next/server";
import { getProperty } from "@/data/properties";
import { checkLead, isSameOrigin, MAX_BODY_BYTES, rateLimited } from "@/lib/leads";

const fail = (status: number, error: string, fields?: Record<string, string>) =>
  NextResponse.json({ ok: false, error, fields }, { status });

export async function POST(req: NextRequest) {
  const type = req.headers.get("content-type")?.split(";")[0].trim();
  if (type !== "application/json") return fail(415, "Formato inválido.");

  if (!isSameOrigin(req.headers.get("origin"), req.headers.get("host")))
    return fail(403, "Origem não permitida.");

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
  if (rateLimited(ip)) return fail(429, "Muitas tentativas. Tente novamente em alguns minutos.");

  if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) return fail(413, "Mensagem muito grande.");
  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return fail(413, "Mensagem muito grande.");

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return fail(400, "Formato inválido.");
  }

  const result = checkLead(body);
  if ("bot" in result) return NextResponse.json({ ok: true });
  if (!result.ok) return fail(result.status, result.error, result.fields);
  const lead = result.lead;

  const found = getProperty(lead.slug);
  if (found?.state !== "publicado") return fail(404, "Empreendimento não encontrado.");

  const key = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_TO_EMAIL;
  if (!key || !to)
    return fail(503, "O envio de mensagens está temporariamente indisponível. Seus dados continuam no formulário.");

  const text = [
    `Empreendimento: ${found.property.nome}`,
    `Nome: ${lead.nome}`,
    `Telefone: ${lead.telefone}`,
    `E-mail: ${lead.email || "não informado"}`,
    `Mensagem: ${lead.mensagem || "(sem mensagem)"}`,
    `Consentimento de contato: sim`,
    `Origem: página pública /p/${lead.slug}`,
    `Recebido em: ${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}`,
  ].join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.LEAD_FROM_EMAIL || "Leads <onboarding@resend.dev>",
        to: [to],
        reply_to: lead.email || undefined,
        subject: `Novo interesse: ${found.property.nome} — ${lead.nome}`,
        text,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`Resend ${res.status}`);
  } catch (err) {
    console.error("lead delivery failed", err instanceof Error ? err.message : err);
    return fail(502, "Não conseguimos enviar agora. Seus dados continuam no formulário; tente novamente.");
  }

  return NextResponse.json({ ok: true });
}
