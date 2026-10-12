# Progresso: v1

## Feito
- Next.js 16.4 (App Router, TypeScript, Tailwind 4) com zod e lucide-react como únicas dependências de runtime.
- Identidade do Marlon extraída do site atual: cores, Outfit/Inter, logo tipográfico, fotos, telefone e endereço.
- `/` (página inicial, com 1 card em destaque ou grade para N), `/imovel/[slug]` (modo corretor), `/p/[slug]` (modo cliente), 404 amigável e página "pausado".
- Módulos: visão geral, galeria (categorias, lightbox, anterior/próxima, teclado, legendas), localização (OpenStreetMap carregado sob demanda, endereço, pontos de interesse, "Abrir no mapa"), plantas (filtro por tipologia, zoom, download condicional), áreas comuns (lista → detalhe → voltar) e tour (só aparece se houver conteúdo). O menu mostra só os módulos que têm conteúdo.
- `PropertyStage`, com espaço reservado para o 3D e a capa como fallback.
- Modal de compartilhamento (copiar com "Link copiado", WhatsApp `wa.me/?text=`); formulário de lead com as mensagens do escopo, dados mantidos quando há erro e confirmação ao enviar.
- `POST /api/leads` com zod e antiabuso (honeypot, tempo mínimo, limite por IP, mesma origem, content-type, tamanho do corpo) e envio pelo Resend via fetch.
- Cabeçalhos de segurança, CSP com nonce, HSTS e redirecionamento HTTPS.

## Validado
- `tsc --noEmit`, `npm run lint`, `npm run build` e `npm test` (14 testes) passando.
- `curl -I` no build de produção confirmou todos os cabeçalhos.
- Fluxo no navegador (Playwright): copiar link, setas na galeria, zoom na planta, áreas comuns ida e volta, erros do formulário, 503 mantendo os dados, 404 e pausado. Sem violações de CSP no console.
- Capturas em 360/768/1440 revisadas, com duas rodadas de correção.
- `npm audit --omit=dev`: 0 vulnerabilidades. No total aparecem 5 *high* só em dependências de desenvolvimento (`braces` via `eslint-config-next`). Ainda não existe versão corrigida, então elas não entram no build de produção.

## Pendente
- Visualizador 3D (Three.js/R3F) no espaço do `PropertyStage`.
- Escolher o imóvel real e substituir os dados e imagens de exemplo (as imagens atuais são do Unsplash).
- Configurar o Resend: conta, domínio remetente verificado, `RESEND_API_KEY`, `LEAD_TO_EMAIL` e `LEAD_FROM_EMAIL`.
- Domínio e deploy na Vercel (`NEXT_PUBLIC_SITE_URL`).
- Texto da política de privacidade/LGPD e link no formulário.
- CRECI do Marlon (não está publicado no site; o campo `broker.creci` já existe).
- Analytics/eventos (`/api/eventos`), que ficaram de fora por não haver banco.
- Persistência dos leads (hoje só e-mail) e limite por IP compartilhado entre instâncias (KV).

## Decisões
- Sem banco: dados tipados em `src/data/properties.ts`, filtrados no servidor (`toPublic`).
- Um corretor só: `/` é a página inicial, sem `/corretor/{slug}` nem `?corretor=`.
- Página inicial sem botão de WhatsApp (os leads chegam pelo Marlon); no modo cliente, o WhatsApp fica discreto, e "Quero saber mais" é o botão principal.
- Mapa no OpenStreetMap (sem chave nem custo) para manter a CSP enxuta: um único `frame-src`.
- Plantas de exemplo desenhadas em SVG local.
- Todas as páginas usam `noindex`, porque os links são privados e enviados um a um. Há Open Graph para a pré-visualização no WhatsApp.
- Modais com `<dialog>` nativo (foco, Esc e camada superior sem biblioteca).
