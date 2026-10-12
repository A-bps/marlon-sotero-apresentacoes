"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { Beat } from "@/data/properties";

/**
 * Hero em tela cheia com percurso: o palco fica fixo (sticky) e as cenas rolam por cima dele.
 * - Cena 0 é a abertura (`intro`); as seguintes são as `beats`.
 * - A foto com `camera` é dimensionada à mão (quadrada, em coordenadas da imagem) e, enquanto as
 *   cenas que a usam rolam, aproxima-se do ponto de destino com uma animação guiada pelo scroll
 *   (só transform, sem handler de scroll). Sem suporte, o zoom vira uma transição disparada pela cena.
 * - A cena ativa vem de um IntersectionObserver; a troca de foto é só opacity/transform.
 * - Espaço do visualizador 3D: quando houver `model`, ele entra no lugar das camadas de foto.
 */
export function Story({ beats, intro, model }: { beats: Beat[]; intro: ReactNode; model?: string }) {
  const [active, setActive] = useState(0); // 0 = abertura; 1..n = beats
  const items = useRef<(HTMLElement | null)[]>([]);

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
  const camIdx = beats.findIndex((b) => b.camera);
  const cam = camIdx >= 0 ? beats[camIdx] : undefined;
  // Última cena que ainda usa a foto da câmera: é onde o zoom termina.
  const lastCam = cam ? beats.reduce((l, b, i) => (b.imagem === cam.imagem ? i : l), camIdx) : -1;
  const near = lastCam >= 0 && active >= lastCam + 1;
  const shown = beats[Math.max(active - 1, 0)];
  const layers = beats.filter((b, i) => beats.findIndex((x) => x.imagem === b.imagem) === i);

  const scenes = Array.from({ length: beats.length + 1 }, (_, i) => {
    const b = beats[i - 1];
    return (
      <article
        key={i}
        data-i={i}
        ref={(el) => {
          items.current[i] = el;
        }}
        className={`flex items-end pb-24 md:pb-14 ${i === 0 ? "min-h-[calc(100svh-64px)] md:min-h-[calc(100svh-72px)]" : "min-h-[85svh] md:min-h-[100svh]"}`}
      >
        {i === 0 ? (
          intro
        ) : (
          <div className="page-x mx-auto w-full max-w-[1320px]">
            <div className="max-w-[420px] rounded-xl border border-line bg-surface p-5 shadow-[0_12px_32px_-16px_rgb(18_35_74/0.4)] md:p-6">
              <p className="font-display text-sm font-medium text-gold-ink tabular-nums">
                {String(i).padStart(2, "0")} <span className="text-muted">/ {total}</span>
              </p>
              <h2 className="mt-2 font-display text-[22px] leading-[1.15] font-semibold text-navy md:text-[30px]">{b.titulo}</h2>
              <p className="mt-3 text-muted md:text-[17px]">{b.texto}</p>
            </div>
          </div>
        )}
      </article>
    );
  });

  return (
    <section aria-label="Percurso pelo empreendimento" className="story relative" data-model={model ? "pending" : undefined}>
      {/* Slot do visualizador 3D: com `model`, renderizar <Viewer3D src={model} poster={shown.imagem} /> no lugar das camadas. */}
      <div className="sticky top-16 z-0 h-[calc(100svh-64px)] [container-type:size] overflow-hidden bg-mist md:top-[72px] md:h-[calc(100svh-72px)]">
        {layers.map((b, i) => {
          const on = b.imagem === shown.imagem;
          const c = b.camera;
          return c ? (
            <div
              key={b.imagem}
              data-near={near}
              style={{ "--ox": c.ox / 100, "--oy": c.oy / 100, "--px": c.px / 100, "--py": c.py / 100 } as CSSProperties}
              className={`cam absolute inset-0 transition-opacity duration-[var(--dur-3)] ease-arch ${on ? "opacity-100" : "opacity-0"}`}
            >
              <Image
                src={b.imagem}
                alt={on ? b.alt : ""}
                aria-hidden={!on}
                width={2400}
                height={2400}
                priority={i === 0}
                sizes="calc(max(100vw, 100svh) * 1.8)"
                className="cam-img"
              />
            </div>
          ) : (
            <Image
              key={b.imagem}
              src={b.imagem}
              alt={on ? b.alt : ""}
              aria-hidden={!on}
              fill
              priority={i === 0}
              fetchPriority={i === 0 ? "high" : "low"}
              sizes="100vw"
              className={`object-cover transition-[opacity,transform] duration-[var(--dur-3)] ease-arch ${
                on ? "scale-100 opacity-100" : "scale-[1.06] opacity-0"
              }`}
            />
          );
        })}
        {/* Leitura do título da abertura: some quando a primeira cena sai. */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-[78%] bg-gradient-to-t from-[#0a1230]/85 via-[#0a1230]/45 via-50% to-transparent transition-opacity duration-[var(--dur-3)] ease-arch ${
            active === 0 ? "opacity-100" : "opacity-0"
          }`}
        />
        {/* Anúncio da cena para leitores de tela (o contador visual está no card). */}
        <p className="sr-only" aria-live="polite">{active > 0 ? `Cena ${active} de ${beats.length}: ${shown.titulo}` : ""}</p>
      </div>

      {/* As cenas sobrepõem o palco (margem negativa); a seção termina quando a última cena sai. */}
      <div className="relative z-10 -mt-[calc(100svh-64px)] md:-mt-[calc(100svh-72px)]">
        {cam ? (
          <>
            <div className="zoom-zone">{scenes.slice(0, lastCam + 2)}</div>
            {scenes.slice(lastCam + 2)}
          </>
        ) : (
          scenes
        )}
      </div>
    </section>
  );
}
