import { Logo } from "@/components/brand";
import Link from "next/link";

export default function NotFound() {
  return (
    <main id="conteudo" className="page-x mx-auto flex min-h-dvh max-w-2xl flex-col justify-center py-16">
      <Logo />
      <p className="eyebrow mt-16">Página não encontrada</p>
      <h1 className="mt-3 font-display text-[28px] leading-[1.15] font-semibold text-navy md:text-[40px]">
        Não encontramos esta apresentação.
      </h1>
      <p className="mt-4 text-muted">
        O link pode estar incompleto ou o empreendimento não está mais disponível. Confira o endereço recebido ou peça um novo link ao corretor.
      </p>
      <Link href="/" className="btn-secondary mt-8 self-start">Ir para a página inicial</Link>
    </main>
  );
}
