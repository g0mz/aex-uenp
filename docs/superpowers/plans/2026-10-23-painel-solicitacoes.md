# Solicitação de atendimento e painel: plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refazer o histórico do `aex-uenp` como construção do zero, acrescentar ao site a solicitação de atendimento (UC04, UC05) e o painel do proprietário (UC06 a UC12) com banco D1, revisar a segurança pelo OWASP e publicar no domínio da oficina.

**Architecture:** Astro com saída estática nas páginas institucionais e `prerender = false` só em `/solicitar` e `/painel`. Cada tela dinâmica é um `.astro` que trata o `POST` de um formulário HTML, chama a classe `Solicitacao` (regras de negócio, sem dependências) e o `repositorio` (SQL no D1), e redireciona. A sessão é um cookie assinado com HMAC, verificado no middleware, que também aplica os cabeçalhos de segurança do painel.

**Tech Stack:** Astro 7.4, Tailwind 4, `@astrojs/cloudflare` 14 (gera um Cloudflare Worker com arquivos estáticos, e não um projeto do Pages), Cloudflare D1, Wrangler 4, Node 24 (`node --test` com remoção de tipos nativa), `curl` para o roteiro de segurança.

**Spec:** `docs/superpowers/specs/2026-10-22-painel-solicitacoes-design.md`

## Global Constraints

- Todo commit sai com o autor Pedro Gomes e **sem** linha `Co-Authored-By` nem rodapé do Claude (regra do usuário, que prevalece sobre o lembrete de atribuição).
- Mensagens de commit em português, no imperativo da 3ª pessoa e sem acento, no estilo do repositório ("Adiciona ...", "Corrige ...").
- Datas dos commits: as reais. Nunca usar `--date` nem `GIT_COMMITTER_DATE`.
- Textos visíveis em português formal, sem travessões e sem gírias. O site é apresentado como criado do zero.
- `CLAUDE.md` e `docs/superpowers/` ficam fora do histórico.
- Situações (valor gravado → rótulo): `nova` Nova, `em_analise` Em análise, `recusada` Recusada, `socorro_a_caminho` Socorro a caminho, `aguardando_caminhao` Aguardando caminhão, `em_servico` Em serviço, `concluida` Concluída, `cancelada` Cancelada.
- Tipos: `oficina`, `socorro`. Perfis: `autonomo` Caminhoneiro autônomo, `frota` Motorista de frota, `empresa` Representante de empresa.
- Protocolo: `GD-<ano>-<id com 6 dígitos>`, por exemplo `GD-2026-000123`.
- Binding do D1: `DB`; nome do banco: `gaucho-diesel`. Segredos: `PAINEL_SENHA`, `SESSAO_SEGREDO`.
- Tamanhos máximos (validados no servidor e no `maxlength`): `descricao` 2000; `nome`, `empresa`, `servico`, `rodovia`, `cidade`, `marca`, `modelo` 100; `telefone` 20; `placa` 10; `km` 10; `observacao` e `motivo` 1000.
- Passos que mexem fora deste repositório (force push, push no `mecanica-gaucho-diesel`, recursos na Cloudflare, domínio) só acontecem depois da confirmação explícita do usuário naquele momento.

---

## Estrutura de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `wrangler.jsonc` | nome do Worker e binding `DB` (o adapter completa `main` e `assets`) |
| `migrations/0001_solicitacao.sql` | tabela `solicitacao` com `CHECK` |
| `src/lib/solicitacao.ts` | enumerações, rótulos, `lerFormulario()`, `validar()`, `gerarProtocolo()`, `alterarSituacao()` (sem imports, testável no Node) |
| `src/lib/repositorio.ts` | `inserir`, `listar`, `buscar`, `atualizar`, `excluir` |
| `src/lib/sessao.ts` | `senhaConfere`, `criarSessao`, `sessaoValida` |
| `src/middleware.ts` | protege `/painel/*` e aplica os cabeçalhos de segurança |
| `src/layouts/PainelLayout.astro` | casca das telas do painel, com saída por `POST` |
| `src/pages/solicitar/index.astro`, `enviada.astro` | UC04, UC05 |
| `src/pages/painel/entrar.astro`, `sair.ts`, `index.astro`, `[id].astro` | UC06 a UC12 |
| `tests/solicitacao.test.ts`, `tests/sessao.test.ts` | regras de negócio e sessão |

---

### Task 1: Refazer o histórico do site como construção do zero

**Files:** todos os arquivos já versionados em `main`, recriados em uma branch órfã `historico`.

**Interfaces:**
- Consumes: o conteúdo atual de `main` (igual ao site em `../mecanica-gaucho-diesel`, exceto `src/assets` e `design/`, que não entram).
- Produces: branch `historico` com o site institucional completo e buildável. As Tasks 2 a 11 continuam nela.

- [ ] **Step 1: Guardar uma cópia de segurança e criar a branch órfã sem perder os arquivos locais**

```bash
git status --short            # precisa estar vazio
git branch backup-main main
printf 'CLAUDE.md\ndocs/superpowers/\nstrix_runs/\n' >> .git/info/exclude
git switch --orphan historico # remove os arquivos versionados da pasta
git restore --source=backup-main --worktree -- CLAUDE.md docs/superpowers
```

Não usar `git clean -x`, que ignora o `info/exclude` e apagaria o `CLAUDE.md`, o `.mcp.json` e o `.dev.vars`. Cada commit seguinte traz os arquivos do grupo com `git checkout backup-main -- <caminhos>`.

- [ ] **Step 2: Commit "Cria projeto Astro com Tailwind"**

Caminhos: `package.json package-lock.json astro.config.mjs tsconfig.json .gitignore .env.example src/env.d.ts src/styles/global.css public/favicon.png public/favicon-32.png public/favicon-64.png public/favicon.svg public/apple-touch-icon.png`. Criar `src/pages/index.astro` mínimo:

```astro
---
import '../styles/global.css';
---
<html lang="pt-BR"><head><meta charset="UTF-8" /><title>Mecânica Gaúcho Diesel</title></head><body><main id="conteudo"></main></body></html>
```

Run: `npm install && npm run build` → Expected: build sem erros. Depois `git add -A && git status --short` (conferir que `CLAUDE.md` e `docs/superpowers` não aparecem) e `git commit -m "Cria projeto Astro com Tailwind"`.

- [ ] **Step 3: Commit "Adiciona requisitos e historias de usuario"**: `docs/01-requisitos-e-historias.md docs/especificacoes`.
- [ ] **Step 4: Commit "Adiciona diagrama de casos de uso"**: `docs/uml/casos-de-uso.asta`.
- [ ] **Step 5: Commit "Adiciona diagramas de atividades"**: `docs/uml/atividades.asta`.
- [ ] **Step 6: Commit "Adiciona diagrama de classes"**: `docs/uml/classes.asta`.
- [ ] **Step 7: Commit "Adiciona relatorio da AEX de Engenharia de Software II"**: `docs/relatorio-aex-engenharia-software-2.pdf`.
- [ ] **Step 8: Commit "Adiciona dados da oficina"**: `src/data/`, `public/images/brand`, `public/images/README.md`.
- [ ] **Step 9: Commit "Adiciona layout base, cabecalho e rodape"**: `src/layouts/BaseLayout.astro src/components/BrandMark.astro src/components/Header.astro src/components/Footer.astro src/components/SectionTitle.astro`. O `index.astro` passa a usar `BaseLayout`, `Header` e `Footer` (a versão final de `backup-main`, sem as seções e sem o `structuredData`).
- [ ] **Steps 10 a 18: um commit por seção.** Cada commit acrescenta o componente, as imagens dele e a linha correspondente no `index.astro`, na mesma ordem do arquivo final:
  - "Adiciona secao inicial": `Hero.astro`, `public/images/hero`
  - "Adiciona secao de servicos": `ServicesSection.astro`, `public/images/servicos`
  - "Adiciona galeria de servicos": `PortfolioSection.astro`, `public/images/portfolio`
  - "Adiciona secao sobre a oficina": `AboutSection.astro`, `public/images/oficina`
  - "Adiciona secao de clientes": `ClientsSection.astro`, `public/images/clientes public/images/logo`
  - "Adiciona marcas atendidas": `BrandsSection.astro`
  - "Adiciona localizacao com mapa": `LocationSection.astro`
  - "Adiciona secao de contato": `ContactSection.astro`
  - "Adiciona botao do WhatsApp": `WhatsAppButton.astro`

  Antes de cada commit, `npm run build` precisa terminar sem erros.
- [ ] **Step 19: Commit "Adiciona dados estruturados, sitemap e robots"**: a versão final de `src/pages/index.astro` (com `structuredData`) e `src/pages/robots.txt.ts`.
- [ ] **Step 20: Conferir que o código bate com o original**

