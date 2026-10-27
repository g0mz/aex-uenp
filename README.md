# Mecânica Gaúcho Diesel

Sistema web da Mecânica Gaúcho Diesel, oficina de caminhões em Ourinhos (SP). O site institucional, especificado e modelado na AEX de Engenharia de Software II (versão 1.0 da especificação), já está publicado. Esta etapa, da AEX de Programação para Internet, evolui a modelagem para a versão 2.0 e acrescenta ao site o formulário de solicitação de atendimento (na oficina ou socorro na rodovia), o banco de dados e o painel do proprietário, onde as solicitações são recebidas, analisadas e acompanhadas.

Trabalho da AEX integrada de Engenharia de Software II e Programação para Internet.

## Integrantes

- Caio Nogueira
- Felipe Muraro
- Filipe Sudário
- José Neres
- Pedro Gomes

O grupo desenvolveu o sistema em conjunto, em um único computador. Por isso os commits do repositório estão todos no nome de Pedro Gomes, e não refletem a participação dos cinco integrantes.

## Tecnologias

- HTML, CSS e JavaScript, nas páginas e nos formulários
- Astro, para as páginas do site e do painel, com os adaptadores `@astrojs/cloudflare` e `@astrojs/sitemap` e o `@astrojs/check` na verificação de tipos do build
- Tailwind CSS, para o estilo, com as fontes Roboto Slab e Roboto Condensed (Fontsource) e os logos das marcas do `simple-icons`
- Cloudflare Workers, para executar as páginas dinâmicas
- Cloudflare D1, banco de dados SQLite da Cloudflare
- Wrangler, para executar o sistema e o banco no computador
- TypeScript, para as regras de negócio, o acesso ao banco e a sessão do painel
- API de bots do Telegram, para os avisos ao proprietário e ao cliente
- Links do WhatsApp (`wa.me`) e do Google Maps, para contato e localização
- Node.js, com o executor de testes `node --test`
- Git e GitHub, para o controle de versão
- Astah UML, para os diagramas de casos de uso, atividades e classes da modelagem de Engenharia de Software II

## Como executar

É necessário ter o Node.js 22.23.4 ou mais recente e o npm instalados. Não é preciso conta na Cloudflare, pois o Wrangler simula o D1 localmente.

```bash
npm install
cp .dev.vars.example .dev.vars
npm run db:migrar
npm run dev
```

O site fica em `http://localhost:4321`, o formulário em `/solicitar` e o painel em `/painel`. A senha de teste do painel é `gaucho2026`, definida em `.dev.vars`.

Em alguns computadores com Windows o comando `npm run dev` não inicia. Nesse caso, gerar o build e executar com o Wrangler, que usa a porta 8787:

```bash
npm run build && npx wrangler dev
```

O site fica então em `http://localhost:8787`.

## Testes

```bash
npm test
```

Executa os testes das regras de negócio (validação da solicitação, protocolo, situações e sessão do painel). O comando equivale a `node --test "tests/*.test.ts"`.

## Avisos pelo Telegram

O proprietário recebe cada solicitação nova no Telegram, e o cliente pode receber as mudanças de situação do pedido. Os avisos são opcionais: sem os segredos abaixo, o sistema funciona normalmente e não envia nada.

1. No Telegram, abrir o @BotFather, enviar `/newbot` e seguir as instruções. Ele informa o token do bot e o nome de usuário do bot.
2. Definir os quatro segredos no Worker (em `.dev.vars` no computador, ou com `wrangler secret put` em produção):
   - `TELEGRAM_BOT_TOKEN`: token informado pelo BotFather;
   - `TELEGRAM_BOT_USUARIO`: nome de usuário do bot, sem o `@`;
   - `TELEGRAM_CHAT_PROPRIETARIO`: número do chat do proprietário;
   - `TELEGRAM_WEBHOOK_SEGREDO`: texto aleatório longo, usado para o Telegram provar que é o autor das chamadas.
3. Registrar o webhook do bot, uma única vez:
   ```bash
   curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<dominio>/telegram&secret_token=<SEGREDO>"
   ```
4. O proprietário abre o bot e envia `/id`. A resposta traz o número do chat, que vai em `TELEGRAM_CHAT_PROPRIETARIO`.

O cliente ativa os avisos pelo botão "Receber atualizações no Telegram" da página de confirmação. Em produção, a regra de limite de requisições da Cloudflare deve cobrir também o `POST` em `/acompanhar`, além de `/painel/entrar` e `/solicitar`.

## Rastreabilidade

Cada rota do sistema corresponde a um caso de uso e a uma história de usuário, descritos em `docs/01-requisitos-e-historias.md`.

| Rota | Arquivo | Caso de uso | História |
|---|---|---|---|
| `/` | `src/pages/index.astro` | UC01 a UC04 | HU01 a HU08 |
| `/solicitar` | `src/pages/solicitar/index.astro` | UC05, UC06 | HU09, HU10 |
| `/solicitar/enviada` | `src/pages/solicitar/enviada.astro` | UC05, UC06 | HU09, HU10 |
| `/painel/entrar` e `/painel/sair` | `src/pages/painel/entrar.astro` e `sair.ts` | UC07 | HU11 |
| `/painel` | `src/pages/painel/index.astro` | UC08 | HU12 |
| `/painel/[id]` | `src/pages/painel/[id].astro` | UC09 a UC13 | HU13, HU14, HU15 |
| `/acompanhar` | `src/pages/acompanhar.astro` | UC14 | HU16 |
| `/telegram` | `src/pages/telegram.ts` | UC15, UC16 | HU17, HU18 |

As mensagens do Telegram são montadas em `src/lib/notificador.ts`. A tabela `solicitacao` está em `migrations/0001_solicitacao.sql` e `migrations/0002_telegram.sql`, as regras de negócio em `src/lib/solicitacao.ts`, o acesso ao banco em `src/lib/repositorio.ts` e a sessão do proprietário em `src/lib/sessao.ts` e `src/middleware.ts`.
