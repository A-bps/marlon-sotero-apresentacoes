// Conteúdo curado pelo desenvolvedor. Para adicionar um empreendimento,
// copie o objeto "empreendimento-exemplo", troque os dados e as imagens
// em public/imoveis/<slug>/ e mude o status para "publicado".
// Arquivos em public/ são acessíveis por URL: não coloque material confidencial lá.

export type Status = "rascunho" | "publicado" | "pausado";

export type MediaCategory =
  | "fachada" | "sala" | "cozinha" | "quarto" | "suite" | "sacada"
  | "piscina" | "academia" | "paisagismo" | "implantacao" | "outros";

export type Media = {
  src: string;
  alt: string;
  titulo: string;
  categoria: MediaCategory;
  tipo: "imagem" | "render";
  publico: boolean;
};

export type Plan = {
  id: string;
  nome: string;
  tipologia: string;
  quartos: number;
  suites: number;
  areaPrivativa: number;
  areaTotal?: number;
  vagas: number;
  arquivo: string;
  podeBaixar: boolean;
  ativo: boolean;
};

export type Amenity = { id: string; nome: string; descricao: string; imagem: string; alt: string; ativo: boolean };

export type PointOfInterest = { nome: string; categoria: string; distancia: string; tempo?: string; ativo: boolean };

export type TourScene = { nome: string; imagem: string };

/**
 * Cena do percurso (scrollytelling): uma imagem e uma frase curta.
 * Cenas seguidas com a mesma imagem compartilham a foto. Se uma delas tiver `camera`, a foto é uma
 * "câmera" que se aproxima de um ponto enquanto essas cenas rolam (percentuais da própria imagem):
 * ox/oy = ponto de destino (ex.: a porta); px/py = enquadramento em telas mais largas que a foto.
 */
export type Beat = {
  titulo: string;
  texto: string;
  imagem: string;
  alt: string;
  camera?: { ox: number; oy: number; px: number; py: number };
};

export type Property = {
  slug: string;
  nome: string;
  status: Status;
  ordem: number;
  /** Conteúdo ilustrativo: exibe um aviso discreto na página. */
  exemplo?: boolean;
  descricaoCurta: string;
  descricao: string[];
  cidade: string;
  uf: string;
  bairro: string;
  endereco: string;
  lat: number;
  lng: number;
  capa: { src: string; alt: string; pos?: string };
  /** URL do GLB/GLTF. Reservado para o visualizador 3D (ainda não implementado). */
  modelo3d?: string;
  galeria: Media[];
  plantas: Plan[];
  amenities: Amenity[];
  pontos: PointOfInterest[];
  tour?: TourScene[];
  /** Percurso narrativo opcional (fachada → ambientes → lazer → localização). */
  narrativa?: Beat[];
};