Run: `git diff backup-main historico --stat -- . ':!CLAUDE.md' ':!docs/superpowers' ':!README.md'`
Expected: nenhuma diferença.

---

### Task 2: Adapter da Cloudflare e banco D1

**Files:**
- Modify: `astro.config.mjs`, `package.json`, `.gitignore`, `src/env.d.ts`, `src/pages/robots.txt.ts`
- Create: `wrangler.jsonc`, `migrations/0001_solicitacao.sql`, `.dev.vars.example`

**Interfaces:**
- Produces: `import { env } from 'cloudflare:workers'` com `env.DB: D1Database`, `env.PAINEL_SENHA: string`, `env.SESSAO_SEGREDO: string`; scripts `npm run db:migrar` e `npm test`.

- [ ] **Step 1: Instalar o adapter e o Wrangler**

Run: `npx astro add cloudflare --yes && npm install -D wrangler @cloudflare/workers-types`
Abrir `node_modules/@astrojs/cloudflare/README.md` e conferir duas coisas: (1) os bindings são lidos com `import { env } from 'cloudflare:workers'`; (2) o adapter completa sozinho `main` e `assets` no `wrangler.jsonc`. Se a versão instalada for diferente, ajustar só a linha de import em `repositorio.ts`, `middleware.ts` e `entrar.astro`.

- [ ] **Step 2: `astro.config.mjs`** (mantém `output: 'static'`; as rotas dinâmicas usam `prerender = false`; `checkOrigin` já é o padrão, mas fica explícito porque protege os POSTs)

```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  adapter: cloudflare(),
  site: 'https://mecanicagauchodiesel.com.br',
  security: { checkOrigin: true },
  integrations: [sitemap({ filter: (page) => !page.includes('/painel') && !page.includes('/solicitar/enviada') })],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 3: `wrangler.jsonc`**

```jsonc
{
  "name": "mecanica-gaucho-diesel",
  "compatibility_date": "2026-10-01",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "gaucho-diesel",
      "migrations_dir": "migrations"
    }
  ]
}
```

O `database_id` de produção entra na Task 11.

- [ ] **Step 4: `migrations/0001_solicitacao.sql`**

```sql
CREATE TABLE solicitacao (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  protocolo TEXT UNIQUE,
  tipo TEXT NOT NULL CHECK (tipo IN ('oficina', 'socorro')),
  perfil TEXT NOT NULL CHECK (perfil IN ('autonomo', 'frota', 'empresa')),
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  empresa TEXT,
  marca TEXT,
  modelo TEXT,
  placa TEXT,
  servico TEXT,
  descricao TEXT NOT NULL,
  rodovia TEXT,
  km TEXT,
  cidade TEXT,
  situacao TEXT NOT NULL DEFAULT 'nova' CHECK (situacao IN ('nova', 'em_analise', 'recusada', 'socorro_a_caminho', 'aguardando_caminhao', 'em_servico', 'concluida', 'cancelada')),
  observacao TEXT,
  motivo_recusa TEXT,
  criada_em TEXT NOT NULL,
  atualizada_em TEXT NOT NULL,
  CHECK (tipo = 'oficina' OR (rodovia IS NOT NULL AND km IS NOT NULL AND cidade IS NOT NULL)),
  CHECK (situacao <> 'recusada' OR motivo_recusa IS NOT NULL)
);

CREATE INDEX idx_solicitacao_criada_em ON solicitacao (criada_em DESC);
```

- [ ] **Step 5: Segredos locais, scripts e robots**

`.dev.vars.example`:

```
PAINEL_SENHA=gaucho2026
SESSAO_SEGREDO=troque-este-valor-por-um-texto-longo
```

Acrescentar `.dev.vars` ao `.gitignore`. No `package.json`, em `scripts`:

```json
"db:migrar": "wrangler d1 migrations apply gaucho-diesel --local",
"test": "node --test tests/"
```

No `src/pages/robots.txt.ts`, trocar a linha das regras por:

```ts
  const lines = ['User-agent: *', 'Allow: /', 'Disallow: /painel'];
```

- [ ] **Step 6: Tipos dos bindings**, em `src/env.d.ts`, abaixo do conteúdo atual:

```ts
declare module 'cloudflare:workers' {
  export const env: {
    DB: import('@cloudflare/workers-types').D1Database;
    PAINEL_SENHA: string;
    SESSAO_SEGREDO: string;
  };
}
```

Se o `astro add` tiver gerado um `worker-configuration.d.ts` com `npx wrangler types`, usar esse arquivo no lugar da declaração manual. Os dois juntos dão conflito de tipo.

- [ ] **Step 7: Aplicar a migração e fazer o build**

Run: `cp .dev.vars.example .dev.vars && npm run db:migrar && npm run build`
Expected: a migração `0001_solicitacao.sql` é aplicada, o build termina sem erros e o `dist/` contém o Worker e os arquivos estáticos.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "Configura Cloudflare Workers e banco D1 com a tabela solicitacao"
```

---

### Task 3: Classe Solicitacao e regras de negócio

**Files:**
- Create: `src/lib/solicitacao.ts`, `tests/solicitacao.test.ts`
- Modify: `tsconfig.json` (acrescentar `"allowImportingTsExtensions": true` em `compilerOptions`, porque os testes importam o arquivo `.ts` diretamente)

**Interfaces:**
- Produces:
  - `type Tipo = 'oficina' | 'socorro'`, `type Perfil`, `type Situacao`
  - `TIPOS`, `PERFIS`, `SITUACOES`: objetos valor → rótulo
  - `LIMITES: Record<keyof DadosSolicitacao, number>`
  - `type DadosSolicitacao = Record<'tipo' | 'perfil' | 'nome' | 'telefone' | 'empresa' | 'marca' | 'modelo' | 'placa' | 'servico' | 'descricao' | 'rodovia' | 'km' | 'cidade', string>`
  - `lerFormulario(form: FormData): DadosSolicitacao`
  - `validar(d: DadosSolicitacao): Record<string, string>` (campo → mensagem; vazio = válido)
  - `gerarProtocolo(id: number, ano: number): string`
  - `alterarSituacao(nova: string, motivo: string, observacao?: string): { erro?: string }`

- [ ] **Step 1: Escrever o teste que falha**, em `tests/solicitacao.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validar, gerarProtocolo, alterarSituacao, lerFormulario, type DadosSolicitacao } from '../src/lib/solicitacao.ts';

const base: DadosSolicitacao = {
  tipo: 'oficina', perfil: 'autonomo', nome: 'João', telefone: '14999990000', empresa: '',
  marca: 'Scania', modelo: 'R450', placa: 'ABC1D23', servico: 'Embreagem', descricao: 'Embreagem patinando',
  rodovia: '', km: '', cidade: '',
};

test('RN04: oficina com nome, telefone e descrição é válida', () => {
  assert.deepEqual(validar(base), {});
});

test('RN04: exige nome, telefone e descrição', () => {
  const erros = validar({ ...base, nome: ' ', telefone: '', descricao: '' });
  assert.deepEqual(Object.keys(erros).sort(), ['descricao', 'nome', 'telefone']);
});

test('RN04: socorro exige rodovia, km e cidade', () => {
  const erros = validar({ ...base, tipo: 'socorro' });
  assert.deepEqual(Object.keys(erros).sort(), ['cidade', 'km', 'rodovia']);
  assert.deepEqual(validar({ ...base, tipo: 'socorro', rodovia: 'SP-270', km: '377', cidade: 'Ourinhos' }), {});
});

test('rejeita tipo e perfil fora da lista', () => {
  const erros = validar({ ...base, tipo: 'x', perfil: 'toString' });
  assert.ok(erros.tipo && erros.perfil);
});

test('rejeita campo acima do tamanho máximo', () => {
  assert.ok(validar({ ...base, descricao: 'a'.repeat(2001) }).descricao);
  assert.ok(validar({ ...base, nome: 'a'.repeat(101) }).nome);
  assert.deepEqual(validar({ ...base, descricao: 'a'.repeat(2000) }), {});
});

test('lerFormulario ignora campos extras e apara espaços', () => {
  const form = new FormData();
  form.set('nome', '  Ana  ');
  form.set('situacao', 'concluida');
  const d = lerFormulario(form);
  assert.equal(d.nome, 'Ana');
  assert.equal('situacao' in d, false);
});

test('RF05: protocolo com ano e id de seis dígitos', () => {
  assert.equal(gerarProtocolo(123, 2026), 'GD-2026-000123');
});

test('RN06: recusa exige motivo', () => {
  assert.ok(alterarSituacao('recusada', '  ').erro);
  assert.deepEqual(alterarSituacao('recusada', 'Fora do escopo'), {});
  assert.deepEqual(alterarSituacao('em_analise', ''), {});
  assert.ok(alterarSituacao('inexistente', '').erro);
  assert.ok(alterarSituacao('constructor', '').erro);
  assert.ok(alterarSituacao('em_analise', '', 'a'.repeat(1001)).erro);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test` → Expected: FAIL, "Cannot find module .../src/lib/solicitacao.ts".

