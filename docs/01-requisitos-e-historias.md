# Mecânica Gaúcho Diesel: requisitos e histórias de usuário

Versão 0.2, evolução da versão 0.1. Este documento foi elaborado a partir de um questionário sobre a rotina da oficina, que substituiu a entrevista presencial.

## 1. Problema

A Mecânica Gaúcho Diesel fica na Rodovia Raposo Tavares, em Ourinhos (SP). Os clientes chegam por indicação, pela passagem na rodovia e por buscas no Google. A oficina não tinha presença digital nem SEO, por isso quem buscava uma mecânica diesel em Ourinhos não encontrava endereço, contato ou serviços.

Os pedidos chegam por ligação ou WhatsApp, com um relato livre do problema. O proprietário faz sozinho o atendimento e o financeiro, além de ajudar na mecânica. A cada contato, ele decide se o serviço está no escopo da oficina e se o caso exige socorro na rodovia ou a ida do caminhão até a oficina. Esses pedidos não são registrados antes de virarem serviço no sistema interno.

## 2. Partes interessadas e atores

| Ator | Descrição | Participação aproximada |
|---|---|---|
| Cliente | Pessoa que precisa de serviço para um caminhão | 100% |
| Caminhoneiro autônomo (especialização de Cliente) | Dono do próprio caminhão | 20% |
| Motorista de frota (especialização de Cliente) | Motorista de caminhão de uma frota | 40% |
| Representante de empresa (especialização de Cliente) | Empresa que leva seus caminhões diretamente | 40% |
| Proprietário | Atende, faz a triagem, cuida do financeiro e ajuda na mecânica | Único usuário do painel |
| Mecânico e ajudante | Executam o serviço | Não usam o sistema |
| WhatsApp (sistema externo) | Canal de conversa com o cliente | |
| Google Maps (sistema externo) | Localização da oficina | |
| Telegram (sistema externo) | Canal de avisos para o proprietário e para o cliente que ativou o acompanhamento | |

## 3. Escopo

Dentro desta versão:
- site institucional com serviços, marcas atendidas, portfólio, clientes, localização e contato;
- solicitação de atendimento pelo site, na oficina ou como socorro na rodovia;
- painel do proprietário para receber, analisar e acompanhar as solicitações.

Fora desta versão, porque a oficina já usa um sistema interno no computador:
- orçamentos, financeiro, cadastro completo de clientes e estoque de peças;
- venda de peças (a oficina compra peças para os serviços, mas não as vende avulsas);
- agendamento automático e confirmação automática de socorro.

## 4. Regras de negócio

- RN01: o orçamento só é feito após o diagnóstico na oficina. O sistema não gera orçamento.
- RN02: serviços rápidos de preço fixo, como o diagnóstico eletrônico por scanner, podem ser informados como "preço fixo". O valor ainda será definido com o proprietário.
- RN03: o socorro na rodovia depende do alcance e da disponibilidade do mecânico. O proprietário analisa toda solicitação de socorro, e o sistema não a confirma automaticamente.
- RN04: uma solicitação exige nome, telefone e descrição do problema. A localização é obrigatória quando o tipo for socorro.
- RN05: somente o proprietário autenticado acessa o painel.
- RN06: uma solicitação fora do escopo da oficina é recusada com o motivo registrado.
- RN07: o cliente só recebe avisos pelo Telegram se tocou em "Iniciar" no bot a partir do link do próprio pedido. Uma falha no envio do aviso nunca impede a gravação nem a alteração da solicitação.

## 5. Requisitos funcionais

