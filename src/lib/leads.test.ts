import { describe, expect, it } from "vitest";
import { checkLead, isBrPhone, isSameOrigin, rateLimited } from "./leads";

const valid = {
  slug: "empreendimento-exemplo",
  nome: "  Ana Souza ",
  telefone: "(17) 99210-4000",
  email: "",
  mensagem: "Tenho interesse",
  consentimento: true,
  website: "",
  elapsedMs: 8000,
};

describe("checkLead", () => {
  it("aceita lead válido e apara espaços", () => {
    const r = checkLead(valid);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.lead.nome).toBe("Ana Souza");
  });

  it("exige nome, telefone e consentimento com as mensagens do escopo", () => {
    const r = checkLead({ ...valid, nome: " ", telefone: "", consentimento: false });
    expect(r.ok).toBe(false);
    if (!r.ok && "fields" in r) {
      expect(r.fields?.nome).toBe("Informe seu nome");
      expect(r.fields?.telefone).toBe("Informe seu telefone ou WhatsApp");
      expect(r.fields?.consentimento).toBeDefined();
    }
  });

  it("rejeita e-mail inválido, mensagem longa e campos ausentes", () => {
    expect(checkLead({ ...valid, email: "nao-e-email" }).ok).toBe(false);
    expect(checkLead({ ...valid, mensagem: "x".repeat(1001) }).ok).toBe(false);
    expect(checkLead({}).ok).toBe(false);
    expect(checkLead(null).ok).toBe(false);
  });

  it("descarta robôs (honeypot) e envios rápidos demais", () => {
    expect(checkLead({ ...valid, website: "http://spam" })).toMatchObject({ status: 200, bot: true });
    expect(checkLead({ ...valid, elapsedMs: 500 })).toMatchObject({ ok: false, status: 400 });
  });
});

describe("isBrPhone", () => {
  it.each(["(17) 99210-4000", "+55 17 99210-4000", "1732214000", "11987654321"])("aceita %s", (p) =>
    expect(isBrPhone(p)).toBe(true),
  );
  it.each(["123", "(17) 89210-4000", "(00) 99210-4000", "abc"])("rejeita %s", (p) => expect(isBrPhone(p)).toBe(false));
});

describe("isSameOrigin / rateLimited", () => {
  it("compara origin com host", () => {
    expect(isSameOrigin("https://site.com.br", "site.com.br")).toBe(true);
    expect(isSameOrigin("https://evil.com", "site.com.br")).toBe(false);
    expect(isSameOrigin(null, "site.com.br")).toBe(false);
  });

  it("bloqueia a partir do 9º envio na janela", () => {
    const t = 1_000_000;
    for (let i = 0; i < 8; i++) expect(rateLimited("1.2.3.4", t + i)).toBe(false);
    expect(rateLimited("1.2.3.4", t + 9)).toBe(true);
    expect(rateLimited("1.2.3.4", t + 11 * 60 * 1000)).toBe(false);
  });
});