export const broker = {
  nome: "Marlon Sotero",
  titulo: "Corretor de Imóveis",
  // CRECI não está publicado no site atual; preencha (ex.: "CRECI-SP 000000") para exibir.
  creci: undefined as string | undefined,
  whatsapp: "5517992104000",
  telefone: "(17) 99210-4000",
  endereco: "Avenida Sílvio Dela Rovere, nº 720, sala 12 — Jardim Yolanda, São José do Rio Preto/SP",
  site: "https://marlonsoterocorretor.com.br",
  foto: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/marlon/perfil.png`,
};

// Prefixo só usado na prévia estática do GitHub Pages (site em /<repositório>/); vazio no build normal.
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const allSlugs = () => properties.filter((p) => p.status !== "rascunho").map((p) => p.slug);

const img = (f: string) => `${BASE}/imoveis/exemplo/${f}`;
const FACHADA_ALT = "Fachada contemporânea ao entardecer, com laje em balanço, pedra clara, entrada coberta e fitas de luz quente";

const properties: Property[] = [
  {
    slug: "empreendimento-exemplo",
    nome: "Empreendimento Exemplo",
    status: "publicado",
    ordem: 1,
    exemplo: true,
    descricaoCurta:
      "Residencial de médio porte com plantas de 2 e 3 suítes, área de lazer completa e paisagismo autoral.",
    descricao: [
      "Este é o modelo de apresentação que cada empreendimento recebe. Textos, imagens, plantas e localização abaixo são ilustrativos e serão substituídos pelo material oficial do projeto escolhido.",
      "A estrutura mostra como o cliente navega: visão geral, galeria por ambiente, localização com pontos de interesse, plantas com ampliação e áreas comuns. Tudo em um único link, sem instalar nada.",
    ],
    cidade: "São José do Rio Preto",
    uf: "SP",
    bairro: "Bairro ilustrativo",
    endereco: "Endereço ilustrativo, São José do Rio Preto/SP",
    lat: -20.8197,
    lng: -49.3794,
    capa: { src: img("fachada-casa.jpg"), alt: FACHADA_ALT, pos: "50% 37%" },
    galeria: [
      { src: img("fachada-casa.jpg"), alt: FACHADA_ALT, titulo: "Fachada ao entardecer", categoria: "fachada", tipo: "imagem", publico: true },
      { src: img("fachada.jpg"), alt: "Fachada contemporânea branca com piscina em primeiro plano", titulo: "Fachada", categoria: "fachada", tipo: "imagem", publico: true },
      { src: img("fachada2.jpg"), alt: "Residência iluminada ao entardecer com jardim frontal", titulo: "Acesso principal", categoria: "fachada", tipo: "imagem", publico: true },
      { src: img("sala.jpg"), alt: "Sala de estar integrada com sofá claro e grandes aberturas", titulo: "Living integrado", categoria: "sala", tipo: "imagem", publico: true },
      { src: img("sala2.jpg"), alt: "Sala de estar com iluminação natural e móveis neutros", titulo: "Estar", categoria: "sala", tipo: "imagem", publico: true },
      { src: img("cozinha.jpg"), alt: "Volume em madeira e vidro com jardim lateral", titulo: "Fachada lateral", categoria: "fachada", tipo: "imagem", publico: true },
      { src: img("quarto.jpg"), alt: "Suíte com cama de casal e tons neutros", titulo: "Suíte master", categoria: "suite", tipo: "imagem", publico: true },
      { src: img("piscina.jpg"), alt: "Piscina externa cercada por deck e vegetação", titulo: "Piscina", categoria: "piscina", tipo: "imagem", publico: true },
      { src: img("paisagismo.jpg"), alt: "Área externa com paisagismo e caminhos", titulo: "Paisagismo", categoria: "paisagismo", tipo: "imagem", publico: true },
      // Exemplo de mídia interna: nunca chega à página pública.
      { src: img("predio2.jpg"), alt: "Estudo interno de volumetria", titulo: "Estudo interno", categoria: "outros", tipo: "render", publico: false },
    ],
    plantas: [
      { id: "tipo-a", nome: "Tipo A", tipologia: "2 suítes", quartos: 2, suites: 2, areaPrivativa: 86, areaTotal: 132, vagas: 2, arquivo: img("plantas/tipo-a.svg"), podeBaixar: true, ativo: true },
      { id: "tipo-b", nome: "Tipo B", tipologia: "3 suítes", quartos: 3, suites: 3, areaPrivativa: 118, areaTotal: 171, vagas: 2, arquivo: img("plantas/tipo-b.svg"), podeBaixar: false, ativo: true },
      { id: "cobertura", nome: "Cobertura", tipologia: "3 suítes", quartos: 3, suites: 3, areaPrivativa: 142, areaTotal: 210, vagas: 3, arquivo: img("plantas/cobertura.svg"), podeBaixar: true, ativo: true },
      { id: "garden", nome: "Garden (em revisão)", tipologia: "2 suítes", quartos: 2, suites: 2, areaPrivativa: 98, vagas: 2, arquivo: img("plantas/tipo-a.svg"), podeBaixar: false, ativo: false },
    ],
    amenities: [
      { id: "piscina", nome: "Piscina adulto e infantil", descricao: "Raia de 25 metros com deck molhado, espreguiçadeiras e área de sombra. Área infantil separada com profundidade reduzida.", imagem: img("piscina.jpg"), alt: "Piscina com deck e vegetação", ativo: true },
      { id: "academia", nome: "Academia", descricao: "Espaço equipado para musculação e treino funcional, com iluminação natural e vista para o jardim.", imagem: img("academia.jpg"), alt: "Academia com equipamentos de musculação", ativo: true },
      { id: "lobby", nome: "Lobby e coworking", descricao: "Recepção com pé-direito duplo e salas de trabalho reserváveis pelos moradores.", imagem: img("lobby.jpg"), alt: "Ambiente de trabalho compartilhado com mesas e luz natural", ativo: true },
      { id: "jardim", nome: "Jardim e praça", descricao: "Paisagismo com espécies nativas, caminhos de pedestres e bancos sombreados.", imagem: img("paisagismo.jpg"), alt: "Jardim com caminhos e vegetação", ativo: true },
      { id: "spa", nome: "Spa (em definição)", descricao: "Item ainda não confirmado.", imagem: img("sala2.jpg"), alt: "", ativo: false },
    ],
    narrativa: [
      { titulo: "A chegada", texto: "Laje em balanço, pedra clara e fitas de luz quente desenham a fachada. A entrada coberta já se vê da rua.", imagem: img("fachada-casa.jpg"), alt: FACHADA_ALT, camera: { ox: 54, oy: 58, px: 50, py: 40 } },
      { titulo: "Entrar", texto: "Sob a laje, a luz conduz até a porta. Do lado de dentro, a casa se abre.", imagem: img("fachada-casa.jpg"), alt: FACHADA_ALT },
      { titulo: "Viver por dentro", texto: "Estar, jantar e cozinha em um só ambiente, abertos para a luz do dia e para a varanda.", imagem: img("sala.jpg"), alt: "Sala de estar integrada com sofá claro e grandes aberturas" },
      { titulo: "O lazer em casa", texto: "Piscina com deck, academia e jardim: o fim de semana começa no térreo.", imagem: img("piscina.jpg"), alt: "Piscina externa cercada por deck e vegetação" },
      { titulo: "O entorno", texto: "Mercado a seis minutos a pé, escola e hospital a poucos minutos de carro.", imagem: img("paisagismo.jpg"), alt: "Caminho arborizado em área verde" },
    ],
    pontos: [
      { nome: "Supermercado", categoria: "Serviços", distancia: "450 m", tempo: "6 min a pé", ativo: true },
      { nome: "Escola de ensino fundamental", categoria: "Educação", distancia: "900 m", tempo: "3 min de carro", ativo: true },
      { nome: "Hospital", categoria: "Saúde", distancia: "2,1 km", tempo: "6 min de carro", ativo: true },
      { nome: "Shopping center", categoria: "Compras", distancia: "3,4 km", tempo: "9 min de carro", ativo: true },
      { nome: "Parque municipal", categoria: "Lazer", distancia: "1,2 km", tempo: "4 min de carro", ativo: true },
      { nome: "Rodovia de acesso", categoria: "Mobilidade", distancia: "4,0 km", tempo: "8 min de carro", ativo: false },
    ],
  },
  {
    // Demonstra o estado "pausado" (/imovel/exemplo-pausado). Remova ao publicar o primeiro imóvel real.
    slug: "exemplo-pausado",
    nome: "Exemplo Pausado",
    status: "pausado",
    ordem: 99,
    descricaoCurta: "",
    descricao: [],
    cidade: "São José do Rio Preto",
    uf: "SP",
    bairro: "",
    endereco: "",
    lat: 0,
    lng: 0,
    capa: { src: img("predio.jpg"), alt: "" },
    galeria: [],
    plantas: [],
    amenities: [],
    pontos: [],
  },
];

export type PublicProperty = Omit<Property, "status" | "ordem">;

/** Filtra tudo o que não é público. Use sempre no servidor antes de passar dados a componentes. */
function toPublic(p: Property): PublicProperty {
  return {
    slug: p.slug,
    nome: p.nome,
    exemplo: p.exemplo,
    descricaoCurta: p.descricaoCurta,
    descricao: p.descricao,
    cidade: p.cidade,
    uf: p.uf,
    bairro: p.bairro,
    endereco: p.endereco,
    lat: p.lat,
    lng: p.lng,
    capa: p.capa,
    modelo3d: p.modelo3d,
    galeria: p.galeria.filter((m) => m.publico),
    plantas: p.plantas.filter((pl) => pl.ativo),
    amenities: p.amenities.filter((a) => a.ativo),
    pontos: p.pontos.filter((pt) => pt.ativo),
    tour: p.tour?.length ? p.tour : undefined,
    narrativa: p.narrativa?.length ? p.narrativa : undefined,
  };
}

export function getPublishedProperties(): PublicProperty[] {
  return properties
    .filter((p) => p.status === "publicado")
    .sort((a, b) => a.ordem - b.ordem)
    .map(toPublic);
}

/** "publicado" → dados públicos; "pausado" → indisponível; rascunho ou inexistente → null (404). */
export function getProperty(
  slug: string,
): { state: "publicado"; property: PublicProperty } | { state: "pausado"; nome: string } | null {
  const p = properties.find((x) => x.slug === slug);
  if (!p || p.status === "rascunho") return null;
  if (p.status === "pausado") return { state: "pausado", nome: p.nome };
  return { state: "publicado", property: toPublic(p) };
}