| ID | Requisito | Origem |
|---|---|---|
| RF01 | Exibir serviços, marcas atendidas, portfólio e principais clientes | HU01, HU06 |
| RF02 | Exibir endereço, horário e mapa, com link para o Google Maps | HU02 |
| RF03 | Abrir conversa no WhatsApp com mensagem pronta | HU03 |
| RF04 | Registrar solicitação de atendimento com tipo (oficina ou socorro), perfil do cliente, nome, telefone, empresa (opcional), marca, modelo e placa do caminhão, serviço de interesse, descrição do problema e localização (no caso de socorro) | Q3, Q5, Q7 |
| RF05 | Informar ao cliente o número do protocolo após o envio | Q3 |
| RF06 | Autenticar o proprietário por senha e permitir a saída do painel | Q6 |
| RF07 | Listar as solicitações em ordem da mais recente, com filtro por situação e por tipo | Q3, Q6 |
| RF08 | Exibir o detalhe de uma solicitação, com atalho para o WhatsApp do cliente | Q3 |
| RF09 | Alterar a situação da solicitação e registrar observações e motivo de recusa | Q3, RN06 |
| RF10 | Excluir solicitação duplicada ou de teste | Proprietário |
| RF12 | Consultar a situação de uma solicitação pelo protocolo e telefone | HU13 |
| RF13 | Avisar o cliente pelo Telegram quando a situação muda, se ele ativou os avisos | HU14, RN07 |
| RF14 | Avisar o proprietário pelo Telegram a cada solicitação nova | HU15 |
| RF11 (desejável) | Cadastrar, editar e remover os serviços exibidos no site | Q11 |

## 6. Requisitos não funcionais

| ID | Requisito |
|---|---|
| RNF01 | Responsividade: o sistema deve ser utilizável no celular |
| RNF02 | Desempenho: páginas públicas estáticas, com nota mínima de 90 no Lighthouse |
| RNF03 | Acessibilidade: HTML semântico, contraste adequado e formulário com rótulos |
| RNF04 | SEO local: title, description, dados estruturados (`AutoRepair`) e sitemap |
| RNF05 | Segurança: a senha do painel fica em um segredo do servidor, e não no código |
| RNF06 | Custo: hospedagem gratuita na Cloudflare Pages com banco D1 |
| RNF07 | Portabilidade: o sistema pode ser executado em outro computador seguindo o README |

## 7. Histórias de usuário

A prioridade segue o método MoSCoW: M (obrigatória), S (importante) e C (desejável).

### Cliente

**HU01. Conhecer a oficina** (M, RF01)
Como cliente, quero ver os serviços e as marcas atendidas para saber se a oficina resolve o problema do meu caminhão.
- [ ] A página inicial lista os serviços com título e descrição curta.
- [ ] As marcas atendidas aparecem pelo nome.

**HU02. Encontrar a oficina** (M, RF02)
Como cliente, quero ver o endereço, o horário e o mapa para chegar à oficina pela rodovia.
- [ ] O endereço completo e o horário estão visíveis.
- [ ] O botão abre o local no Google Maps.

**HU03. Falar pelo WhatsApp** (M, RF03)
Como cliente, quero chamar a oficina no WhatsApp com um toque para relatar o problema.
- [ ] O botão fixo abre o WhatsApp com a mensagem "Olá, gostaria de pedir um serviço!".

**HU04. Solicitar atendimento na oficina** (M, RF04, RF05)
Como cliente, quero enviar um pedido com a descrição do problema e os dados do caminhão para que a oficina analise o caso antes de eu levar o veículo.
- [ ] O formulário não é enviado sem nome, telefone e descrição (RN04).
- [ ] Após o envio, o sistema mostra uma confirmação com o número do protocolo.
- [ ] A página informa que o orçamento é feito após o diagnóstico (RN01).

**HU05. Pedir socorro na rodovia** (M, RF04, RF05)
Como caminhoneiro com o caminhão parado, quero pedir socorro informando onde estou para que a oficina verifique se pode me atender.
- [ ] Quando o tipo "socorro" é escolhido, o campo de localização (rodovia, km e cidade) passa a ser obrigatório.
- [ ] A confirmação informa que o socorro depende de alcance e disponibilidade (RN03) e indica o WhatsApp para casos urgentes.

**HU06. Confiar na oficina** (S, RF01)
Como representante de empresa, quero ver os principais clientes atendidos para decidir se confio a manutenção da minha frota à oficina.
- [ ] A seção de clientes lista as empresas autorizadas.

**HU13. Acompanhar minha solicitação** (S, RF12)
Como cliente, quero consultar a situação do meu pedido pelo protocolo para saber em que etapa ele está.
- [ ] Com protocolo e telefone corretos, a página mostra a situação, a data da última atualização e o motivo da recusa, se houver.
- [ ] Com dados errados, a página mostra "Solicitação não encontrada" sem dizer qual dado está errado.

