"use client";

import { Check, Copy, MessageCircle, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

export function publicUrl(slug: string) {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, "");
  return `${base}/p/${slug}`;
}

/** Modal sobre <dialog> nativo: foco preso, Esc e camada superior de graça. */
export function Modal({
  open,
  onClose,
  title,
  children,
  size = "form",
  tone = "light",
  onKeyDown,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "form" | "wide";
  tone?: "light" | "dark";
  onKeyDown?: (e: React.KeyboardEvent) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const dark = tone === "dark";
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onKeyDown={onKeyDown}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label={title}
      className={`m-auto max-h-[calc(100dvh-24px)] w-[calc(100%-24px)] overflow-hidden rounded-xl p-0 shadow-2xl ${
        size === "wide" ? "max-w-[960px]" : "max-w-[560px]"
      } ${dark ? "bg-[#0d1426] text-white" : "bg-surface text-ink"}`}
    >
      {open && (
        <div className="max-h-[calc(100dvh-24px)] overflow-y-auto p-5 md:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <h2 className={`pt-1.5 font-display text-xl font-semibold md:text-2xl ${dark ? "text-white" : "text-navy"}`}>
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className={`icon-btn -mt-1 -mr-2 ${dark ? "text-white hover:bg-white/10" : ""}`}
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}

/** Abre um modal quando qualquer elemento com data-open="<nome>" é clicado (botões podem ser server components). */
function useOpener(name: string, onOpen?: () => void) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element).closest?.(`[data-open="${name}"]`)) {
        onOpen?.();
        setOpen(true);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [name, onOpen]);
  return [open, setOpen] as const;
}

function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback para contextos sem Clipboard API (http em rede local).
      const t = document.createElement("textarea");
      t.value = text;
      document.body.append(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };
  return { copied, copy };
}

export function CopyLinkButton({ slug, className = "btn-secondary" }: { slug: string; className?: string }) {
  const { copied, copy } = useCopy();
  return (
    <button type="button" className={className} onClick={() => copy(publicUrl(slug))} aria-live="polite">
      {copied ? <Check className="size-4 text-success" aria-hidden /> : <Copy className="size-4" aria-hidden />}
      {copied ? "Link copiado" : "Copiar link do cliente"}
    </button>
  );
}

