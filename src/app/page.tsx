import { Fragment } from "react";
import { ArrowRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { Footer, Logo, propertyFacts } from "@/components/brand";
import { CopyLinkButton } from "@/components/interactive";
import { BASE, broker, getPublishedProperties, type PublicProperty } from "@/data/properties";

function PropertyCard({ p, index, featured }: { p: PublicProperty; index: number; featured: boolean }) {
  const facts = propertyFacts(p);
  return (
    <article
      className={`group overflow-hidden rounded-xl border border-line bg-surface ease-arch transition-[border-color,box-shadow] duration-700 hover:border-gold/60 hover:shadow-[0_24px_48px_-28px_rgb(18_35_74/0.35)] ${
        featured ? "md:grid md:grid-cols-12" : "flex flex-col"
      }`}
    >
      <Link
        href={`/imovel/${p.slug}`}
        tabIndex={-1}
        aria-hidden
        className={`relative block aspect-[16/10] overflow-hidden bg-mist ${featured ? "md:col-span-7 md:aspect-auto md:min-h-[420px]" : ""}`}
      >
        <Image
          src={p.capa.src}
          alt=""
          fill
          priority={index === 0}
          sizes={featured ? "(min-width: 768px) 58vw, 100vw" : "(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"}
          style={{ objectPosition: p.capa.pos }}
          className="object-cover ease-arch transition-transform duration-[1600ms] group-hover:scale-[1.06] motion-reduce:transition-none"
        />
      </Link>
      <div className={`flex flex-1 flex-col p-5 ${featured ? "md:col-span-5 md:p-10" : "md:p-6"}`}>
        <div className="flex items-center justify-between gap-4">
          <p className="eyebrow flex items-center gap-1.5">
            <MapPin className="size-3.5" aria-hidden /> {p.cidade}/{p.uf}
          </p>
          <span className="font-display text-sm text-muted tabular-nums" aria-hidden>
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <h3 className={`mt-3 font-display leading-[1.15] font-semibold text-navy ${featured ? "text-2xl md:text-[32px]" : "text-2xl"}`}>
          <Link href={`/imovel/${p.slug}`} className="rounded-sm hover:underline hover:decoration-gold hover:underline-offset-4">
            {p.nome}
          </Link>
        </h3>
        <span aria-hidden className="mt-3 block h-px w-10 origin-left bg-gold ease-arch transition-transform duration-700 group-hover:scale-x-[3] motion-reduce:transition-none" />
        <p className="mt-3 text-muted">{p.descricaoCurta}</p>
        {facts.length > 0 && (
          <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-line pt-5">
            {facts.map((f) => (
              <div key={f.label}>
                <dt className="text-xs text-muted">{f.label}</dt>
                <dd className="mt-0.5 text-[15px] font-semibold text-ink">{f.value}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="mt-auto flex flex-col gap-2 pt-8 sm:flex-row">
          <Link href={`/imovel/${p.slug}`} className="btn-primary sm:flex-1">
            Ver empreendimento <ArrowRight className="size-4 ease-arch transition-transform duration-500 group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
          </Link>
          <CopyLinkButton slug={p.slug} className="btn-secondary sm:flex-1" />
        </div>
      </div>
    </article>
  );
}

// Marca <html data-intro> só na primeira visita da sessão, antes da pintura (script com nonce da CSP).
const INTRO = `try{if(!sessionStorage.getItem("ms-intro")){document.documentElement.dataset.intro="";sessionStorage.setItem("ms-intro","1")}}catch(e){}`;

export default async function Home() {
  const nonce = process.env.PAGES ? undefined : ((await headers()).get("x-nonce") ?? undefined);
  const properties = getPublishedProperties();
  const single = properties.length === 1;

  return (
    <>
      <script nonce={nonce} dangerouslySetInnerHTML={{ __html: INTRO }} />
      <header className="border-b border-line bg-surface">
        <div className="page-x mx-auto flex h-16 max-w-[1320px] items-center justify-between md:h-[72px]">
          <span className="intro-fade" style={{ "--i": 0 } as React.CSSProperties}><Logo /></span>
          <p className="intro-fade hidden text-sm text-muted sm:block">São José do Rio Preto/SP</p>
        </div>
      </header>

      <main id="conteudo">
        <section className="page-x mx-auto grid max-w-[1320px] items-center gap-10 pt-10 pb-12 md:grid-cols-12 md:gap-8 md:pt-16 md:pb-20">
          <div className="md:col-span-7">
            <p className="eyebrow intro-fade" style={{ "--i": 1 } as React.CSSProperties}>Apresentações de empreendimentos</p>
            <h1 className="mt-4 max-w-[14ch] font-display text-[34px] leading-[1.08] font-semibold tracking-[-0.02em] text-navy md:text-[56px]">
              {["Empreendimentos", "que acompanho", "de perto."].map((line, i) => (
                <Fragment key={line}>
                  {i > 0 && " "}
                  <span className="intro-line"><span style={{ "--i": i + 2 } as React.CSSProperties}>{line}</span></span>
                </Fragment>
              ))}
            </h1>
            <p style={{ "--i": 5 } as React.CSSProperties} className="intro-fade mt-5 max-w-lg text-[17px] text-muted md:text-lg">
              Cada apresentação reúne imagens, plantas, localização e áreas comuns em um único link para enviar ao cliente.
            </p>
          </div>
          <figure className="md:col-span-5">
            <div className="intro-clip relative aspect-[5/4] overflow-hidden rounded-xl bg-mist md:aspect-[4/5] lg:aspect-[5/4]">
              <Image src={`${BASE}/marlon/perfil-wide.png`} alt="Marlon Sotero em seu escritório" fill priority sizes="(min-width: 768px) 42vw, 100vw" className="object-cover object-[50%_30%]" />
            </div>
            <figcaption style={{ "--i": 6 } as React.CSSProperties} className="intro-fade mt-3 flex items-baseline justify-between gap-4 text-sm">
              <span className="font-medium text-ink">{broker.nome}</span>
              <span className="text-muted">{broker.creci ?? broker.titulo}</span>
            </figcaption>
          </figure>
        </section>

        <section aria-labelledby="lista-title" className="intro-rise page-x mx-auto max-w-[1320px]">
          <div className="mb-8 flex items-end justify-between gap-4 border-t border-line pt-6">
            <h2 id="lista-title" className="font-display text-[22px] font-semibold text-navy md:text-[28px]">
              {single ? "Apresentação disponível" : "Apresentações disponíveis"}
            </h2>
            <p className="text-sm whitespace-nowrap text-muted tabular-nums">
              {properties.length} {properties.length === 1 ? "empreendimento" : "empreendimentos"}
            </p>
          </div>

          {properties.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line bg-surface px-6 py-16 text-center">
              <p className="font-display text-xl font-semibold text-navy">Nenhum empreendimento disponível</p>
              <p className="mt-2 text-muted">As apresentações publicadas aparecerão aqui.</p>
            </div>
          ) : (
            <div className={single ? "" : "grid gap-6 md:grid-cols-2 xl:grid-cols-3"}>
              {properties.map((p, i) => (
                <PropertyCard key={p.slug} p={p} index={i} featured={single} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
