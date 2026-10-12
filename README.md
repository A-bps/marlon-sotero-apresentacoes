# Apresentações de empreendimentos · Marlon Sotero

Aplicação web (Next.js) em que o corretor **Marlon Sotero** apresenta empreendimentos e envia a cada cliente um link exclusivo com imagens, plantas, localização e áreas comuns. Cada página de empreendimento é um serviço vendido por imóvel; esta versão traz uma página modelo completa ("Empreendimento Exemplo").

Identidade visual extraída de <https://marlonsoterocorretor.com.br>: fundo claro `#F8FAFC`, azul-marinho `#12234A`, dourado `#CBA648` (decorativo; texto dourado usa `#8A6B22` para contraste AA), títulos em **Outfit** e textos em **Inter**.

## Rotas

| Rota | Para quem | O que mostra |
| --- | --- | --- |
| `/` | Marlon | Página inicial com os empreendimentos publicados |
| `/imovel/[slug]` | Marlon | Empreendimento com voltar e o botão "Compartilhar com cliente" |
| `/p/[slug]` | Cliente | Empreendimento sem a navegação do corretor, com "Quero saber mais" e "Falar com Marlon" (WhatsApp) |
| `POST /api/leads` | Formulário | Recebe o interesse do cliente e envia por e-mail |

Estados: `publicado` aparece normalmente, `pausado` mostra a página de indisponibilidade, e `rascunho` ou slug inexistente mostram um 404 amigável.

## Como rodar

```bash
npm install
cp .env.example .env.local   # ajuste os valores
npm run dev                  # http://localhost:3000
```

Verificações:

```bash
npm run typecheck   # tsc --noEmit
npm run lint
npm test            # vitest: validação e antiabuso dos leads
npm run build && npm start
npm run screenshots # com o servidor rodando: capturas 360/768/1440 em screenshots/
```

## Como adicionar um empreendimento

1. Crie a pasta `public/imoveis/<slug>/` e coloque as imagens (JPG/WebP, cerca de 1800 px no lado maior) e as plantas (SVG, PNG ou PDF).
2. Em `src/data/properties.ts`, copie o objeto `empreendimento-exemplo` e preencha:
   - `slug` (usado na URL), `nome`, `descricaoCurta`, `descricao` (parágrafos), endereço, `lat`/`lng`, `capa`.
   - `galeria`: cada mídia tem `categoria` (fachada, sala, cozinha, quarto, suite, sacada, piscina, academia, paisagismo, implantacao, outros) e `publico`. Mídias com `publico: false` nunca chegam à página.
   - `plantas`: `ativo` controla se aparece e `podeBaixar` controla o botão de download.
   - `amenities` e `pontos` (pontos de interesse) também têm `ativo`.
   - `narrativa` (opcional): cenas do percurso pelos ambientes (imagem fixa ao lado e frases curtas rolando), exibido logo após a ficha. Use fotos de ~2400 px de largura (JPEG ~q82) e desfoque placas de veículos antes de publicar.
   - `capa.pos` / `capa.foco` (opcionais): `object-position` da capa (hero e cards da página inicial, ex.: `"50% 38%"`) e `transform-origin` do zoom leve do hero (ex.: a entrada, `"55% 66%"`).
   - `tour` (opcional): lista de ambientes. Se ficar vazia, o item "Tour" não aparece no menu.
   - `exemplo: true` mostra o aviso "Apresentação modelo"; remova esse campo nos imóveis reais.
3. Defina `status: "publicado"` e `ordem` (posição na página inicial).
4. Remova o objeto `exemplo-pausado` quando não precisar mais da demonstração.

> Atenção: tudo o que está em `public/` pode ser acessado por URL. Não coloque material confidencial lá, mesmo marcado como não público.

O campo `modelo3d` está reservado. O componente `PropertyStage` (`src/components/PropertyPage.tsx`) tem o espaço marcado onde o visualizador 3D vai entrar, com a capa como fallback.

## Variáveis de ambiente

| Variável | Pública? | Uso |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | sim | Base do link do cliente e das imagens de pré-visualização. Se não estiver definida, o link usa `window.location.origin`. |
| `RESEND_API_KEY` | não | Chave da API do Resend para enviar os leads. |
| `LEAD_TO_EMAIL` | não | E-mail que recebe os leads. |
| `LEAD_FROM_EMAIL` | não | Remetente verificado no Resend (opcional). |

Sem `RESEND_API_KEY` e `LEAD_TO_EMAIL`, a API responde **503** e o formulário mantém os dados preenchidos.

## Deploy (Vercel)