**HU14. Ser avisado da resposta** (S, RF13, RN07)
Como cliente, quero receber no Telegram as mudanças de situação do meu pedido para não precisar abrir o site.
- [ ] A confirmação tem o botão "Receber atualizações no Telegram".
- [ ] Depois de iniciar o bot, cada mudança de situação chega com o protocolo, a nova situação e o motivo da recusa, se houver.

### Proprietário

**HU07. Entrar no painel** (M, RF06)
Como proprietário, quero entrar no painel com uma senha para que somente eu veja os pedidos.
- [ ] Uma senha incorreta exibe uma mensagem de erro e não libera o acesso.
- [ ] Sem login, qualquer página do painel redireciona para a tela de entrada.
- [ ] O botão "Sair" encerra a sessão.

**HU08. Ver pedidos recebidos** (M, RF07)
Como proprietário, quero ver primeiro os pedidos mais recentes para responder com rapidez.
- [ ] A lista mostra protocolo, data, nome, tipo, caminhão e situação.
- [ ] A lista pode ser filtrada por situação e por tipo.

**HU09. Analisar um pedido** (M, RF08)
Como proprietário, quero abrir um pedido e chamar o cliente no WhatsApp para entender o problema e decidir se ele está no escopo da oficina.
- [ ] O detalhe mostra todos os dados enviados.
- [ ] O botão abre o WhatsApp no número do cliente.

**HU10. Atualizar a situação** (M, RF09)
Como proprietário, quero alterar a situação do pedido e registrar observações para acompanhar a etapa de cada caminhão.
- [ ] As situações seguem o ciclo definido na seção 8.
- [ ] A recusa exige um motivo (RN06).

**HU11. Excluir pedido** (M, RF10)
Como proprietário, quero excluir pedidos duplicados ou de teste para manter a lista organizada.
- [ ] O sistema pede confirmação antes de excluir.

**HU15. Ser avisado de pedido novo** (M, RF14)
Como proprietário, quero receber no Telegram cada solicitação nova para responder sem ficar olhando o painel.
- [ ] Cada solicitação gravada gera uma mensagem com protocolo, tipo, nome, telefone, trecho da descrição (e local, no socorro) e o link do detalhe no painel.

**HU12. Manter os serviços do site** (C, RF11)
Como proprietário, quero cadastrar e editar os serviços exibidos para atualizar o site sem alterar o código.
- [ ] Um serviço cadastrado aparece no site, e um serviço removido deixa de aparecer.

## 8. Situações da solicitação

| Situação | Significado |
|---|---|
| Nova | A solicitação chegou pelo site |
| Em análise | O proprietário está conversando com o cliente |
| Recusada | O pedido está fora do escopo ou não há disponibilidade (com motivo) |
| Socorro a caminho | O socorro na rodovia foi aceito |
| Aguardando caminhão | O cliente levará o caminhão até a oficina |
| Em serviço | O caminhão está na oficina para diagnóstico e reparo |
| Concluída | O caminhão foi entregue |
| Cancelada | O cliente desistiu do atendimento |

## 9. Casos de uso

O diagrama está em `docs/uml/casos-de-uso.asta`. Cada caso de uso deriva de uma história de usuário.

| Caso de uso | Ator | Relação | História |
|---|---|---|---|
| UC01 Consultar serviços e clientes | Cliente | | HU01, HU06 |
| UC02 Localizar a oficina | Cliente, Google Maps | | HU02 |
| UC03 Falar pelo WhatsApp | Cliente, WhatsApp | | HU03 |
| UC04 Solicitar atendimento | Cliente | | HU04 |
| UC05 Pedir socorro na rodovia | Cliente | estende UC04 | HU05 |
| UC06 Entrar no painel | Proprietário | incluído por UC07 | HU07 |
| UC07 Listar solicitações | Proprietário | inclui UC06 | HU08 |
| UC08 Consultar solicitação | Proprietário | | HU09 |
| UC09 Alterar situação | Proprietário | | HU10 |
| UC10 Registrar motivo da recusa | Proprietário | estende UC09 | HU10 (RN06) |
| UC11 Excluir solicitação | Proprietário | | HU11 |
| UC12 Chamar cliente no WhatsApp | Proprietário, WhatsApp | estende UC08 | HU09 |
| UC13 Acompanhar solicitação | Cliente | | HU13 |
| UC14 Avisar cliente | Telegram | estende UC09 | HU14 |
| UC15 Avisar proprietário | Telegram | incluído por UC04 | HU15 |