export function ShareDialog({ slug, nome }: { slug: string; nome: string }) {
  const [url, setUrl] = useState("");
  const [open, setOpen] = useOpener("share", () => setUrl(publicUrl(slug)));
  const { copied, copy } = useCopy();
  const message = `Olá! Separei a apresentação do ${nome} para você conhecer com calma: ${url}`;

  return (
    <Modal open={open} onClose={() => setOpen(false)} title="Compartilhar com cliente">
      <p className="text-sm text-muted">
        O cliente abre somente este empreendimento, sem acesso às suas outras apresentações.
      </p>
      <label htmlFor="share-url" className="mt-5 block text-sm font-medium text-ink">
        Link do cliente
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input id="share-url" readOnly value={url} className="field font-mono text-sm" onFocus={(e) => e.target.select()} />
        <button type="button" className="btn-primary shrink-0 sm:w-40" onClick={() => copy(url)}>
          {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
          {copied ? "Link copiado" : "Copiar link"}
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {copied ? "Link copiado" : ""}
      </p>
      <div className="mt-6 border-t border-line pt-6">
        <a
          className="btn-secondary w-full"
          href={`https://wa.me/?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle className="size-4" aria-hidden />
          Enviar pelo WhatsApp
        </a>
        <p className="mt-2 text-center text-xs text-muted">Você escolhe o contato e confirma o envio no WhatsApp.</p>
      </div>
    </Modal>
  );
}

type Fields = { nome: string; telefone: string; email: string; mensagem: string; consentimento: boolean; website: string };
const empty: Fields = { nome: "", telefone: "", email: "", mensagem: "", consentimento: false, website: "" };

function validate(f: Fields) {
  const e: Partial<Record<keyof Fields, string>> = {};
  if (!f.nome.trim()) e.nome = "Informe seu nome";
  const digits = f.telefone.replace(/\D/g, "");
  if (!digits) e.telefone = "Informe seu telefone ou WhatsApp";
  else if (digits.length < 10 || digits.length > 13) e.telefone = "Informe um telefone válido com DDD";
  if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = "Informe um e-mail válido";
  if (!f.consentimento) e.consentimento = "É preciso autorizar o contato";
  return e;
}

export function LeadDialog({ slug, nome }: { slug: string; nome: string }) {
  const openedAt = useRef(0);
  const [open, setOpen] = useOpener("lead", () => {
    openedAt.current = Date.now();
  });
  const [f, setF] = useState<Fields>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [serverError, setServerError] = useState("");
  const close = () => {
    setOpen(false);
    if (status === "sent") {
      setF(empty);
      setStatus("idle");
    }
  };

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setF((prev) => ({ ...prev, [k]: value }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate(f);
    setErrors(found);
    if (Object.keys(found).length) {
      const first = Object.keys(found)[0];
      (e.currentTarget.elements.namedItem(first) as HTMLElement | null)?.focus();
      return;
    }
    setStatus("sending");
    setServerError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, slug, elapsedMs: Date.now() - openedAt.current }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.fields) setErrors(data.fields);
        throw new Error(data.error || "Não foi possível enviar agora.");
      }
      setStatus("sent");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Não foi possível enviar agora.");
      setStatus("error");
    }
  }

  const fieldError = (k: keyof Fields) =>
    errors[k] ? (
      <p id={`${k}-error`} className="mt-1.5 text-[13px] font-medium text-danger">
        {errors[k]}
      </p>
    ) : null;
  const aria = (k: keyof Fields) => ({
    "aria-invalid": Boolean(errors[k]) || undefined,
    "aria-describedby": errors[k] ? `${k}-error` : undefined,
  });

  return (
    <Modal open={open} onClose={close} title={status === "sent" ? "Mensagem enviada" : "Quero saber mais"}>
      {status === "sent" ? (
        <div role="status">
          <p className="flex items-center gap-2 font-medium text-success">
            <Check className="size-5" aria-hidden /> Recebemos seu interesse no {nome}.
          </p>
          <p className="mt-2 text-muted">Marlon Sotero vai entrar em contato pelo telefone informado.</p>
          <button type="button" className="btn-primary mt-6 w-full" onClick={close}>
            Fechar
          </button>
        </div>
      ) : (
        <form noValidate onSubmit={submit} className="space-y-4">
          <p className="-mt-2 text-sm text-muted">Deixe seu contato e Marlon retorna com detalhes sobre o {nome}.</p>
          <div>
            <label htmlFor="nome" className="mb-1.5 block text-sm font-medium">Nome</label>
            <input id="nome" name="nome" className="field" autoComplete="name" maxLength={120} value={f.nome} onChange={set("nome")} {...aria("nome")} />
            {fieldError("nome")}
          </div>
          <div>
            <label htmlFor="telefone" className="mb-1.5 block text-sm font-medium">Telefone ou WhatsApp</label>
            <input id="telefone" name="telefone" className="field" type="tel" inputMode="tel" autoComplete="tel" placeholder="(17) 99999-9999" maxLength={30} value={f.telefone} onChange={set("telefone")} {...aria("telefone")} />
            {fieldError("telefone")}
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
              E-mail <span className="font-normal text-muted">(opcional)</span>
            </label>
            <input id="email" name="email" className="field" type="email" autoComplete="email" maxLength={160} value={f.email} onChange={set("email")} {...aria("email")} />
            {fieldError("email")}
          </div>
          <div>
            <label htmlFor="mensagem" className="mb-1.5 block text-sm font-medium">
              Mensagem <span className="font-normal text-muted">(opcional)</span>
            </label>
            <textarea id="mensagem" name="mensagem" rows={3} maxLength={1000} className="field h-auto py-3" value={f.mensagem} onChange={set("mensagem")} {...aria("mensagem")} />
            {fieldError("mensagem")}
          </div>
          {/* Honeypot: invisível para pessoas, preenchido por robôs. */}
          <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label htmlFor="website">Site</label>
            <input id="website" name="website" tabIndex={-1} autoComplete="off" value={f.website} onChange={set("website")} />
          </div>
          <div>
            <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm text-muted">
              <input type="checkbox" name="consentimento" checked={f.consentimento} onChange={set("consentimento")} className="mt-0.5 size-5 shrink-0 accent-navy" {...aria("consentimento")} />
              <span>Autorizo Marlon Sotero a entrar em contato comigo sobre este empreendimento.</span>
            </label>
            {fieldError("consentimento")}
          </div>
          {status === "error" && (
            <p role="alert" className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
              {serverError}
            </p>
          )}
          <button type="submit" className="btn-primary w-full" disabled={status === "sending"}>
            {status === "sending" ? "Enviando…" : "Enviar"}
          </button>
        </form>
      )}
    </Modal>
  );
}

export function SectionNav({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [items]);

  return (
    <nav aria-label="Seções do empreendimento" className="sticky top-16 z-30 border-y border-line bg-paper/95 backdrop-blur-sm md:top-[72px]">
      <ul className="page-x no-scrollbar mx-auto flex max-w-[1320px] gap-2 overflow-x-auto">
        {items.map((it) => (
          <li key={it.id} className="shrink-0">
            <a
              href={`#${it.id}`}
              aria-current={active === it.id ? "true" : undefined}
              className={`flex h-11 items-center border-b-2 px-3.5 text-sm font-medium whitespace-nowrap transition-colors md:h-12 ${
                active === it.id ? "border-gold text-navy" : "border-transparent text-muted hover:text-navy"
              }`}
            >
              {it.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