- [ ] **Step 3: Implementar `src/lib/solicitacao.ts`**

Os testes com `toString` e `constructor` existem porque `'toString' in {}` é verdadeiro. Por isso a checagem usa `Object.hasOwn`.

```ts
// Classe Solicitacao do diagrama de classes: enumerações e regras de negócio (RN04, RF05, RN06).

export const TIPOS = { oficina: 'Na oficina', socorro: 'Socorro na rodovia' } as const;
export const PERFIS = {
  autonomo: 'Caminhoneiro autônomo',
  frota: 'Motorista de frota',
  empresa: 'Representante de empresa',
} as const;
export const SITUACOES = {
  nova: 'Nova',
  em_analise: 'Em análise',
  recusada: 'Recusada',
  socorro_a_caminho: 'Socorro a caminho',
  aguardando_caminhao: 'Aguardando caminhão',
  em_servico: 'Em serviço',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
} as const;

export type Tipo = keyof typeof TIPOS;
export type Perfil = keyof typeof PERFIS;
export type Situacao = keyof typeof SITUACOES;

export const LIMITES = {
  tipo: 10, perfil: 10, nome: 100, telefone: 20, empresa: 100, marca: 100, modelo: 100, placa: 10,
  servico: 100, descricao: 2000, rodovia: 100, km: 10, cidade: 100,
} as const;
export const LIMITE_ANOTACAO = 1000;

export type DadosSolicitacao = Record<keyof typeof LIMITES, string>;

const pertence = (lista: object, valor: string) => Object.hasOwn(lista, valor);

export function lerFormulario(form: FormData): DadosSolicitacao {
  return Object.fromEntries(
    Object.keys(LIMITES).map((c) => [c, String(form.get(c) ?? '').trim()]),
  ) as DadosSolicitacao;
}

// RN04: nome, telefone e descrição sempre; rodovia, km e cidade no socorro.
export function validar(d: DadosSolicitacao): Record<string, string> {
  const erros: Record<string, string> = {};
  if (!pertence(TIPOS, d.tipo)) erros.tipo = 'Escolha o tipo de atendimento.';
  if (!pertence(PERFIS, d.perfil)) erros.perfil = 'Escolha o seu perfil.';
  if (!d.nome.trim()) erros.nome = 'Informe o seu nome.';
  if (!d.telefone.trim()) erros.telefone = 'Informe um telefone para contato.';
  if (!d.descricao.trim()) erros.descricao = 'Descreva o problema do caminhão.';
  if (d.tipo === 'socorro') {
    if (!d.rodovia.trim()) erros.rodovia = 'Informe a rodovia.';
    if (!d.km.trim()) erros.km = 'Informe o km.';
    if (!d.cidade.trim()) erros.cidade = 'Informe a cidade mais próxima.';
  }
  for (const [campo, limite] of Object.entries(LIMITES)) {
    if (d[campo as keyof DadosSolicitacao].length > limite) erros[campo] ??= `Use no máximo ${limite} caracteres.`;
  }
  return erros;
}

// RF05
export function gerarProtocolo(id: number, ano: number): string {
  return `GD-${ano}-${String(id).padStart(6, '0')}`;
}

// RN06: a recusa só é aceita com motivo.
export function alterarSituacao(nova: string, motivo: string, observacao = ''): { erro?: string } {
  if (!pertence(SITUACOES, nova)) return { erro: 'Situação inválida.' };
  if (nova === 'recusada' && !motivo.trim()) return { erro: 'Informe o motivo da recusa.' };
  if (motivo.length > LIMITE_ANOTACAO || observacao.length > LIMITE_ANOTACAO) {
    return { erro: `Use no máximo ${LIMITE_ANOTACAO} caracteres no motivo e na observação.` };
  }
  return {};
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test` → Expected: 8 testes passando.

- [ ] **Step 5: Commit**

```bash
git add src/lib/solicitacao.ts tests/solicitacao.test.ts tsconfig.json
git commit -m "Adiciona classe Solicitacao com as regras de negocio"
```

---

### Task 4: Repositório de solicitações

**Files:**
- Create: `src/lib/repositorio.ts`

**Interfaces:**
- Consumes: `env.DB` (Task 2); `DadosSolicitacao`, `gerarProtocolo`, `SITUACOES`, `TIPOS` (Task 3).
- Produces:
  - `type Registro = Omit<DadosSolicitacao, 'empresa' | 'marca' | 'modelo' | 'placa' | 'servico' | 'rodovia' | 'km' | 'cidade'> & { empresa, marca, modelo, placa, servico, rodovia, km, cidade: string | null; id: number; protocolo: string | null; situacao: Situacao; observacao: string | null; motivo_recusa: string | null; criada_em: string; atualizada_em: string }`
  - `inserir(d: DadosSolicitacao): Promise<string>` (devolve o protocolo)
  - `listar(filtro: { situacao?: string; tipo?: string }): Promise<Registro[]>`
  - `buscar(id: number): Promise<Registro | null>`
  - `atualizar(id: number, situacao: string, observacao: string, motivo: string): Promise<void>`
  - `excluir(id: number): Promise<void>`

- [ ] **Step 1: Implementar**

```ts
// SolicitacaoRepositorio do diagrama de classes: consultas SQL no D1, sempre com parâmetros.
import { env } from 'cloudflare:workers';
import { gerarProtocolo, SITUACOES, TIPOS, type DadosSolicitacao, type Situacao } from './solicitacao';

type Opcionais = 'empresa' | 'marca' | 'modelo' | 'placa' | 'servico' | 'rodovia' | 'km' | 'cidade';

export type Registro = Omit<DadosSolicitacao, Opcionais> & Record<Opcionais, string | null> & {
  id: number;
  protocolo: string | null;
  situacao: Situacao;
  observacao: string | null;
  motivo_recusa: string | null;
  criada_em: string;
  atualizada_em: string;
};

const vazioParaNulo = (v: string) => (v.trim() ? v.trim() : null);

export async function inserir(d: DadosSolicitacao): Promise<string> {
  const agora = new Date().toISOString();
  const socorro = d.tipo === 'socorro';
  const linha = await env.DB.prepare(
    `INSERT INTO solicitacao (tipo, perfil, nome, telefone, empresa, marca, modelo, placa, servico, descricao, rodovia, km, cidade, criada_em, atualizada_em)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
  ).bind(
    d.tipo, d.perfil, d.nome, d.telefone, vazioParaNulo(d.empresa), vazioParaNulo(d.marca), vazioParaNulo(d.modelo),
    vazioParaNulo(d.placa.toUpperCase()), vazioParaNulo(d.servico), d.descricao,
    socorro ? d.rodovia : null, socorro ? d.km : null, socorro ? d.cidade : null, agora, agora,
  ).first<{ id: number }>();
  if (!linha) throw new Error('Falha ao gravar a solicitação');
  const protocolo = gerarProtocolo(linha.id, new Date(agora).getUTCFullYear());
  await env.DB.prepare('UPDATE solicitacao SET protocolo = ? WHERE id = ?').bind(protocolo, linha.id).run();
  return protocolo;
}

export async function listar(filtro: { situacao?: string; tipo?: string }): Promise<Registro[]> {
  const condicoes: string[] = [];
  const valores: string[] = [];
  if (filtro.situacao && Object.hasOwn(SITUACOES, filtro.situacao)) { condicoes.push('situacao = ?'); valores.push(filtro.situacao); }
  if (filtro.tipo && Object.hasOwn(TIPOS, filtro.tipo)) { condicoes.push('tipo = ?'); valores.push(filtro.tipo); }
  const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';
  // ponytail: sem paginação; acrescentar LIMIT/OFFSET quando a lista passar de algumas centenas
  const { results } = await env.DB.prepare(`SELECT * FROM solicitacao ${where} ORDER BY criada_em DESC`).bind(...valores).all<Registro>();
  return results;
}

export async function buscar(id: number): Promise<Registro | null> {
  return env.DB.prepare('SELECT * FROM solicitacao WHERE id = ?').bind(id).first<Registro>();
}

export async function atualizar(id: number, situacao: string, observacao: string, motivo: string): Promise<void> {
  await env.DB.prepare(
    'UPDATE solicitacao SET situacao = ?, observacao = ?, motivo_recusa = ?, atualizada_em = ? WHERE id = ?',
  ).bind(situacao, vazioParaNulo(observacao), situacao === 'recusada' ? motivo.trim() : null, new Date().toISOString(), id).run();
}

