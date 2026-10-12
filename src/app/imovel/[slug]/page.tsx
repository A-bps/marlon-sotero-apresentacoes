import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Unavailable } from "@/components/brand";
import { PropertyPage } from "@/components/PropertyPage";
import { allSlugs, getProperty } from "@/data/properties";

export const generateStaticParams = () => (process.env.PAGES ? allSlugs().map((slug) => ({ slug })) : []);

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = getProperty((await params).slug);
  if (found?.state !== "publicado") return { title: "Apresentação indisponível" };
  const p = found.property;
  return {
    title: p.nome,
    description: p.descricaoCurta,
    openGraph: { title: `${p.nome} · Marlon Sotero`, description: p.descricaoCurta, images: [p.capa.src], locale: "pt_BR", type: "website" },
  };
}

export default async function Page({ params }: Props) {
  const found = getProperty((await params).slug);
  if (!found) notFound();
  if (found.state === "pausado") return <Unavailable nome={found.nome} />;
  return <PropertyPage property={found.property} mode="broker" />;
}
