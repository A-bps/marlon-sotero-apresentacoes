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

## v1.1: movimento e percurso (scrollytelling)
- **Sem biblioteca nova.** Tudo é CSS (animações guiadas por scroll com `@supports`, `position: sticky`) mais um IntersectionObserver. Não há handler de scroll, só `transform`/`opacity` são animados, e a CSP com nonce continua igual.
- **Tokens** (`globals.css`): `--ease-arch` (cubic-bezier .22,.7,.1,1, também disponível como classe `ease-arch`), `--dur-1` 180ms, `--dur-2` 480ms, `--dur-3` 900ms, `--stagger` 70ms.
- **Entrada do hub:** na 1ª visita da sessão (sessionStorage dentro de try/catch, marcado por um script inline com o nonce da CSP), o título é revelado por máscara linha a linha, o retrato abre com clip e escala, e o card entra em seguida. Leva cerca de 1,3 s e não bloqueia a interação. O retrato nunca começa oculto (LCP medido em ~100ms, CLS 0).
- **Páginas do imóvel:** parallax na capa, barra fina de progresso de leitura, cabeçalhos de seção com a linha desenhada e o título subindo ao entrar na tela, e o percurso `Story` (imagem fixa com crossfade e leve escala; textos curtos "A chegada → Viver por dentro → O lazer em casa → O entorno"). Os dados ficam no campo opcional `narrativa`; sem ele, o percurso não aparece.
- **prefers-reduced-motion:** tudo fica estático. **Navegadores sem scroll-driven animations** (Firefox, Safari antigo): sem parallax, progresso e revelação; o conteúdo continua visível.
- **Validado:** tsc, lint, 14 testes e build passando; audit de produção com 0; fluxos Playwright (compartilhar, âncoras do menu, lightbox, zoom, áreas comuns, formulário, 404/pausado) ok; capturas 360/768/1440 incluindo cada cena do percurso.

## v1.2: fachada real e câmera até a porta
- **Foto da fachada** (enviada pelo cliente, 3480 px quadrada) em `public/imoveis/exemplo/fachada-casa.jpg`: 2400 px de largura, JPEG q82 mozjpeg (~375 KB). A placa do carro foi desfocada (já estava ilegível na foto original). O arquivo original não foi copiado para `public/`, para não publicar a versão sem tratamento.
- É a capa (`capa` com `pos` para o recorte dos cards), a primeira imagem da galeria e a primeira cena do percurso.
- **Hero em tela cheia e fixo:** `Story` agora é o hero da página (palco `sticky` de 100svh menos o cabeçalho; sem ele, `PropertyStage` mostra só a capa). Abertura com nome e localização sobre a foto, depois as cenas "A chegada", "Entrar", "Viver por dentro", "O lazer em casa" e "O entorno". A ficha (suítes, área, vagas) e os botões vêm logo depois do percurso.
- **Câmera até a porta:** a foto quadrada é dimensionada à mão (sem `object-fit`) e usa `cqw`/`cqh` do palco, então a origem do zoom (`camera.ox/oy`, em % da imagem: porta em 54%/58%) vale em qualquer proporção de tela. O zoom roda numa animação guiada pelo scroll (`view-timeline` na zona das cenas "abertura → entrar", faixa `contain`), só com transform. Termina com a porta no centro e então a foto cruza para o interior (IntersectionObserver, opacity/scale).
- **Fallback:** sem scroll-driven animations (Firefox, Safari antigo) o zoom vira uma transição disparada pela cena "Entrar". Com `prefers-reduced-motion` fica tudo estático.
- **Correção de um 500 em produção:** o commit da prévia estática exportava `generateStaticParams` (vazio) também no build normal, o que tornava `/p/[slug]` e `/imovel/[slug]` estáticas e quebrava com `DYNAMIC_SERVER_USAGE` por causa do `connection()` do layout (nonce da CSP). Agora o export só existe com `PAGES=1`.
- **Validado:** tsc, lint, 14 testes, build normal e build `PAGES=1` (em cópia temporária, sem `src/app/api` e `src/proxy.ts`); caminhos com o prefixo BASE e zoom conferidos servindo `out/` sob `/Marlon-Sistema/`. LCP ~330 ms (a própria foto, também sem JS), CLS 0. Fluxos Playwright (compartilhar, menu, galeria, plantas, áreas comuns, formulário, 404/pausado) e cabeçalhos de segurança ok. `npm audit --omit=dev`: 0.
- **Observação:** durante o scroll com CPU 4x mais lenta há 2 a 3 tarefas longas de 70 a 150 ms (decodificação/raster das camadas); em CPU normal ficam abaixo de 40 ms. Na prévia estática o `<Link>` do hub dispara um prefetch RSC que dá 404 no console (anterior a esta mudança, inofensivo).

## v1.3: hero só com a fachada e percurso dos ambientes separado
- **Pedido do usuário:** a fachada e os ambientes internos não podem dividir o mesmo scroll fixo. A versão v1.2 (câmera até a porta e entrada no interior dentro do hero) foi desfeita.
- **Hero** (`PropertyStage`): só `fachada-casa.jpg`, em tela cheia sob o cabeçalho, com nome e localização sobre a foto e a dica "Role para continuar".
  - A seção tem 150svh com o palco fixo de 100svh, então o pin é curto (cerca de meia tela).
  - Enquanto a seção passa, a foto faz um zoom leve de 1 para 1,13 em direção à entrada (`capa.foco`). É uma animação guiada pelo scroll (`view-timeline` na própria seção, faixa `contain`), só com transform.
  - Sem suporte, ou com `prefers-reduced-motion`, fica estática. A imagem LCP não depende de JS.
  - O recorte usa `object-fit: cover` com `capa.pos`. O aviso "Apresentação modelo" agora fica sobre o topo do palco, para que o hero ocupe exatamente a tela no mobile (antes ele empurrava o título para baixo da barra fixa).
- **Percurso dos ambientes:** `Story.tsx` restaurado da versão 51f1d79 (imagem fixa de um lado, frases curtas rolando ao lado) e posicionado depois da ficha, com "Viver por dentro", "O lazer em casa" e "O entorno".
- **Removido:** a maquinaria da câmera (`Beat.camera`, `.cam`/`.cam-img`, `timeline-scope`/`zoom-zone`, keyframes `cam`), o parallax antigo `.stage-media` e as cenas "A chegada"/"Entrar".
- **Inalterados:** card do hub, galeria (fachada continua a 1ª imagem), plantas, áreas comuns, mapa, compartilhar, formulário, âncoras do menu e prévia do Pages.
- **Validado:**
  - tsc, lint, 14 testes, build normal + `next start` (`/`, `/imovel/…` e `/p/…` retornam 200; `/p/nao-existe` retorna 404; os 6 cabeçalhos de segurança presentes) e build `PAGES=1` em cópia temporária (sem referências sem o prefixo BASE).
  - Capturas em 360/768/1440 no início do hero, no meio do zoom, no fim do zoom, logo após o hero e em 3 pontos do percurso.
  - LCP de ~130 ms (a foto do hero, que também aparece sem JS) e CLS 0.
  - Fluxos Playwright ok.
  - `npm audit --omit=dev`: 0.
