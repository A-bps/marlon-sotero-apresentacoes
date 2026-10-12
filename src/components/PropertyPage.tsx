import { ArrowLeft, ArrowUpRight, Images, MapPin, MessageCircle, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { broker, type PublicProperty } from "@/data/properties";
import { contactMessage, Footer, Logo, propertyFacts, waLink } from "./brand";
import { LeadDialog, SectionNav, ShareDialog } from "./interactive";
import { Amenities, Gallery, Plans } from "./modules";
import { Story } from "./Story";

type Mode = "broker" | "client";

/**
 * Área visual principal. Hoje mostra a capa; quando houver `model` (GLB),
 * o visualizador 3D entra no slot marcado abaixo, mantendo a capa como fallback/poster.
 */
export function PropertyStage({ cover, model, nome }: { cover: { src: string; alt: string }; model?: string; nome: string }) {
  return (
    <div className="relative h-[420px] overflow-hidden bg-mist md:h-[min(72svh,720px)] md:min-h-[600px]" data-model={model ? "pending" : undefined}>
      {/* Slot do visualizador 3D: renderizar <Viewer3D src={model} poster={cover.src} /> aqui. */}
      <Image src={cover.src} alt={cover.alt} fill priority sizes="100vw" className="stage-media object-cover" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/45 to-transparent" aria-hidden />
      <div className="page-x absolute inset-x-0 bottom-0 mx-auto flex max-w-[1320px] items-end justify-between gap-4 pb-5 md:pb-8">
        <p className="sr-only">Imagem principal de {nome}</p>
        <span className="hidden text-xs font-medium tracking-[0.18em] text-white/90 uppercase sm:block">Imagem ilustrativa</span>
        <a href="#galeria" className="btn ml-auto bg-white text-navy shadow-sm hover:bg-paper">
          <Images className="size-4" aria-hidden /> Ver galeria
        </a>
      </div>
    </div>
  );
}

function Section({ id, index, title, intro, children }: { id: string; index: number; title: string; intro?: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="page-x mx-auto max-w-[1320px] pt-14 md:pt-20">
      <div className="relative mb-8 grid gap-3 pt-6 md:mb-10 md:grid-cols-12 md:gap-8">
        <span aria-hidden className="reveal-line absolute inset-x-0 top-0 h-px bg-line" />
        <p className="font-display text-sm font-medium text-gold-ink tabular-nums md:col-span-2" aria-hidden>
          {String(index).padStart(2, "0")}
        </p>
        <div className="reveal md:col-span-10">
          <h2 id={`${id}-title`} className="font-display text-[22px] leading-[1.15] font-semibold text-navy md:text-[28px]">
            {title}
          </h2>
          {intro && <p className="mt-2 max-w-2xl text-muted">{intro}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export function PropertyPage({ property: p, mode }: { property: PublicProperty; mode: Mode }) {
  const wa = waLink(contactMessage(p.nome));
  const facts = propertyFacts(p);
  const modules = [
    { id: "visao-geral", label: "Visão geral", show: true },
    { id: "galeria", label: "Galeria", show: p.galeria.length > 0 },
    { id: "localizacao", label: "Localização", show: Boolean(p.endereco) },
    { id: "plantas", label: "Plantas", show: p.plantas.length > 0 },
    { id: "amenities", label: "Áreas comuns", show: p.amenities.length > 0 },
    { id: "tour", label: "Tour", show: Boolean(p.tour) },
  ].filter((m) => m.show);
  const n = (id: string) => modules.findIndex((m) => m.id === id) + 1;
  const bbox = [p.lng - 0.012, p.lat - 0.007, p.lng + 0.012, p.lat + 0.007].join(",");

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur-sm">
        <div className="page-x mx-auto flex h-16 max-w-[1320px] items-center gap-2 md:h-[72px] md:gap-4">
          {mode === "broker" && (
            <Link href="/" className="icon-btn -ml-2" aria-label="Voltar para empreendimentos">
              <ArrowLeft className="size-5" aria-hidden />
            </Link>
          )}
          <Logo href={mode === "broker" ? "/" : undefined} />
          <span className="mx-2 hidden h-8 w-px bg-line lg:block" aria-hidden />
          <span className="hidden truncate font-display text-[15px] font-medium text-ink lg:block">{p.nome}</span>
          <div className="ml-auto flex items-center gap-2">
            {mode === "broker" ? (
              <>
                <button type="button" data-open="share" className="btn-primary hidden md:inline-flex">
                  <Share2 className="size-4" aria-hidden /> Compartilhar com cliente
                </button>
                <button type="button" data-open="share" className="icon-btn -mr-2 md:hidden" aria-label="Compartilhar com cliente">
                  <Share2 className="size-5" aria-hidden />
                </button>
              </>
            ) : (
              <>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-ghost hidden md:inline-flex">
                  <MessageCircle className="size-4" aria-hidden /> Falar com Marlon
                </a>
                <button type="button" data-open="lead" className="btn-primary hidden md:inline-flex">
                  Quero saber mais
                </button>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="icon-btn -mr-2 md:hidden" aria-label="Falar com Marlon pelo WhatsApp">
                  <MessageCircle className="size-5" aria-hidden />
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      <main id="conteudo" className={mode === "client" ? "pb-24 md:pb-0" : undefined}>
        {p.exemplo && (
          <p className="page-x border-b border-gold/40 bg-[#fbf6e9] py-2.5 text-center text-[13px] text-[#5c4716]">
            Apresentação modelo: textos, imagens e plantas são ilustrativos.
          </p>
        )}
        <div aria-hidden className="scroll-progress fixed inset-x-0 top-0 z-50 h-0.5 bg-gold" />
        <PropertyStage cover={p.capa} model={p.modelo3d} nome={p.nome} />

        <div className="page-x mx-auto grid max-w-[1320px] gap-8 py-10 md:py-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="eyebrow flex items-center gap-1.5">
              <MapPin className="size-3.5" aria-hidden /> {p.bairro} · {p.cidade}/{p.uf}
            </p>
            <h1 className="mt-3 font-display text-[28px] leading-[1.1] font-semibold tracking-[-0.015em] text-navy md:text-[44px]">
              {p.nome}
            </h1>
            <p className="mt-4 max-w-xl text-[17px] text-muted md:text-lg">{p.descricaoCurta}</p>
          </div>
          <div className="md:max-w-xl lg:col-span-5 lg:max-w-none lg:pt-2">
            {facts.length > 0 && <dl className="grid grid-cols-3 border-t border-l border-line bg-surface">
              {facts.map((f) => (
                <div key={f.label} className="border-r border-b border-line px-3 py-4 md:px-5">
                  <dt className="text-xs text-muted">{f.label}</dt>
                  <dd className="mt-1 font-display text-base font-semibold whitespace-nowrap text-navy md:text-xl">{f.value}</dd>
                </div>
              ))}
            </dl>}
            {mode === "client" ? (
              <div className="mt-4 hidden gap-2 md:flex">
                <button type="button" data-open="lead" className="btn-primary flex-1">Quero saber mais</button>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-secondary flex-1">
                  <MessageCircle className="size-4" aria-hidden /> Falar com Marlon
                </a>
              </div>
            ) : (
              <button type="button" data-open="share" className="btn-secondary mt-4 w-full">
                <Share2 className="size-4" aria-hidden /> Compartilhar com cliente
              </button>
            )}
          </div>
        </div>

        {p.narrativa && <Story beats={p.narrativa} />}

        <SectionNav items={modules.map(({ id, label }) => ({ id, label }))} />

        <Section id="visao-geral" index={n("visao-geral")} title="Visão geral">
          <div className="grid gap-6 md:grid-cols-12 md:gap-8">
            <div className="space-y-4 text-[17px] leading-relaxed text-ink/85 md:col-span-7 md:col-start-3">
              {p.descricao.map((t, i) => (
                <p key={i}>{t}</p>
              ))}
            </div>
          </div>
        </Section>

        {p.galeria.length > 0 && (
          <Section id="galeria" index={n("galeria")} title="Galeria" intro="Toque em uma imagem para ampliar e navegar entre os ambientes.">
            <Gallery items={p.galeria} />
          </Section>
        )}

        {p.endereco && (
          <Section id="localizacao" index={n("localizacao")} title="Localização">
            <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
              <div className="self-start overflow-hidden rounded-xl border border-line bg-mist lg:col-span-7">
                <iframe
                  title={`Mapa da localização de ${p.nome}`}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${p.lat},${p.lng}`}
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="block h-[320px] w-full md:h-[440px]"
                />
              </div>
              <div className="lg:col-span-5">
                <p className="text-xs text-muted">Endereço</p>
                <p className="mt-1 font-medium text-ink">{p.endereco}</p>
                <a
                  className="btn-secondary mt-4"
                  href={`https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir no mapa <ArrowUpRight className="size-4" aria-hidden />
                </a>
                {p.pontos.length > 0 && (
                  <>
                    <h3 className="mt-8 text-xs font-semibold tracking-[0.18em] text-muted uppercase">Nos arredores</h3>
                    <ul className="mt-3 divide-y divide-line border-y border-line">
                      {p.pontos.map((pt) => (
                        <li key={pt.nome} className="flex items-baseline justify-between gap-4 py-3.5">
                          <span>
                            <span className="block font-medium text-ink">{pt.nome}</span>
                            <span className="text-[13px] text-muted">{pt.categoria}</span>
                          </span>
                          <span className="shrink-0 text-right text-sm">
                            <span className="block font-semibold text-navy tabular-nums">{pt.distancia}</span>
                            {pt.tempo && <span className="text-[13px] text-muted">{pt.tempo}</span>}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          </Section>
        )}

        {p.plantas.length > 0 && (
          <Section id="plantas" index={n("plantas")} title="Plantas" intro="Amplie para ver os detalhes de cada tipologia.">
            <Plans plans={p.plantas} />
          </Section>
        )}

        {p.amenities.length > 0 && (
          <Section id="amenities" index={n("amenities")} title="Áreas comuns">
            <Amenities items={p.amenities} />
          </Section>
        )}

        {p.tour && (
          <Section id="tour" index={n("tour")} title="Tour">
            <Gallery
              label="Tour"
              items={p.tour.map((s) => ({ src: s.imagem, alt: s.nome, titulo: s.nome, categoria: "outros", tipo: "imagem", publico: true }))}
            />
          </Section>
        )}

        <section aria-labelledby="contato-title" className="page-x mx-auto mt-20 max-w-[1320px] md:mt-28">
          <div className="grid overflow-hidden rounded-xl bg-navy text-white md:grid-cols-12">
            <div className="relative aspect-[4/3] md:col-span-4 md:aspect-auto">
              <Image src={broker.foto} alt="Marlon Sotero, corretor de imóveis" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover object-[50%_20%]" />
            </div>
            <div className="p-6 md:col-span-8 md:p-12">
              <p className="text-xs font-semibold tracking-[0.18em] text-gold uppercase">Atendimento</p>
              {mode === "client" ? (
                <>
                  <h2 id="contato-title" className="mt-3 max-w-lg font-display text-2xl leading-[1.15] font-semibold md:text-[32px]">
                    Quer conhecer o {p.nome} pessoalmente?
                  </h2>
                  <p className="mt-3 max-w-lg text-white/80">
                    Marlon Sotero acompanha cada etapa, da primeira visita à entrega das chaves.
                  </p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <button type="button" data-open="lead" className="btn bg-white text-navy hover:bg-paper">Quero saber mais</button>
                    <a href={wa} target="_blank" rel="noopener noreferrer" className="btn border border-white/40 text-white hover:bg-white/10">
                      <MessageCircle className="size-4" aria-hidden /> Falar com Marlon
                    </a>
                  </div>
                </>
              ) : (
                <>
                  <h2 id="contato-title" className="mt-3 max-w-lg font-display text-2xl leading-[1.15] font-semibold md:text-[32px]">
                    Envie esta apresentação ao seu cliente.
                  </h2>
                  <p className="mt-3 max-w-lg text-white/80">
                    O link abre só este empreendimento, com seus contatos e o formulário de interesse.
                  </p>
                  <button type="button" data-open="share" className="btn mt-8 bg-white text-navy hover:bg-paper">
                    <Share2 className="size-4" aria-hidden /> Compartilhar com cliente
                  </button>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {mode === "client" ? (
        <>
          <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-line bg-surface/95 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-sm md:hidden">
            <button type="button" data-open="lead" className="btn-primary flex-1">Quero saber mais</button>
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-secondary px-4" aria-label="Falar com Marlon pelo WhatsApp">
              <MessageCircle className="size-5" aria-hidden />
            </a>
          </div>
          <LeadDialog slug={p.slug} nome={p.nome} />
        </>
      ) : (
        <ShareDialog slug={p.slug} nome={p.nome} />
      )}
    </>
  );
}