Caminhoneiro autônomo, motorista de frota e representante de empresa são especializações de Cliente. A HU12 (desejável) ficou fora desta versão e por isso não aparece no diagrama.

## 10. Diagramas de atividades

Os diagramas estão em `docs/uml/atividades.asta`, um para cada caso de uso (UC01 a UC15). Todos os casos de uso foram modelados, e a tabela abaixo detalha os dois que gravam dados no banco. Cada diagrama tem uma raia para o ator do caso de uso, uma para o Sistema e, quando o caso de uso envolve WhatsApp ou Google Maps, uma para esse sistema externo. Os diagramas das extensões UC05, UC10 e UC12 mostram apenas o trecho que cada uma acrescenta ao caso de uso base.

| Diagrama | Caso de uso | Pontos de decisão | Regras |
|---|---|---|---|
| UC04 Solicitar atendimento | UC04, com a extensão UC05 | Tipo de atendimento (oficina ou socorro); campos obrigatórios preenchidos | RN03, RN04 |
| UC09 Alterar situação | UC09, com a extensão UC10 | Nova situação é Recusada; recusa com motivo | RN06 |

No UC04, a localização só é pedida no ramo de socorro, e o formulário volta ao preenchimento enquanto faltarem dados. No UC09, a recusa só é gravada com o motivo informado. Toda solicitação nova é registrada com a situação "Nova", primeira etapa do ciclo da seção 8. O UC04 e o UC09 terminam com o aviso pelo Telegram (UC15 e UC14), enviado depois da gravação e sem bloquear o fluxo: se o envio falhar, a solicitação ou a nova situação continua gravada.

## 11. Diagrama de classes

O diagrama está em `docs/uml/classes.asta`.

| Classe | Origem | Persistência |
|---|---|---|
| Solicitacao | UC04, UC05, UC07 a UC11; atividades de UC04 e UC09 | Tabela `solicitacao` no D1 |
| Cliente | Dados do formulário (RF04) | Colunas `nome`, `telefone`, `empresa` e `perfil` da tabela `solicitacao` |
| Caminhao | Dados do formulário (RF04) | Colunas `marca`, `modelo` e `placa` da tabela `solicitacao` |
| SolicitacaoRepositorio | Cadastrar (UC04), listar (UC07), consultar (UC08), alterar (UC09), excluir (UC11), acompanhar (UC13) e vincular Telegram (UC14) | Executa as consultas SQL no D1 |
| Notificador | UC14 e UC15; dependência de UC04 e UC09 | Não é gravado: envia as mensagens pela API do Telegram, com `avisarProprietario(s)` e `avisarCliente(s)` |
| Proprietario | UC06 Entrar no painel (RF06) | Não é gravado: a senha fica em um segredo do servidor (RNF05) |
| TipoAtendimento, PerfilCliente, Situacao | RF04 e seção 8 | Texto com valores restritos (`CHECK`) |

Cliente e Caminhao estão em composição com Solicitacao porque só existem dentro de um pedido. A oficina não mantém cadastro de clientes nem de veículos neste sistema (seção 3), então os dois ficam na mesma tabela. O repositório reúne as quatro operações do CRUD exigido pela AEX de PI.

A classe Solicitacao ganha os atributos `telegramCodigo` (código aleatório do link do bot) e `telegramChatId` (conversa do cliente, preenchida quando ele inicia o bot). O repositório ganha `acompanhar(protocolo, telefone)`, que devolve apenas protocolo, tipo, situação, motivo da recusa e data de atualização, e `vincularTelegram(codigo, chatId)`.

Regras nas operações: `validar()` aplica a RN04 (nome, telefone e descrição obrigatórios, e localização obrigatória no socorro); `gerarProtocolo()` atende a RF05; `alterarSituacao()` exige o motivo quando a nova situação é Recusada (RN06).