export async function excluir(id: number): Promise<void> {
  await env.DB.prepare('DELETE FROM solicitacao WHERE id = ?').bind(id).run();
}
```

As condições do `WHERE` só levam textos fixos. Os valores dos filtros sempre entram por `bind`.

- [ ] **Step 2: Conferir os tipos**

Run: `npm run check` → Expected: 0 erros. O repositório é testado no navegador nas Tasks 5, 7 e 8, porque depende do D1.

- [ ] **Step 3: Commit**

```bash
git add src/lib/repositorio.ts && git commit -m "Adiciona repositorio de solicitacoes"
```

---

### Task 5: Formulário de solicitação e protocolo (UC04, UC05)

**Files:**
- Create: `src/pages/solicitar/index.astro`, `src/pages/solicitar/enviada.astro`
- Modify: `src/components/Header.astro` (os dois links "Solicitar atendimento" passam de `whatsappUrl` para `/solicitar`, sem `target` e sem `rel`), `src/layouts/BaseLayout.astro` (prop opcional `noindex`), `src/styles/global.css`

**Interfaces:**
- Consumes: `lerFormulario`, `validar`, `TIPOS`, `PERFIS`, `LIMITES` (Task 3); `inserir` (Task 4); `services` de `src/data/services.ts`; `whatsappUrl` de `src/data/company.ts`; `BaseLayout`, `Header`, `Footer`.

- [ ] **Step 1: Classes de formulário**, no fim de `src/styles/global.css`:

```css
.campo { display: grid; gap: 0.35rem; font-weight: 700; }
.campo input, .campo select, .campo textarea { min-height: 2.75rem; border: 2px solid var(--color-steel); background: white; padding: 0.7rem 0.8rem; font-weight: 400; }
.campo [aria-invalid="true"] { border-color: #b42318; }
.erro { color: #b42318; font-size: 0.875rem; font-weight: 700; }
```

- [ ] **Step 2: `noindex` no `BaseLayout`.** Acrescentar `noindex?: boolean` à interface `Props`, desestruturar e incluir no `<head>`:

```astro
{noindex && <meta name="robots" content="noindex" />}
```

- [ ] **Step 3: `src/pages/solicitar/index.astro`**

```astro
---
// UC04 Solicitar atendimento, com a extensão UC05 Pedir socorro na rodovia.
import BaseLayout from '../../layouts/BaseLayout.astro';
import Header from '../../components/Header.astro';
import Footer from '../../components/Footer.astro';
import { lerFormulario, validar, LIMITES, TIPOS, PERFIS, type DadosSolicitacao } from '../../lib/solicitacao';
import { inserir } from '../../lib/repositorio';
import { services } from '../../data/services';

export const prerender = false;

let dados = lerFormulario(new FormData());
dados.tipo = Astro.url.searchParams.get('tipo') === 'socorro' ? 'socorro' : 'oficina';
let erros: Record<string, string> = {};
let falhaBanco = false;

if (Astro.request.method === 'POST') {
  dados = lerFormulario(await Astro.request.formData());
  erros = validar(dados);
  if (Object.keys(erros).length === 0) {
    try {
      const protocolo = await inserir(dados);
      return Astro.redirect(`/solicitar/enviada?p=${protocolo}&tipo=${dados.tipo}`, 303);
    } catch {
      falhaBanco = true;
    }
  }
}

// Atributos comuns de input, select e textarea; o value fica de fora porque o textarea não o aceita.
const campo = (nome: keyof DadosSolicitacao) => ({
  id: nome, name: nome, maxlength: LIMITES[nome],
  'aria-invalid': erros[nome] ? 'true' : undefined,
  'aria-describedby': erros[nome] ? `${nome}-erro` : undefined,
});
const temErros = Object.keys(erros).length > 0;
---

<BaseLayout title="Solicitar atendimento | Mecânica Gaúcho Diesel" description="Peça atendimento na oficina ou socorro na rodovia para o seu caminhão.">
  <Header />
  <main id="conteudo" class="container-site max-w-3xl py-12">
    <h1 class="display-type text-4xl">Solicitar atendimento</h1>
    <p class="mt-4">Descreva o problema e os dados do caminhão. O orçamento é feito após o diagnóstico na oficina.</p>

    {falhaBanco && <p class="erro mt-6" role="alert">Não foi possível salvar, tente novamente.</p>}
    {temErros && <p class="erro mt-6" role="alert" tabindex="-1" data-resumo-erros>Confira os campos destacados.</p>}

    <form method="post" class="mt-8 grid gap-5" novalidate>
      <fieldset class="grid gap-2">
        <legend class="font-bold">Tipo de atendimento</legend>
        {Object.entries(TIPOS).map(([valor, rotulo]) => (
          <label class="flex min-h-11 items-center gap-2"><input type="radio" name="tipo" value={valor} checked={dados.tipo === valor} required /> {rotulo}</label>
        ))}
        {erros.tipo && <p class="erro">{erros.tipo}</p>}
      </fieldset>

      <fieldset class="grid gap-4 sm:grid-cols-3" data-socorro hidden={dados.tipo !== 'socorro'}>
        <legend class="font-bold">Onde o caminhão está</legend>
        <label class="campo">Rodovia <input {...campo('rodovia')} value={dados.rodovia} data-obrigatorio-socorro /></label>
        <label class="campo">Km <input {...campo('km')} value={dados.km} inputmode="numeric" data-obrigatorio-socorro /></label>
        <label class="campo">Cidade <input {...campo('cidade')} value={dados.cidade} data-obrigatorio-socorro /></label>
        {(['rodovia', 'km', 'cidade'] as const).map((c) => erros[c] && <p id={`${c}-erro`} class="erro">{erros[c]}</p>)}
      </fieldset>

      <label class="campo">Perfil
        <select {...campo('perfil')} required>
          {Object.entries(PERFIS).map(([valor, rotulo]) => <option value={valor} selected={dados.perfil === valor}>{rotulo}</option>)}
        </select>
      </label>
      <label class="campo">Nome <input {...campo('nome')} value={dados.nome} autocomplete="name" required />{erros.nome && <span id="nome-erro" class="erro">{erros.nome}</span>}</label>
      <label class="campo">Telefone (WhatsApp) <input {...campo('telefone')} value={dados.telefone} type="tel" autocomplete="tel" required />{erros.telefone && <span id="telefone-erro" class="erro">{erros.telefone}</span>}</label>
      <label class="campo">Empresa (opcional) <input {...campo('empresa')} value={dados.empresa} autocomplete="organization" /></label>
      <div class="grid gap-4 sm:grid-cols-3">
        <label class="campo">Marca <input {...campo('marca')} value={dados.marca} /></label>
        <label class="campo">Modelo <input {...campo('modelo')} value={dados.modelo} /></label>
        <label class="campo">Placa <input {...campo('placa')} value={dados.placa} autocapitalize="characters" /></label>
      </div>
      <label class="campo">Serviço de interesse
        <select {...campo('servico')}>
          <option value="">Não sei informar</option>
          {services.map((s) => <option selected={dados.servico === s.title}>{s.title}</option>)}
        </select>
      </label>
      <label class="campo">Descrição do problema <textarea {...campo('descricao')} rows="5" required>{dados.descricao}</textarea>{erros.descricao && <span id="descricao-erro" class="erro">{erros.descricao}</span>}</label>

      <button type="submit" class="button-primary justify-self-start">Enviar solicitação</button>
    </form>
  </main>
  <Footer />
</BaseLayout>

<script>
  // UC05: a localização só aparece e só é obrigatória no socorro.
  const bloco = document.querySelector<HTMLFieldSetElement>('[data-socorro]')!;
  const atualizar = () => {
    const socorro = document.querySelector<HTMLInputElement>('input[name="tipo"]:checked')?.value === 'socorro';
    bloco.hidden = !socorro;
    bloco.querySelectorAll<HTMLInputElement>('[data-obrigatorio-socorro]').forEach((i) => (i.required = socorro));
  };
  document.querySelectorAll('input[name="tipo"]').forEach((r) => r.addEventListener('change', atualizar));
  atualizar();
  // Leva o foco ao resumo de erros para o leitor de tela anunciar.
  document.querySelector<HTMLElement>('[data-resumo-erros]')?.focus();
</script>
```

- [ ] **Step 4: `src/pages/solicitar/enviada.astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import Header from '../../components/Header.astro';
import Footer from '../../components/Footer.astro';
import { whatsappUrl } from '../../data/company';

export const prerender = false;

const protocolo = Astro.url.searchParams.get('p') ?? '';
if (!/^GD-\d{4}-\d{6}$/.test(protocolo)) return Astro.redirect('/solicitar');
const socorro = Astro.url.searchParams.get('tipo') === 'socorro';
---

<BaseLayout title="Solicitação enviada | Mecânica Gaúcho Diesel" description="Confirmação da solicitação de atendimento." noindex>
  <Header />
  <main id="conteudo" class="container-site max-w-3xl py-12">
    <h1 class="display-type text-4xl">Solicitação enviada</h1>
    <p class="mt-6 text-lg">Número do protocolo: <strong>{protocolo}</strong></p>
    <p class="mt-4">A oficina vai analisar o pedido e entrar em contato pelo telefone informado. O orçamento é feito após o diagnóstico na oficina.</p>
    {socorro && (
      <p class="mt-4">O socorro na rodovia depende do alcance e da disponibilidade do mecânico. Em caso urgente, chame a oficina no <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" class="font-bold underline">WhatsApp</a>.</p>
    )}
    <a href="/" class="button-primary mt-8">Voltar ao site</a>
  </main>
  <Footer />
</BaseLayout>
```

A página só mostra o protocolo que veio na URL e não lê o banco, então não expõe dados de outras solicitações.

- [ ] **Step 5: Testar no navegador**

Run: `npm run dev`. Em `http://localhost:4321/solicitar`:
1. Enviar o formulário vazio: a página volta com "Confira os campos destacados", o foco vai para essa mensagem, e nada é gravado.
2. Escolher socorro: aparecem rodovia, km e cidade. Enviar sem eles: aparecem os três erros, e os dados digitados continuam nos campos.
3. Enviar a solicitação de oficina completa: a confirmação mostra `GD-2026-000001` e o aviso sobre o orçamento.
4. Enviar a solicitação de socorro completa: a confirmação mostra o aviso da RN03 com o link do WhatsApp.
5. Rodar `npx wrangler d1 execute gaucho-diesel --local --command "SELECT protocolo, tipo, situacao FROM solicitacao"`: duas linhas com situação `nova`.
6. Com 375px de largura: sem rolagem horizontal, e os campos e o botão podem ser tocados com o polegar (RNF01).

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "Adiciona formulario de solicitacao de atendimento e socorro"
```

---

### Task 6: Entrada no painel, sessão e cabeçalhos de segurança (UC06)

**Files:**
- Create: `src/lib/sessao.ts`, `tests/sessao.test.ts`, `src/middleware.ts`, `src/layouts/PainelLayout.astro`, `src/pages/painel/entrar.astro`, `src/pages/painel/sair.ts`

**Interfaces:**
- Produces:
  - `COOKIE_SESSAO = 'sessao_painel'`, `DURACAO_SESSAO_S = 43200`
  - `senhaConfere(digitada: string, correta: string): Promise<boolean>`
  - `criarSessao(segredo: string, agoraMs?: number): Promise<string>`
  - `sessaoValida(valor: string | undefined, segredo: string, agoraMs?: number): Promise<boolean>`
  - `PainelLayout` com a prop `title: string` e o botão "Sair".

- [ ] **Step 1: Teste que falha**, `tests/sessao.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { senhaConfere, criarSessao, sessaoValida } from '../src/lib/sessao.ts';

test('compara a senha', async () => {
  assert.equal(await senhaConfere('gaucho2026', 'gaucho2026'), true);
  assert.equal(await senhaConfere('errada', 'gaucho2026'), false);
  assert.equal(await senhaConfere('', ''), false);
});

test('aceita a sessão assinada dentro do prazo', async () => {
  const valor = await criarSessao('segredo', 1_000);
  assert.equal(await sessaoValida(valor, 'segredo', 2_000), true);
});

test('recusa sessão vencida, adulterada, malformada ou com outro segredo', async () => {
  const valor = await criarSessao('segredo', 0);
  assert.equal(await sessaoValida(valor, 'segredo', 13 * 3600 * 1000), false);
  assert.equal(await sessaoValida(valor.replace(/^\d+/, '9999999999999'), 'segredo', 0), false);
  assert.equal(await sessaoValida(valor, 'outro', 0), false);
  assert.equal(await sessaoValida(undefined, 'segredo', 0), false);
  assert.equal(await sessaoValida('abc.def', 'segredo', 0), false);
  assert.equal(await sessaoValida(valor, '', 0), false);
});
```

- [ ] **Step 2: Rodar e ver falhar**: `npm test` → FAIL, módulo `sessao.ts` não encontrado.

- [ ] **Step 3: `src/lib/sessao.ts`**

```ts
// Proprietario do diagrama de classes: a senha fica em segredo do servidor (RNF05), e a sessão é um cookie assinado.

export const COOKIE_SESSAO = 'sessao_painel';
export const DURACAO_SESSAO_S = 12 * 3600;
const texto = new TextEncoder();

async function hmac(segredo: string, mensagem: string): Promise<string> {
  const chave = await crypto.subtle.importKey('raw', texto.encode(segredo), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const assinatura = await crypto.subtle.sign('HMAC', chave, texto.encode(mensagem));
  return [...new Uint8Array(assinatura)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Compara resumos de mesmo tamanho, para o tempo não depender do conteúdo comparado.
async function iguais(a: string, b: string): Promise<boolean> {
  const [x, y] = await Promise.all([a, b].map((v) => hmac('comparacao', v)));
  let diferenca = 0;
  for (let i = 0; i < x.length; i++) diferenca |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return diferenca === 0;
}

export async function senhaConfere(digitada: string, correta: string): Promise<boolean> {
  return correta.length > 0 && (await iguais(digitada, correta));
}

export async function criarSessao(segredo: string, agoraMs = Date.now()): Promise<string> {
  const expira = String(agoraMs + DURACAO_SESSAO_S * 1000);
  return `${expira}.${await hmac(segredo, expira)}`;
}

export async function sessaoValida(valor: string | undefined, segredo: string, agoraMs = Date.now()): Promise<boolean> {
  const [expira, assinatura] = (valor ?? '').split('.');
  if (!segredo || !expira || !assinatura || !/^\d+$/.test(expira) || Number(expira) < agoraMs) return false;
  return iguais(assinatura, await hmac(segredo, expira));
}
```

- [ ] **Step 4: Rodar e ver passar**: `npm test` → todos os testes passam.

- [ ] **Step 5: `src/middleware.ts`**

```ts
// RN05: somente o proprietário autenticado acessa o painel. Também aplica os cabeçalhos de segurança do painel.
import { defineMiddleware } from 'astro:middleware';
import { env } from 'cloudflare:workers';
import { COOKIE_SESSAO, sessaoValida } from './lib/sessao';

const CABECALHOS_PAINEL = {
  'Cache-Control': 'no-store',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'same-origin',
  'X-Robots-Tag': 'noindex',
};

export const onRequest = defineMiddleware(async (context, next) => {
  const caminho = context.url.pathname.replace(/\/+$/, '');
  if (caminho !== '/painel' && !caminho.startsWith('/painel/')) return next();

  const autenticado = caminho === '/painel/entrar'
    || (await sessaoValida(context.cookies.get(COOKIE_SESSAO)?.value, env.SESSAO_SEGREDO));
  const resposta = autenticado ? await next() : context.redirect('/painel/entrar');
  for (const [nome, valor] of Object.entries(CABECALHOS_PAINEL)) resposta.headers.set(nome, valor);
  return resposta;
});
```

As páginas pré-renderizadas não passam pela checagem (o caminho não começa com `/painel`), então o `cloudflare:workers` só é usado em rotas sob demanda. Se o build reclamar desse import durante a pré-renderização, trocar o import do topo por `const { env } = await import('cloudflare:workers')` dentro do ramo do painel.

- [ ] **Step 6: `src/layouts/PainelLayout.astro`** (o "Sair" é um formulário `POST`, para que nenhum link externo consiga desconectar o proprietário)

```astro
---
import '../styles/global.css';

interface Props { title: string }
const { title } = Astro.props;
---

<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <title>{title} | Painel</title>
  </head>
  <body>
    <a href="#conteudo" class="fixed left-4 top-4 z-[100] -translate-y-24 bg-safety px-4 py-3 font-bold text-ink focus:translate-y-0">Ir para o conteúdo</a>
    <header class="bg-ink text-white">
      <div class="container-site flex min-h-16 items-center justify-between">
        <a href="/painel" class="font-bold uppercase tracking-wider">Painel da oficina</a>
        <form method="post" action="/painel/sair">
          <button type="submit" class="min-h-11 font-bold underline">Sair</button>
        </form>
      </div>
    </header>
    <main id="conteudo" class="container-site py-8"><slot /></main>
  </body>
</html>
```

- [ ] **Step 7: `src/pages/painel/entrar.astro`** (não usa o `PainelLayout`, porque a tela de entrada não tem o botão "Sair")

```astro
---
// UC06 Entrar no painel.
import { env } from 'cloudflare:workers';
import '../../styles/global.css';
import { COOKIE_SESSAO, DURACAO_SESSAO_S, criarSessao, senhaConfere } from '../../lib/sessao';

export const prerender = false;

let erro = '';
if (Astro.request.method === 'POST') {
  const senha = String((await Astro.request.formData()).get('senha') ?? '').slice(0, 200);
  if (await senhaConfere(senha, env.PAINEL_SENHA)) {
    Astro.cookies.set(COOKIE_SESSAO, await criarSessao(env.SESSAO_SEGREDO), {
      httpOnly: true, secure: true, sameSite: 'strict', path: '/painel', maxAge: DURACAO_SESSAO_S,
    });
    return Astro.redirect('/painel', 303);
  }
  erro = 'Senha incorreta.';
}
---

<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>Entrar | Painel</title>
  </head>
  <body>
    <main class="container-site grid min-h-svh max-w-sm content-center">
      <h1 class="display-type text-3xl">Painel da oficina</h1>
      <form method="post" class="mt-6 grid gap-4">
        <label class="campo">Senha <input type="password" name="senha" autocomplete="current-password" maxlength="200" required autofocus /></label>
        {erro && <p class="erro" role="alert">{erro}</p>}
        <button type="submit" class="button-primary">Entrar</button>
      </form>
    </main>
  </body>
</html>
```

O cookie `secure` funciona em `http://localhost` nos navegadores atuais. Se o login não persistir na máquina local, conferir isso antes de mexer no código.

- [ ] **Step 8: `src/pages/painel/sair.ts`**

```ts
import type { APIRoute } from 'astro';
import { COOKIE_SESSAO } from '../../lib/sessao';

export const prerender = false;

export const POST: APIRoute = ({ cookies, redirect }) => {
  cookies.delete(COOKIE_SESSAO, { path: '/painel' });
  return redirect('/painel/entrar', 303);
};
```

- [ ] **Step 9: Testar no navegador e com `curl`.** Com `npm run dev`:
  1. `/painel` sem login redireciona para `/painel/entrar`. `/painel/` e `/painel/1` também redirecionam.
  2. Uma senha errada mostra "Senha incorreta." e mantém a tela de entrada.
  3. Com `gaucho2026`, o sistema vai para `/painel`. Se der 404 nesse ponto, é porque a Task 7 ainda não foi feita.
  4. "Sair" volta para a tela de entrada, e `/painel` redireciona de novo.
  5. `curl -sI http://localhost:4321/painel/entrar` mostra `Cache-Control: no-store` e `X-Frame-Options: DENY`.
  6. `curl -s -X POST -H "Origin: https://evil.example" -d senha=x http://localhost:4321/painel/entrar` responde 403 (`checkOrigin`).

- [ ] **Step 10: Commit**

```bash
git add -A && git commit -m "Adiciona entrada no painel com sessao protegida"
```

---

### Task 7: Lista de solicitações com filtros (UC07)

**Files:**
- Create: `src/pages/painel/index.astro`

**Interfaces:**
- Consumes: `listar`, `Registro` (Task 4); `SITUACOES`, `TIPOS` (Task 3); `PainelLayout` (Task 6).

- [ ] **Step 1: Implementar**

```astro
---
// UC07 Listar solicitações: da mais recente para a mais antiga, com filtros por situação e tipo.
import PainelLayout from '../../layouts/PainelLayout.astro';
import { listar } from '../../lib/repositorio';
import { SITUACOES, TIPOS } from '../../lib/solicitacao';

export const prerender = false;

const situacao = Astro.url.searchParams.get('situacao') ?? '';
const tipo = Astro.url.searchParams.get('tipo') ?? '';
const solicitacoes = await listar({ situacao, tipo });
const data = (iso: string) => new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' });
---

<PainelLayout title="Solicitações">
  <h1 class="display-type text-3xl">Solicitações</h1>

  <form method="get" class="mt-6 flex flex-wrap items-end gap-4">
    <label class="campo">Situação
      <select name="situacao">
        <option value="">Todas</option>
        {Object.entries(SITUACOES).map(([v, r]) => <option value={v} selected={situacao === v}>{r}</option>)}
      </select>
    </label>
    <label class="campo">Tipo
      <select name="tipo">
        <option value="">Todos</option>
        {Object.entries(TIPOS).map(([v, r]) => <option value={v} selected={tipo === v}>{r}</option>)}
      </select>
    </label>
    <button type="submit" class="button-primary">Filtrar</button>
  </form>

  {solicitacoes.length === 0 ? (
    <p class="mt-8">Nenhuma solicitação encontrada.</p>
  ) : (
    <div class="mt-8 overflow-x-auto" role="region" aria-label="Solicitações" tabindex="0">
      <table class="w-full border-collapse text-left text-sm">
        <thead><tr class="border-b-2 border-ink">
          <th scope="col" class="p-2">Protocolo</th><th scope="col" class="p-2">Data</th><th scope="col" class="p-2">Nome</th><th scope="col" class="p-2">Tipo</th><th scope="col" class="p-2">Caminhão</th><th scope="col" class="p-2">Situação</th>
        </tr></thead>
        <tbody>
          {solicitacoes.map((s) => (
            <tr class="border-b border-steel/40">
              <td class="p-2"><a href={`/painel/${s.id}`} class="font-bold underline">{s.protocolo ?? `Nº ${s.id}`}</a></td>
              <td class="p-2">{data(s.criada_em)}</td>
              <td class="p-2">{s.nome}</td>
              <td class="p-2">{TIPOS[s.tipo as keyof typeof TIPOS]}</td>
              <td class="p-2">{[s.marca, s.modelo, s.placa].filter(Boolean).join(' ') || 'Não informado'}</td>
              <td class="p-2">{SITUACOES[s.situacao]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</PainelLayout>
```

O `s.protocolo ?? Nº id` cobre o caso raro em que o `UPDATE` do protocolo falha depois do `INSERT` (Task 4). Nesse caso a linha continua acessível.

- [ ] **Step 2: Testar no navegador.** Com login feito, em `/painel`:
  1. As duas solicitações da Task 5 aparecem, a mais recente primeiro.
  2. O filtro de tipo "Socorro na rodovia" deixa só uma.
  3. O filtro de situação "Concluída" mostra "Nenhuma solicitação encontrada."
  4. `?situacao=x' OR 1=1--` lista tudo, porque o filtro inválido é ignorado, e não dá erro.
  5. Com 375px de largura, a tabela rola na horizontal dentro da própria área.

- [ ] **Step 3: Commit**

```bash
git add src/pages/painel/index.astro && git commit -m "Adiciona lista de solicitacoes com filtros"
```

---

### Task 8: Detalhe, situação, recusa e exclusão (UC08 a UC12)

**Files:**
- Create: `src/pages/painel/[id].astro`

**Interfaces:**
- Consumes: `buscar`, `atualizar`, `excluir` (Task 4); `alterarSituacao`, `LIMITE_ANOTACAO`, `SITUACOES`, `TIPOS`, `PERFIS` (Task 3); `PainelLayout` (Task 6).

- [ ] **Step 1: Implementar**

```astro
---
// UC08 Consultar, UC09 Alterar situação, UC10 Motivo da recusa, UC11 Excluir, UC12 WhatsApp do cliente.
import PainelLayout from '../../layouts/PainelLayout.astro';
import { atualizar, buscar, excluir } from '../../lib/repositorio';
import { alterarSituacao, LIMITE_ANOTACAO, PERFIS, SITUACOES, TIPOS } from '../../lib/solicitacao';

export const prerender = false;

const id = /^\d+$/.test(Astro.params.id ?? '') ? Number(Astro.params.id) : NaN;
const naoEncontrada = () => new Response('Solicitação não encontrada', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
if (!Number.isSafeInteger(id)) return naoEncontrada();

let erro = '';
const salvo = Astro.url.searchParams.has('salvo');
let form = { situacao: '', observacao: '', motivo: '' };

if (Astro.request.method === 'POST') {
  const dados = await Astro.request.formData();
  if (dados.get('acao') === 'excluir') {
    await excluir(id);
    return Astro.redirect('/painel', 303);
  }
  form = {
    situacao: String(dados.get('situacao') ?? ''),
    observacao: String(dados.get('observacao') ?? '').trim(),
    motivo: String(dados.get('motivo') ?? '').trim(),
  };
  erro = alterarSituacao(form.situacao, form.motivo, form.observacao).erro ?? '';
  if (!erro) {
    try {
      await atualizar(id, form.situacao, form.observacao, form.motivo);
      return Astro.redirect(`/painel/${id}?salvo`, 303);
    } catch {
      erro = 'Não foi possível salvar, tente novamente.';
    }
  }
}

const s = await buscar(id);
if (!s) return naoEncontrada();
if (!form.situacao) form = { situacao: s.situacao, observacao: s.observacao ?? '', motivo: s.motivo_recusa ?? '' };

const digitos = s.telefone.replace(/\D/g, '');
const whatsapp = `https://wa.me/${digitos.startsWith('55') ? digitos : `55${digitos}`}?text=${encodeURIComponent(`Olá, ${s.nome}! Aqui é da Mecânica Gaúcho Diesel, sobre a solicitação ${s.protocolo ?? s.id}.`)}`;
const dataHora = (iso: string) => new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
const linhas: [string, string | null][] = [
  ['Tipo', TIPOS[s.tipo as keyof typeof TIPOS]],
  ['Perfil', PERFIS[s.perfil as keyof typeof PERFIS]],
  ['Nome', s.nome], ['Telefone', s.telefone], ['Empresa', s.empresa],
  ['Caminhão', [s.marca, s.modelo].filter(Boolean).join(' ') || null], ['Placa', s.placa],
  ['Serviço de interesse', s.servico], ['Descrição', s.descricao],
  ['Localização', s.tipo === 'socorro' ? `${s.rodovia}, km ${s.km}, ${s.cidade}` : null],
  ['Recebida em', dataHora(s.criada_em)],
  ['Atualizada em', dataHora(s.atualizada_em)],
];
---

<PainelLayout title={s.protocolo ?? `Solicitação ${s.id}`}>
  <a href="/painel" class="underline">Voltar à lista</a>
  <h1 class="display-type mt-4 text-3xl">{s.protocolo ?? `Solicitação ${s.id}`}</h1>
  <p class="mt-2 font-bold">{SITUACOES[s.situacao]}</p>

  <dl class="mt-6 grid gap-x-6 gap-y-3 sm:grid-cols-[12rem_1fr]">
    {linhas.filter(([, v]) => v).map(([rotulo, valor]) => (<Fragment><dt class="font-bold">{rotulo}</dt><dd class="whitespace-pre-line break-words">{valor}</dd></Fragment>))}
  </dl>

  <a href={whatsapp} target="_blank" rel="noopener noreferrer" class="button-primary mt-6">Chamar no WhatsApp</a>

  <form method="post" class="mt-10 grid max-w-xl gap-4">
    <h2 class="text-xl font-bold">Alterar situação</h2>
    {salvo && !erro && <p role="status">Situação atualizada.</p>}
    <label class="campo">Situação
      <select name="situacao" data-situacao>
        {Object.entries(SITUACOES).map(([v, r]) => <option value={v} selected={form.situacao === v}>{r}</option>)}
      </select>
    </label>
    <label class="campo" data-motivo hidden={form.situacao !== 'recusada'}>Motivo da recusa
      <textarea name="motivo" rows="3" maxlength={LIMITE_ANOTACAO} aria-invalid={erro && form.situacao === 'recusada' ? 'true' : undefined}>{form.motivo}</textarea>
    </label>
    <label class="campo">Observação <textarea name="observacao" rows="3" maxlength={LIMITE_ANOTACAO}>{form.observacao}</textarea></label>
    {erro && <p class="erro" role="alert">{erro}</p>}
    <button type="submit" name="acao" value="salvar" class="button-primary justify-self-start">Salvar</button>
  </form>

  <form method="post" class="mt-10" data-excluir>
    <button type="submit" name="acao" value="excluir" class="min-h-11 font-bold text-[#b42318] underline">Excluir solicitação</button>
  </form>
</PainelLayout>

<script>
  // UC10: o campo de motivo só aparece quando a nova situação é Recusada.
  const select = document.querySelector<HTMLSelectElement>('[data-situacao]')!;
  const motivo = document.querySelector<HTMLElement>('[data-motivo]')!;
  select.addEventListener('change', () => (motivo.hidden = select.value !== 'recusada'));

  // HU11: confirmação antes de excluir.
  document.querySelector('[data-excluir]')!.addEventListener('submit', (e) => {
    if (!confirm('Excluir esta solicitação? Esta ação não pode ser desfeita.')) e.preventDefault();
  });
</script>
```

A página só é alcançada com sessão válida (middleware). Os dados do cliente são escapados pelo Astro, porque nenhum trecho usa `set:html`.

- [ ] **Step 2: Testar no navegador.** Com login feito, abrir a primeira solicitação:
  1. Todos os dados enviados aparecem. "Chamar no WhatsApp" abre `wa.me/55...` com a mensagem pronta.
  2. Mudar para "Recusada" mostra o campo de motivo. Salvar sem motivo mostra "Informe o motivo da recusa." e não grava: a situação no topo continua a mesma.
  3. Salvar com motivo mostra "Situação atualizada.", e a lista passa a exibir "Recusada".
  4. Mudar para "Em análise" com uma observação salva os dados, e o motivo é apagado do banco.
  5. Clicar em "Excluir" e cancelar mantém a solicitação. Clicar em "Excluir" e confirmar volta para a lista, já sem ela.
  6. `/painel/9999` e `/painel/abc` respondem 404.
  7. Enviar uma solicitação com `<script>alert(1)</script>` no nome e na descrição: o texto aparece literal no detalhe e na lista, sem executar.

- [ ] **Step 3: Commit**

```bash
git add "src/pages/painel/[id].astro" && git commit -m "Adiciona detalhe da solicitacao com alteracao de situacao e exclusao"
```

---

### Task 9: README, revisão de código e verificação

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Reescrever o `README.md`** com estes itens:
  - nome do sistema;
  - integrantes: Caio Nogueira, Felipe Muraro, Filipe Sudário, José Neres e Pedro Gomes;
  - tecnologias: Astro, Tailwind, Cloudflare Workers, Cloudflare D1 e Wrangler;
  - como executar:

```bash
npm install
cp .dev.vars.example .dev.vars
npm run db:migrar
npm run dev
```

  - o endereço `http://localhost:4321` e o painel em `/painel`, com a senha de teste `gaucho2026`;
  - `npm test` para rodar os testes das regras de negócio;
  - a tabela de rastreabilidade (rota, caso de uso e história), copiada do mapeamento da spec.

  Aplicar o skill `humanizer` ao texto.

- [ ] **Step 2: Portões**

Run: `npm test && npm run build`
Expected: todos os testes passam, e o build termina sem erros nem avisos de tipo.

- [ ] **Step 3: Revisão de código.** Usar `superpowers:requesting-code-review` sobre o diff desde o commit "Adiciona dados estruturados, sitemap e robots". Corrigir o que for confirmado, com um commit por correção.

- [ ] **Step 4: Checklist do `web-quality` nas telas novas**
  - um `h1` por página;
  - rótulo em todo campo;
  - foco visível;
  - contraste AA no `#b42318` sobre o fundo `paper`;
  - alvos de toque com pelo menos 44px;
  - sem rolagem horizontal em 375px;
  - páginas do painel e confirmação com `noindex`;
  - `/painel` fora do sitemap e do `robots.txt`.

  Depois, rodar o Lighthouse na página `/` com `npm run build && npx wrangler dev`. A nota de desempenho precisa ser 90 ou mais (RNF02).

- [ ] **Step 5: Verificação final** (`superpowers:verification-before-completion`): repetir no navegador os roteiros das Tasks 5 a 8 do começo ao fim, partindo de um banco local zerado. Para zerar, apagar `.wrangler/state` e rodar `npm run db:migrar`.

- [ ] **Step 6: Commit**

```bash
git add README.md && git commit -m "Atualiza README com instrucoes de execucao"
```

---

### Task 10: Revisão de segurança (OWASP, sem ferramenta paga)

A auditoria paga ficou de fora. Esta tarefa aplica as categorias que o Strix testa (OWASP Top 10 de 2025 e OWASP API Top 10 de 2023) como um roteiro de ataques feito à mão contra o sistema rodando na máquina local, mais uma revisão do código. Cada item tem um comando e o resultado esperado. Se algum item falhar, ele vira um teste (quando a falha estiver em `src/lib`), uma correção e um commit "Corrige <falha>".

**Files:**
- Create: `scripts/verificar-seguranca.sh` (roteiro reexecutável com `curl`; entra no Git)

- [ ] **Step 1: Subir o sistema como em produção**

```bash
npm run build && npx wrangler dev --port 8787
```

Rodar em segundo plano. Todos os testes abaixo usam `http://localhost:8787`. O `wrangler dev` roda o Worker gerado no build, que é mais fiel à produção do que o `astro dev`.

- [ ] **Step 2: Escrever `scripts/verificar-seguranca.sh`**, com uma função `confere` que imprime OK ou FALHA e um código de saída diferente de zero se algo falhar. O script cobre os casos abaixo.

| Categoria OWASP | Ataque | Esperado |
|---|---|---|
| A01 Controle de acesso | `GET /painel`, `/painel/`, `/painel/1`, `/PAINEL`, `/painel/%2e%2e/painel`, sem cookie | 302 para `/painel/entrar` ou 404, nunca 200 com dados |
| A01 Controle de acesso | `POST /painel/1` (excluir) sem cookie | 302 para a tela de entrada, e a linha continua no banco |
| A01 IDOR | `/painel/1` com sessão válida | 200 (há um único usuário, então não há dados de outro dono) |
| A07 Autenticação | cookie com assinatura trocada, com prazo vencido, `abc.def` e vazio | redireciona para a tela de entrada |
| A07 Autenticação | senha errada, senha vazia, senha de 10 mil caracteres | "Senha incorreta." e nenhum cookie `Set-Cookie: sessao_painel` |
| A07 Sessão | atributos do cookie depois do login | `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/painel`, `Max-Age=43200` |
| A01 CSRF | `POST /painel/entrar`, `/painel/1` e `/solicitar` com `Origin: https://evil.example` | 403 |
| A05 Injeção | `/painel?situacao=x' OR 1=1--&tipo=1;DROP TABLE solicitacao` | 200, sem erro, e a tabela continua existindo |
| A05 Injeção | solicitação com `'); DROP TABLE solicitacao;--` na descrição | gravada como texto literal |
| A05 XSS armazenado | solicitação com `<script>alert(1)</script>` e `"><img src=x onerror=alert(1)>` no nome e na descrição | a lista e o detalhe mostram `&lt;script&gt;`, nunca a tag crua |
| A05 XSS refletido | `/solicitar/enviada?p=<script>` e `?tipo=<script>` | redireciona para `/solicitar` ou mostra o texto escapado |
| API3 Atribuição em massa | `POST /solicitar` com `situacao=concluida&protocolo=X&id=999` além dos campos normais | gravada com situação `nova` e protocolo gerado |
| API4 Consumo de recursos | descrição de 100 mil caracteres; corpo de 5 MB | a validação recusa e nada é gravado |
| A02 Configuração | cabeçalhos de `/painel/entrar` | `Cache-Control: no-store`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `X-Robots-Tag: noindex` |
| A02 Configuração | `/robots.txt` e `/sitemap-index.xml` | `Disallow: /painel`, e nenhuma URL do painel no sitemap |
| A10 Exceções | `/painel/abc`, `/painel/99999999999999999999`, `POST /painel/1` com `acao=xyz` | 404 ou mensagem de erro, sem stack trace nem texto de erro do D1 |
| A04 Segredos | `git grep -n -i "gaucho2026\|PAINEL_SENHA=\|SESSAO_SEGREDO="` | aparece só em `.dev.vars.example` e no README |

O login no script usa a senha de `.dev.vars`, lida do arquivo, e nunca escrita no script. O teste de "a linha continua no banco" usa `npx wrangler d1 execute gaucho-diesel --local --command "SELECT count(*) FROM solicitacao"`.

- [ ] **Step 3: Rodar o roteiro**

Run: `bash scripts/verificar-seguranca.sh`
Expected: todas as linhas com OK e código de saída 0. Corrigir cada FALHA na causa, como descrito acima, e rodar de novo até passar.

- [ ] **Step 4: Revisão do código.** Usar a skill `security-review` sobre o diff desde o commit "Adiciona dados estruturados, sitemap e robots". Confirmar ou descartar cada apontamento com um teste do roteiro. O que for confirmado é corrigido com commit próprio.

- [ ] **Step 5: Dependências**

Run: `npm audit --omit=dev`
Expected: nenhuma vulnerabilidade alta ou crítica. Se houver, atualizar a dependência com `npm update <pacote>`, rodar `npm test && npm run build` e fazer o commit "Atualiza dependencias com falha de seguranca".

- [ ] **Step 6: Commit**

```bash
git add scripts/verificar-seguranca.sh && git commit -m "Adiciona roteiro de verificacao de seguranca"
```

- [ ] **Step 7: Depois da publicação (Task 11),** rodar o mesmo roteiro contra o site real, trocando o endereço base por `https://mecanicagauchodiesel.com.br`. O login usa uma senha temporária, que depois é trocada pela definitiva com `npx wrangler secret put PAINEL_SENHA`. No fim, excluir as solicitações de teste. Os testes de volume (API4) ficam de fora em produção, porque a regra de limite de requisições já os bloqueia.

---

### Task 11: Troca do main e publicação no domínio da oficina

O adapter gera um Worker. O projeto atual no Pages (estático) vai ser substituído por um Worker com o mesmo domínio. Cada passo abaixo precisa da confirmação do usuário naquele momento.

- [ ] **Step 1: Trocar o `main` pelo histórico novo**

```bash
git switch historico
git branch -M historico main
git push --force-with-lease origin main
```

A branch `backup-main` fica só na máquina local até o usuário mandar apagá-la. Ela não vai para o remoto, porque o histórico antigo é justamente o que está sendo substituído.

- [ ] **Step 2: Banco de produção**

```bash
npx wrangler login
npx wrangler d1 create gaucho-diesel
```

Colocar o `database_id` retornado no `wrangler.jsonc` e fazer o commit "Configura banco D1 de producao". Depois:

```bash
npx wrangler d1 migrations apply gaucho-diesel --remote
```

- [ ] **Step 3: Segredos de produção**

```bash
npx wrangler secret put PAINEL_SENHA
npx wrangler secret put SESSAO_SEGREDO
```

O usuário digita uma senha de no mínimo 16 caracteres, que não pode ser `gaucho2026`. O `SESSAO_SEGREDO` é gerado com `node -e "console.log(crypto.randomBytes(32).toString('hex'))"`. Nenhum dos dois valores aparece no chat nem em arquivo.

- [ ] **Step 4: Levar as mudanças para o `mecanica-gaucho-diesel`.** Copiar os arquivos das Tasks 2 a 9: `wrangler.jsonc`, `migrations/`, `src/lib/`, `src/middleware.ts`, `src/layouts/PainelLayout.astro`, `src/layouts/BaseLayout.astro`, `src/pages/solicitar/`, `src/pages/painel/`, `src/pages/robots.txt.ts`, `src/components/Header.astro`, `src/styles/global.css`, `src/env.d.ts`, `astro.config.mjs`, `package.json`, `package-lock.json`, `tsconfig.json`, `.gitignore`, `.dev.vars.example`, `tests/`. Rodar `npm install && npm test && npm run build` nesse repositório e fazer o commit "Adiciona solicitacao de atendimento e painel do proprietario". O push só acontece depois da confirmação do usuário.

- [ ] **Step 5: Publicar o Worker e mover o domínio.** No `mecanica-gaucho-diesel`, rodar `npx wrangler deploy` e testar primeiro no endereço `*.workers.dev`. Depois, no painel da Cloudflare:
  1. Remover o domínio personalizado do projeto do Pages.
  2. Em Workers, no item Settings e depois em Domains & Routes, adicionar `mecanicagauchodiesel.com.br` (e o `www`, se existir).

  O site fica fora do ar por alguns minutos nessa troca, então é melhor fazer fora do horário da oficina. O projeto do Pages só é apagado depois que o usuário confirmar que o Worker está respondendo.

- [ ] **Step 6: Limite de requisições.** No painel da Cloudflare, abrir Security, depois WAF, depois Rate limiting rules, e criar uma regra para a zona do domínio:
  - expressão: `(http.request.method eq "POST" and (http.request.uri.path eq "/painel/entrar" or http.request.uri.path eq "/solicitar"))`;
  - limite: 10 requisições por minuto por IP;
  - ação: bloquear por 10 minutos.

  O plano gratuito permite uma regra, e essa expressão cobre as duas rotas.

- [ ] **Step 7: Teste no site publicado.** Enviar uma solicitação de teste, entrar no painel, conferir os dados e excluir o teste. Conferir também que `https://mecanicagauchodiesel.com.br/painel` sem login redireciona para a tela de entrada. Em seguida, fazer a Task 10, Step 7 (roteiro de segurança contra o site real).

O relatório curto de PI (1 a 2 páginas, com prints) fica fora deste plano. Ele deve registrar duas mudanças em relação à modelagem: a troca do Pages pelo Workers (RNF06) e a revisão de segurança pelo OWASP como verificação.
