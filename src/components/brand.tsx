import Link from "next/link";
import { broker, type PublicProperty } from "@/data/properties";

export function Logo({ href }: { href?: string }) {
  const mark = (
    <span className="block font-display leading-none text-navy">
      <span className="block text-[17px] font-semibold tracking-[-0.01em] uppercase md:text-[20px]">Marlon Sotero</span>
      <span className="mt-1 block text-[9px] font-medium tracking-[0.34em] text-muted uppercase md:text-[10px]">
        Corretor de imóveis
      </span>
    </span>
  );
  return href ? (
    <Link href={href} className="rounded-sm py-2" aria-label="Marlon Sotero, página inicial">
      {mark}
    </Link>
  ) : (
    mark
  );
}

export function waLink(text: string, phone: string | null = broker.whatsapp) {
  return `https://wa.me/${phone ?? ""}?text=${encodeURIComponent(text)}`;
}

export const contactMessage = (nome: string) =>
  `Olá, Marlon! Vi a apresentação do ${nome} e gostaria de saber mais.`;

const range = (ns: number[], unit = "") => {
  const min = Math.min(...ns);
  const max = Math.max(...ns);
  return min === max ? `${min}${unit}` : `${min} a ${max}${unit}`;
};

export function propertyFacts(p: PublicProperty) {
  const facts: { label: string; value: string }[] = [];
  if (p.plantas.length) {
    facts.push({ label: "Suítes", value: range(p.plantas.map((x) => x.suites)) });
    facts.push({ label: "Área privativa", value: range(p.plantas.map((x) => x.areaPrivativa), " m²") });
    facts.push({ label: "Vagas", value: range(p.plantas.map((x) => x.vagas)) });
  }
  return facts;
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="page-x mx-auto grid max-w-[1320px] gap-8 py-12 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <Logo />
          <p className="mt-4 max-w-md text-sm text-muted">
            {broker.endereco}
            {broker.creci && <span className="block">{broker.creci}</span>}
          </p>
        </div>
        <p className="text-sm text-muted">
          <a className="font-medium text-navy underline-offset-4 hover:underline" href={`tel:+${broker.whatsapp}`}>
            {broker.telefone}
          </a>
          <span className="mt-1 block">© {new Date().getFullYear()} Marlon Sotero Corretor de Imóveis</span>
        </p>
      </div>
    </footer>
  );
}

export function Unavailable({ nome }: { nome: string }) {
  return (
    <main id="conteudo" className="page-x mx-auto flex min-h-dvh max-w-2xl flex-col justify-center py-16">
      <Logo href="/" />
      <p className="eyebrow mt-16">Apresentação pausada</p>
      <h1 className="mt-3 font-display text-[28px] leading-[1.15] font-semibold text-navy md:text-[40px]">
        {nome} está temporariamente indisponível.
      </h1>
      <p className="mt-4 text-muted">
        A apresentação deste empreendimento foi pausada. Para informações atualizadas, fale diretamente com Marlon Sotero.
      </p>
      <a className="btn-primary mt-8 self-start" href={waLink(`Olá, Marlon! Gostaria de informações sobre o ${nome}.`)}>
        Falar com Marlon
      </a>
    </main>
  );
}
