# Mecânica Gaúcho Diesel

Sistema web da Mecânica Gaúcho Diesel, oficina de caminhões em Ourinhos (SP). O sistema reúne o site institucional, o formulário de solicitação de atendimento (na oficina ou socorro na rodovia), o banco de dados e o painel do proprietário, onde as solicitações são recebidas, analisadas e acompanhadas.

Trabalho da AEX integrada de Engenharia de Software II e Programação para Internet.

## Integrantes

- Caio Nogueira
- Felipe Muraro
- Filipe Sudário
- José Neres
- Pedro Gomes

## Tecnologias

- Astro, para as páginas do site e do painel
- Tailwind CSS, para o estilo
- Cloudflare Workers, para executar as páginas dinâmicas
- Cloudflare D1, banco de dados SQLite da Cloudflare
- Wrangler, para executar o sistema e o banco no computador

## Como executar

É necessário ter o Node.js instalado. Não é preciso conta na Cloudflare, pois o Wrangler simula o D1 localmente.

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

## Rastreabilidade

Cada rota do sistema corresponde a um caso de uso e a uma história de usuário, descritos em `docs/01-requisitos-e-historias.md`.

| Rota | Arquivo | Caso de uso | História |
|---|---|---|---|
| `/` | `src/pages/index.astro` | UC01, UC02, UC03 | HU01, HU02, HU03, HU06 |
| `/solicitar` | `src/pages/solicitar/index.astro` | UC04, UC05 | HU04, HU05 |
| `/solicitar/enviada` | `src/pages/solicitar/enviada.astro` | UC04, UC05 | HU04, HU05 |
| `/painel/entrar` e `/painel/sair` | `src/pages/painel/entrar.astro` e `sair.ts` | UC06 | HU07 |
| `/painel` | `src/pages/painel/index.astro` | UC07 | HU08 |
| `/painel/[id]` | `src/pages/painel/[id].astro` | UC08 a UC12 | HU09, HU10, HU11 |

A tabela `solicitacao` está em `migrations/0001_solicitacao.sql`, as regras de negócio em `src/lib/solicitacao.ts`, o acesso ao banco em `src/lib/repositorio.ts` e a sessão do proprietário em `src/lib/sessao.ts` e `src/middleware.ts`.
