import { z } from "zod";

export const MIN_FILL_MS = 3000;
export const MAX_BODY_BYTES = 8 * 1024;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 8;

/** Aceita (17) 99210-4000, 17992104000, +55 17 99210-4000 etc. DDD + 8 (fixo) ou 9 dígitos (celular). */
export function isBrPhone(value: string): boolean {
  let d = value.replace(/\D/g, "");
  if ((d.length === 12 || d.length === 13) && d.startsWith("55")) d = d.slice(2);
  if (d.length !== 10 && d.length !== 11) return false;
  const ddd = Number(d.slice(0, 2));
  if (ddd < 11 || ddd > 99) return false;
  return d.length === 10 ? /[2-5]/.test(d[2]) : d[2] === "9";
}

// Remove caracteres de controle (evita quebra de linha em assunto de e-mail etc.).
const clean = (max: number) =>
  z.string().transform((s) => s.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "").trim()).pipe(z.string().max(max));

export const leadSchema = z.object({
  slug: z.string().trim().min(1).max(80),
  nome: clean(120).pipe(z.string().min(1, "Informe seu nome")),
  telefone: clean(30)
    .pipe(z.string().min(1, "Informe seu telefone ou WhatsApp"))
    .refine(isBrPhone, "Informe um telefone válido com DDD"),
  email: clean(160).pipe(z.union([z.literal(""), z.email("Informe um e-mail válido")])).optional(),
  mensagem: clean(1000).optional(),
  consentimento: z.literal(true, "É preciso autorizar o contato"),
  // Anti-abuso: campo invisível e tempo de preenchimento informado pelo cliente.
  website: z.string().max(200).optional(),
  elapsedMs: z.number().int().nonnegative(),
});

export type LeadInput = z.infer<typeof leadSchema>;

export type CheckResult =
  | { ok: true; lead: LeadInput }
  | { ok: false; status: number; error: string; fields?: Record<string, string> }
  | { ok: false; status: 200; bot: true };

/** Valida o corpo já parseado. Não faz I/O, para ser testável. */
export function checkLead(body: unknown): CheckResult {
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fields[key] ??= issue.message;
    }
    return { ok: false, status: 400, error: "Revise os campos destacados.", fields };
  }
  // Honeypot preenchido: finge sucesso para não ensinar o robô.
  if (parsed.data.website) return { ok: false, status: 200, bot: true };
  if (parsed.data.elapsedMs < MIN_FILL_MS)
    return { ok: false, status: 400, error: "Envio muito rápido. Aguarde alguns segundos e tente novamente." };
  return { ok: true, lead: parsed.data };
}

export function isSameOrigin(origin: string | null, host: string | null): boolean {
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

// ponytail: limite em memória, por instância. Em serverless cada instância tem o seu mapa
// e ele zera a cada cold start. Se houver abuso real, trocar por Upstash/Vercel KV.
const hits = new Map<string, number[]>();

export function rateLimited(ip: string, now = Date.now()): boolean {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // teto de memória
  return recent.length > RATE_MAX;
}