1. Importe o repositório na Vercel (framework detectado: Next.js).
2. Configure as variáveis acima em *Settings → Environment Variables*.
3. Adicione o domínio. A Vercel emite o certificado TLS e redireciona HTTP para HTTPS automaticamente.
4. Depois de confirmar que tudo funciona em HTTPS, você pode cadastrar o domínio em <https://hstspreload.org>, já que o cabeçalho HSTS inclui `preload`.

Em outros provedores atrás de proxy, `src/proxy.ts` redireciona para HTTPS quando `x-forwarded-proto` é `http` (localhost fica de fora, porque o `next start` define esse cabeçalho mesmo sem proxy).

## Segurança

- **Cabeçalhos em todas as rotas:** CSP, `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()` e `X-Frame-Options: DENY`. O cabeçalho `X-Powered-By` está desligado.
- **CSP com nonce por requisição** (`src/proxy.ts`): `default-src 'self'`, `script-src 'self' 'nonce-…' 'strict-dynamic'`, `frame-src https://www.openstreetmap.org`, `img-src 'self' data: blob:`, `connect-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`. `style-src` precisa de `'unsafe-inline'` porque o `next/image` e o React emitem atributos `style=""` que nonces não cobrem. Os scripts continuam restritos ao nonce. Por causa do nonce, as páginas são renderizadas a cada requisição.
- **Dados públicos filtrados no servidor:** as páginas são Server Components e só recebem o resultado de `toPublic()`, sem mídias `publico: false` e sem itens com `ativo: false`.
- **`POST /api/leads`:** exige `Content-Type: application/json`, mesma origem (`Origin` comparado ao `Host`), corpo de até 8 KB, validação com zod (campos aparados, caracteres de controle removidos, tamanhos limitados, telefone BR, consentimento obrigatório), slug publicado, honeypot (`website`), tempo mínimo de preenchimento de 3 s (`elapsedMs`) e limite de 8 envios por IP a cada 10 min. Esse limite fica em memória e vale por instância; para algo mais forte, use Upstash ou Vercel KV.
- **Segredos:** só existem no servidor. A única variável pública é `NEXT_PUBLIC_SITE_URL`.
- Não há painel administrativo nem outros endpoints.

## API: `POST /api/leads`

Corpo JSON:

| Campo | Tipo | Regra |
| --- | --- | --- |
| `slug` | string | slug de um empreendimento publicado |
| `nome` | string | obrigatório, até 120 caracteres |
| `telefone` | string | obrigatório, telefone BR com DDD |
| `email` | string | opcional, e-mail válido |
| `mensagem` | string | opcional, até 1000 caracteres |
| `consentimento` | boolean | precisa ser `true` |
| `elapsedMs` | number | ms entre abrir o formulário e enviar (mínimo 3000) |
| `website` | string | honeypot, deve vir vazio |

Respostas: `200 {ok:true}`; `400 {ok:false,error,fields}`; `403` (origem diferente); `404` (empreendimento); `413`; `415`; `429`; `502` (falha no Resend); `503` (e-mail não configurado).

Como a API exige a mesma origem, chamadas de fora precisam enviar um `Origin` igual ao host.

```bash
curl -X POST https://SEU-DOMINIO/api/leads \
  -H "Content-Type: application/json" -H "Origin: https://SEU-DOMINIO" \
  -d '{"slug":"empreendimento-exemplo","nome":"Ana","telefone":"(17) 99999-9999","consentimento":true,"elapsedMs":5000}'
```

```js
await fetch("/api/leads", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ slug: "empreendimento-exemplo", nome: "Ana", telefone: "(17) 99999-9999", consentimento: true, elapsedMs: 5000 }),
}).then((r) => r.json());
```

```python
import requests
r = requests.post("https://SEU-DOMINIO/api/leads",
    headers={"Origin": "https://SEU-DOMINIO"},
    json={"slug": "empreendimento-exemplo", "nome": "Ana", "telefone": "(17) 99999-9999",
          "consentimento": True, "elapsedMs": 5000})
print(r.status_code, r.json())
```

## Estrutura

```
src/
  app/            layout, página inicial, /imovel/[slug], /p/[slug], 404, api/leads
  components/     brand (logo, rodapé), PropertyPage (página + PropertyStage),
                  interactive (modais, compartilhar, formulário, menu), modules (galeria, plantas, áreas comuns)
  data/           properties.ts: corretor e empreendimentos
  lib/            leads.ts (validação/antiabuso) + leads.test.ts
  proxy.ts        CSP com nonce e redirecionamento HTTPS
scripts/screenshots.mjs
```
