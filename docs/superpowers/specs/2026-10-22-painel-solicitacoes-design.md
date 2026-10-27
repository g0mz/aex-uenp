# Solicitação de atendimento e painel do proprietário

Especificação da parte dinâmica do sistema da Mecânica Gaúcho Diesel, construída para a AEX de Programação para Internet a partir da modelagem de Engenharia de Software II (`docs/01-requisitos-e-historias.md` e `docs/uml/`).

## Escopo

Entram nesta versão os casos de uso UC04 a UC12: o formulário público de solicitação, com o ramo de socorro, e o painel do proprietário, com entrada, lista, detalhe, alteração de situação, motivo de recusa, exclusão e atalho para o WhatsApp. Com isso o sistema tem o cadastro completo (inserir, listar, consultar, alterar e excluir) exigido pela atividade.

As páginas institucionais (UC01 a UC03) continuam estáticas. A HU12, cadastro de serviços do site, fica de fora, como já previsto na modelagem.

## Tecnologia

Astro com Tailwind, publicado na Cloudflare com o adapter `@astrojs/cloudflare` e banco Cloudflare D1. A versão do adapter compatível com o Astro 7 publica um Cloudflare Worker com arquivos estáticos, e não um projeto do Pages. Essa diferença em relação ao RNF06 entra no relatório de PI como mudança da modelagem. O custo continua zero no plano gratuito. As páginas institucionais são pré-renderizadas (RNF02). Somente as rotas de `/solicitar` e `/painel` têm `prerender = false` e rodam no servidor.

Cada tela é um arquivo `.astro` que recebe o `POST` de um formulário HTML comum, valida, grava no D1 e redireciona. Não há framework no cliente. O único script é o que mostra os campos de localização quando o tipo escolhido é socorro.

Na execução local, o Wrangler simula o D1 com SQLite, sem conta na Cloudflare (RNF07).

## Mapeamento da modelagem

| Modelagem | Implementação |
|---|---|
| Tabela `solicitacao`, com `CHECK` em tipo, perfil e situação | `migrations/0001_solicitacao.sql` |
| Classe `Solicitacao` com `validar()`, `gerarProtocolo()` e `alterarSituacao()`; enumerações `TipoAtendimento`, `PerfilCliente` e `Situacao` | `src/lib/solicitacao.ts` |
| `SolicitacaoRepositorio` com inserir, listar, buscar, atualizar e excluir | `src/lib/repositorio.ts`, com SQL parametrizado no D1 |
| `Proprietario`, com a senha em segredo do servidor (RNF05) | `src/lib/sessao.ts` e `src/middleware.ts` |
| UC04 e UC05 | `src/pages/solicitar/index.astro` e `src/pages/solicitar/enviada.astro` |
| UC06 | `src/pages/painel/entrar.astro` e `src/pages/painel/sair.ts` |
| UC07 | `src/pages/painel/index.astro` |
| UC08 a UC12 | `src/pages/painel/[id].astro` |

`Cliente` e `Caminhao` continuam em composição com `Solicitacao` e viram colunas da mesma tabela, como no diagrama de classes.

## Tabela `solicitacao`

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | INTEGER PRIMARY KEY | autoincremento |
| `protocolo` | TEXT UNIQUE | formato `GD-2026-000123`, gerado a partir do id |
| `tipo` | TEXT | `oficina` ou `socorro` |
| `perfil` | TEXT | `autonomo`, `frota` ou `empresa` |
| `nome`, `telefone` | TEXT NOT NULL | RN04 |
| `empresa` | TEXT | opcional |
| `marca`, `modelo`, `placa` | TEXT | dados do caminhão |
| `servico` | TEXT | serviço de interesse, entre os de `src/data/services.ts` |
| `descricao` | TEXT NOT NULL | RN04 |
| `rodovia`, `km`, `cidade` | TEXT | obrigatórios quando `tipo = 'socorro'` |
| `situacao` | TEXT | uma das oito situações da seção 8 dos requisitos; começa em `nova` |
| `observacao` | TEXT | anotação do proprietário |
| `motivo_recusa` | TEXT | obrigatório quando `situacao = 'recusada'` |
| `criada_em`, `atualizada_em` | TEXT | data e hora em ISO 8601 |

## Fluxo de dados e erros

