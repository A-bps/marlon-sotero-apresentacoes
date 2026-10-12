"use client";

import { ArrowLeft, ChevronLeft, ChevronRight, Download, Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import type { Amenity, Media, Plan } from "@/data/properties";
import { Modal } from "./interactive";

const CATEGORY_LABEL: Record<string, string> = {
  fachada: "Fachada", sala: "Sala", cozinha: "Cozinha", quarto: "Quarto", suite: "Suíte", sacada: "Sacada",
  piscina: "Piscina", academia: "Academia", paisagismo: "Paisagismo", implantacao: "Implantação", outros: "Outros",
};

function Chips({ options, value, onChange, label }: { options: { id: string; label: string }[]; value: string; onChange: (v: string) => void; label: string }) {
  if (options.length < 3) return null; // "Todas" + 1 categoria não é filtro
  return (
    <div role="group" aria-label={label} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={`h-11 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors md:h-10 ${
            value === o.id ? "border-navy bg-navy text-white" : "border-line bg-surface text-muted hover:border-navy hover:text-navy"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Gallery({ items, label = "Galeria" }: { items: Media[]; label?: string }) {
  const [cat, setCat] = useState("todas");
  const [index, setIndex] = useState<number | null>(null);
  const cats = [...new Set(items.map((m) => m.categoria))];
  const list = cat === "todas" ? items : items.filter((m) => m.categoria === cat);
  const current = index === null ? null : list[index];
  const go = (d: number) => setIndex((i) => (i === null ? i : (i + d + list.length) % list.length));

  return (
    <div>
      <Chips
        label="Filtrar por ambiente"
        value={cat}
        onChange={(v) => setCat(v)}
        options={[{ id: "todas", label: "Todas" }, ...cats.map((c) => ({ id: c, label: CATEGORY_LABEL[c] ?? c }))]}
      />
      <ul className="mt-6 grid auto-rows-[clamp(120px,30vw,200px)] grid-cols-2 gap-2 md:auto-rows-[clamp(150px,15vw,240px)] md:grid-cols-4 md:gap-3">
        {list.map((m, i) => (
          <li
            key={m.src + i}
            className={i === 0 ? "col-span-2 row-span-2" : "col-[span_var(--s)] md:col-[span_var(--m)]"}
            // O último item estica para fechar a linha (sem buracos no grid).
            style={i === list.length - 1 && i > 0 ? ({ "--s": 1 + ((2 - ((list.length + 3) % 2)) % 2), "--m": 1 + ((4 - ((list.length + 3) % 4)) % 4) } as React.CSSProperties) : ({ "--s": 1, "--m": 1 } as React.CSSProperties)}
          >
            <button
              type="button"
              onClick={() => setIndex(i)}
              className="group relative block size-full overflow-hidden rounded-lg bg-mist"
              aria-label={`Ampliar imagem: ${m.titulo}`}
            >
              <Image
                src={m.src}
                alt={m.alt}
                fill
                sizes={i === 0 ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 50vw"}
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-3 pt-8 pb-2.5 text-left text-[13px] font-medium text-white">
                {m.titulo}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <Modal
        open={current !== null}
        onClose={() => setIndex(null)}
        title={label}
        size="wide"
        tone="dark"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1);
          if (e.key === "ArrowLeft") go(-1);
        }}
      >
        {current && (
          <div>
            <div className="relative aspect-[3/2] max-h-[65dvh] w-full overflow-hidden rounded-lg bg-black/40">
              <Image src={current.src} alt={current.alt} fill sizes="(min-width: 960px) 912px, 100vw" className="object-contain" priority />
            </div>
            <div className="mt-4 flex items-center justify-between gap-4">
              <p className="min-w-0 text-sm">
                <span className="font-medium">{current.titulo}</span>
                <span className="block text-white/80">{index! + 1} de {list.length} · {CATEGORY_LABEL[current.categoria]}</span>
              </p>
              {list.length > 1 && (
                <div className="flex shrink-0 gap-2">
                  <button type="button" className="icon-btn border border-white/25 text-white hover:bg-white/10" onClick={() => go(-1)} aria-label="Imagem anterior">
                    <ChevronLeft className="size-5" aria-hidden />
                  </button>
                  <button type="button" className="icon-btn border border-white/25 text-white hover:bg-white/10" onClick={() => go(1)} aria-label="Próxima imagem" autoFocus>
                    <ChevronRight className="size-5" aria-hidden />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export function Plans({ plans }: { plans: Plan[] }) {
  const tipos = [...new Set(plans.map((p) => p.tipologia))];
  const [tipo, setTipo] = useState("todas");
  const [open, setOpen] = useState<Plan | null>(null);
  const [zoom, setZoom] = useState(1);
  const list = tipo === "todas" ? plans : plans.filter((p) => p.tipologia === tipo);

  return (
    <div>
      <Chips
        label="Filtrar por tipologia"
        value={tipo}
        onChange={setTipo}
        options={[{ id: "todas", label: "Todas" }, ...tipos.map((t) => ({ id: t, label: t }))]}
      />
      <ul className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((p) => (
          <li key={p.id} className="flex flex-col overflow-hidden rounded-xl border border-line bg-surface">
            <button
              type="button"
              onClick={() => { setZoom(1); setOpen(p); }}
              className="group relative block aspect-[3/2] w-full shrink-0 bg-paper"
              aria-label={`Ampliar planta ${p.nome}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- SVG local; next/image exigiria dangerouslyAllowSVG */}
              <img src={p.arquivo} alt="" className="absolute inset-4 size-[calc(100%-2rem)] object-contain" loading="lazy" />
              <span className="absolute top-3 right-3 inline-flex size-9 items-center justify-center rounded-md bg-surface text-navy shadow-sm transition-opacity md:opacity-0 md:group-hover:opacity-100">
                <Maximize2 className="size-4" aria-hidden />
              </span>
            </button>
            <div className="flex flex-1 flex-col border-t border-line p-5">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-lg font-semibold text-navy">{p.nome}</h3>
                <span className="text-sm text-muted">{p.tipologia}</span>
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-4 text-sm">
                <div><dt className="text-xs text-muted">Privativa</dt><dd className="mt-0.5 font-semibold">{p.areaPrivativa} m²</dd></div>
                <div><dt className="text-xs text-muted">Suítes</dt><dd className="mt-0.5 font-semibold">{p.suites}</dd></div>
                <div><dt className="text-xs text-muted">Vagas</dt><dd className="mt-0.5 font-semibold">{p.vagas}</dd></div>
              </dl>
              <div className="mt-5 flex gap-2">
                <button type="button" className="btn-secondary flex-1" onClick={() => { setZoom(1); setOpen(p); }}>
                  Ampliar
                </button>
                {p.podeBaixar && (
                  <a className="icon-btn border border-line size-12 md:size-11" href={p.arquivo} download aria-label={`Baixar planta ${p.nome}`}>
                    <Download className="size-4" aria-hidden />
                  </a>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <Modal open={open !== null} onClose={() => setOpen(null)} title={open ? `Planta ${open.nome}` : "Planta"} size="wide">
        {open && (
          <>
            <div className="h-[60dvh] overflow-auto rounded-lg border border-line bg-paper" tabIndex={0} aria-label="Área da planta; role para mover quando ampliada">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={open.arquivo}
                alt={`Planta ${open.nome}: ${open.tipologia}, ${open.areaPrivativa} m² privativos`}
                style={{ width: `${zoom * 100}%` }}
                className="mx-auto h-auto max-w-none transition-[width] duration-200"
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1" role="group" aria-label="Zoom">
                <button type="button" className="icon-btn border border-line" onClick={() => setZoom((z) => Math.max(1, z - 0.5))} disabled={zoom <= 1} aria-label="Diminuir zoom">
                  <ZoomOut className="size-4" aria-hidden />
                </button>
                <span className="w-14 text-center text-sm tabular-nums" aria-live="polite">{Math.round(zoom * 100)}%</span>
                <button type="button" className="icon-btn border border-line" onClick={() => setZoom((z) => Math.min(3, z + 0.5))} disabled={zoom >= 3} aria-label="Aumentar zoom">
                  <ZoomIn className="size-4" aria-hidden />
                </button>
              </div>
              {open.podeBaixar && (
                <a className="btn-secondary" href={open.arquivo} download>
                  <Download className="size-4" aria-hidden /> Baixar planta
                </a>
              )}
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

export function Amenities({ items }: { items: Amenity[] }) {
  const [selected, setSelected] = useState<Amenity | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const show = (a: Amenity | null) => {
    const prev = selected;
    setSelected(a);
    requestAnimationFrame(() => {
      if (a) heading.current?.focus();
      else listRef.current?.querySelector<HTMLButtonElement>(`[data-id="${prev?.id}"]`)?.focus();
    });
  };

  if (selected)
    return (
      <div className="grid gap-6 md:grid-cols-12 md:gap-10">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-mist md:col-span-7">
          <Image src={selected.imagem} alt={selected.alt} fill sizes="(min-width: 768px) 58vw, 100vw" className="object-cover" />
        </div>
        <div className="md:col-span-5 md:py-2">
          <button type="button" className="btn-ghost -ml-3 px-3" onClick={() => show(null)}>
            <ArrowLeft className="size-4" aria-hidden /> Voltar à lista
          </button>
          <h3 ref={heading} tabIndex={-1} className="mt-4 font-display text-2xl font-semibold text-navy md:text-[28px]">
            {selected.nome}
          </h3>
          <p className="mt-3 text-muted">{selected.descricao}</p>
        </div>
      </div>
    );

  return (
    <ul ref={listRef} className="grid gap-x-4 gap-y-6 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((a) => (
        <li key={a.id}>
          <button type="button" data-id={a.id} onClick={() => show(a)} className="group block w-full text-left">
            <span className="relative block aspect-[4/3] overflow-hidden rounded-lg bg-mist">
              <Image src={a.imagem} alt={a.alt} fill sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
            </span>
            <span className="mt-3 flex items-center justify-between gap-2 font-medium text-navy">
              {a.nome}
              <ChevronRight className="size-4 shrink-0 text-gold-ink transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
