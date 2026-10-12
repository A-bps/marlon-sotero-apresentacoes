"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Beat } from "@/data/properties";

/**
 * Percurso com imagem fixa (sticky) e frases que rolam ao lado. A cena ativa vem de um
 * IntersectionObserver (sem handler de scroll); a troca é só opacity/transform.
 */
export function Story({ beats }: { beats: Beat[] }) {
  const [active, setActive] = useState(0);
  const items = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i));
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    items.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const total = String(beats.length).padStart(2, "0");

  return (
    <section aria-label="Percurso pelo empreendimento" className="page-x mx-auto max-w-[1320px] pt-6 lg:grid lg:grid-cols-12 lg:gap-12 lg:pt-10">
      <div className="sticky top-16 z-20 h-[calc(48svh+12px)] bg-paper pt-3 md:top-[72px] md:h-[calc(56svh+12px)] lg:top-[84px] lg:z-0 lg:h-[calc(100svh-120px)] lg:bg-transparent lg:pt-0 lg:col-span-7">
        <div className="relative h-full overflow-hidden rounded-xl bg-mist">
          {beats.map((b, i) => (
            <Image
              key={b.imagem + i}
              src={b.imagem}
              alt={i === active ? b.alt : ""}
              aria-hidden={i !== active}
              fill
              sizes="(min-width: 1024px) 58vw, 100vw"
              className={`object-cover transition-[opacity,transform] duration-[var(--dur-3)] ease-arch ${
                i === active ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"
              }`}
            />
          ))}
          <p className="absolute bottom-4 left-4 rounded-md bg-surface/95 px-3 py-1.5 font-display text-sm text-navy tabular-nums" aria-live="polite">
            {String(active + 1).padStart(2, "0")} <span className="text-muted">/ {total}</span>
            <span className="sr-only">: {beats[active].titulo}</span>
          </p>
        </div>
      </div>
      <ol className="relative z-10 lg:col-span-5">
        {beats.map((b, i) => (
          <li
            key={b.titulo}
            data-i={i}
            ref={(el) => {
              items.current[i] = el;
            }}
            className="flex min-h-[58svh] items-end pb-6 lg:min-h-[calc(100svh-120px)] lg:items-center lg:pb-0"
          >
            <div
              className={`w-full rounded-xl border border-line bg-surface p-5 shadow-[0_8px_24px_-16px_rgb(18_35_74/0.35)] transition-opacity duration-[var(--dur-2)] ease-arch lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none ${
                i === active ? "opacity-100" : "lg:opacity-35"
              }`}
            >
              <p className="font-display text-sm font-medium text-gold-ink tabular-nums">
                {String(i + 1).padStart(2, "0")} <span className="text-muted">/ {total}</span>
              </p>
              <h3 className="mt-2 font-display text-[22px] leading-[1.15] font-semibold text-navy md:text-[32px]">{b.titulo}</h3>
              <p className="mt-3 max-w-md text-muted md:text-[17px]">{b.texto}</p>
            </div>
          </li>
        ))}
        {/* Mobile: o pin solta alinhado a este espaço, então o último texto não fica sob a imagem. */}
        <li aria-hidden className="h-[calc(48svh+12px)] md:h-[calc(56svh+12px)] lg:hidden" />
      </ol>
    </section>
  );
}