Na solicitação (UC04), o servidor monta a `Solicitacao` com os dados do formulário e chama `validar()`. A RN04 exige nome, telefone e descrição, e o ramo de socorro (UC05) exige também rodovia, km e cidade. Se faltar algum campo, a página volta preenchida, com os campos pendentes destacados, e nada é gravado (fluxo 6.a). Se os dados estiverem completos, o repositório grava a solicitação com a situação "Nova", gera o protocolo e redireciona para `/solicitar/enviada?p=<protocolo>`. Essa página mostra o protocolo e o aviso de que o orçamento é feito após o diagnóstico (RN01). No socorro, ela também avisa que o atendimento depende do alcance e da disponibilidade do mecânico e indica o WhatsApp para casos urgentes (RN03). Os campos obrigatórios têm `required` no HTML, mas a validação que vale é a do servidor.

No detalhe da solicitação (UC09), o campo `acao` define a operação. Para salvar, `alterarSituacao(nova, motivo)` recusa a situação Recusada sem motivo, mostra a mensagem da RN06 e não grava (fluxo 5.a). Quando a alteração é válida, grava a situação, a observação e a data de atualização e recarrega o detalhe. A exclusão (UC11) pede confirmação no navegador e depois volta para a lista.

Um id inexistente retorna 404. Se o D1 falhar, a página mostra "Não foi possível salvar, tente novamente" e mantém o que foi digitado.

A lista (UC07) ordena da solicitação mais recente para a mais antiga e aceita os filtros `?situacao=` e `?tipo=`. Ela mostra protocolo, data, nome, tipo, caminhão e situação (HU08).

O detalhe (UC08) mostra todos os dados enviados e tem um botão que abre o WhatsApp no número do cliente (UC12).

## Sessão e segurança

A senha do painel fica somente no segredo `PAINEL_SENHA` (RNF05). Na execução local, ela vai no arquivo `.dev.vars`, que fica fora do Git. O `.dev.vars.example` traz a senha de teste citada no README.

Ao entrar (UC06), a senha é comparada em tempo constante. Se estiver correta, o servidor cria um cookie `HttpOnly`, `Secure` e `SameSite=Strict`, com prazo de validade e assinatura HMAC feita com o segredo `SESSAO_SEGREDO`. O Proprietario não é gravado no banco, como na modelagem. Uma senha errada mostra mensagem de erro e não libera o acesso. O link "Sair" apaga o cookie.

O `middleware.ts` redireciona qualquer rota de `/painel` sem sessão válida para `/painel/entrar` (RN05, HU07). Como o cookie é `SameSite=Strict`, os formulários do painel ficam protegidos contra CSRF. Toda consulta usa `prepare().bind()`, e o Astro escapa o HTML exibido.

Como o painel fica no site real, a entrada e o envio de solicitações são limitados por uma regra de limite de requisições da Cloudflare, configurada no domínio, sem código. A senha de produção é longa e aleatória. Os campos do formulário têm tamanho máximo, validado no servidor. As respostas do painel saem com `Cache-Control: no-store`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff` e `Referrer-Policy: same-origin`. A saída do painel é um formulário `POST`. O `/painel` fica fora do `robots.txt` e do sitemap.

Antes da publicação, o sistema rodando passa por um roteiro de ataques baseado no OWASP Top 10, e toda falha confirmada é corrigida e testada de novo.

## Mudanças no site

O botão "Solicitar atendimento" do cabeçalho passa a levar para `/solicitar`. O botão fixo do WhatsApp continua (HU03).

## Verificação

Um script de teste com `assert` cobre `validar()` e `alterarSituacao()`, que concentram as regras de negócio. Depois, o fluxo completo é conferido no navegador com o D1 local: enviar pedido de oficina e de socorro, tentar enviar sem os campos obrigatórios, entrar no painel com senha errada e certa, filtrar a lista, recusar sem e com motivo e excluir.

## Publicação

O desenvolvimento e a entrega acontecem no repositório `aex-uenp`. Ao final, as mesmas mudanças vão para o repositório `mecanica-gaucho-diesel`, e o site passa a ser publicado como Worker com `wrangler deploy`. O domínio da oficina sai do projeto do Pages atual e passa para o Worker. O banco D1 de produção e os segredos `PAINEL_SENHA` e `SESSAO_SEGREDO` são criados uma vez, pelo Wrangler.

## Histórico do Git

O histórico do `aex-uenp` será refeito para mostrar o sistema construído do zero, com um commit por parte e as datas reais dos commits: configuração, documentação e modelagem, layout, cada seção institucional, SEO, banco, classe e repositório, formulário, login, lista, detalhe e, por último, README e relatório. Todos os commits ficam no nome de Pedro Gomes, sem linha de coautoria.
