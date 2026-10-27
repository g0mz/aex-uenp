# Mecânica Gaúcho Diesel: requisitos e histórias de usuário

Versão 2.0. Este documento evolui a versão 1.0 da especificação do site institucional, feita na AEX de Engenharia de Software II, quando o site foi construído e publicado em 25/10/2026. As histórias HU01 a HU08, os requisitos RF01 a RF04, as regras RN01 a RN03 e os casos de uso UC01 a UC04 vêm dessa versão e continuam valendo. A versão 2.0 acrescenta, como melhorias, a solicitação de atendimento, o banco de dados, o painel do proprietário e os avisos pelo Telegram, com numeração que continua a da versão 1.0. As melhorias não ganharam diagramas novos. A seção 12 lista o que mudou.

## 1. Problema

A Mecânica Gaúcho Diesel fica na Rodovia Raposo Tavares, em Ourinhos (SP), e atende caminhoneiros, empresas e frotas. O site institucional resolveu a falta de presença digital: quem procura uma mecânica diesel em Ourinhos encontra o endereço, o contato e os serviços.

Falta registrar os pedidos. Eles chegam por ligação ou WhatsApp, com um relato livre do problema. O proprietário faz sozinho o atendimento e o financeiro, além de ajudar na mecânica. A cada contato, ele decide se o serviço está no escopo da oficina e se o caso exige socorro na rodovia ou a ida do caminhão até a oficina. Esses pedidos não são registrados antes de virarem serviço no sistema interno, e o cliente não sabe em que etapa está o seu.

O problema foi levantado com o proprietário por meio de um questionário sobre a rotina da oficina, que substituiu a entrevista presencial.

## 2. Partes interessadas e atores

| Ator | Descrição | Participação aproximada |
|---|---|---|
| Cliente | Pessoa que precisa de serviço para um caminhão e usa o site | 100% |
| Caminhoneiro autônomo (especialização de Cliente) | Dono do próprio caminhão | 20% |
| Motorista de frota (especialização de Cliente) | Motorista de caminhão de uma frota | 40% |
| Representante de empresa (especialização de Cliente) | Empresa que leva seus caminhões à oficina | 40% |
| Proprietário | Dono da oficina. Na versão 1.0 só se beneficiava do site. Na versão 2.0 opera o painel: atende, faz a triagem e acompanha as solicitações | Único usuário do painel |
| Mecânico e ajudante | Executam o serviço | Não usam o sistema |
| WhatsApp (sistema externo) | Canal de conversa com a oficina | |
| Google Maps (sistema externo) | Localização da oficina | |
| Telegram (sistema externo, novo) | Canal de avisos para o proprietário e para o cliente que ativou o acompanhamento | |

## 3. Escopo

Já pronto (versão 1.0): o site institucional estático, com serviços, marcas atendidas, galeria, apresentação da oficina, principais clientes, localização, contato por telefone e e-mail, botão do WhatsApp e dados para os buscadores.

Dentro da versão 2.0:
- solicitação de atendimento pelo site, na oficina ou como socorro na rodovia;
- banco de dados com as solicitações;
- painel do proprietário para receber, analisar e acompanhar as solicitações;
- consulta da situação do pedido pelo cliente;
- avisos pelo Telegram ao proprietário e ao cliente.

Fora do escopo, porque a oficina já usa um sistema interno no computador: orçamentos, financeiro, cadastro completo de clientes, estoque de peças, venda de peças (a oficina compra peças para os serviços, mas não as vende avulsas) e agendamento ou confirmação automática de socorro.

## 4. Regras de negócio

- RN01: só aparecem no site os clientes e as fotos marcados como publicados. Se nenhum item de uma seção estiver publicado, a seção e o link do menu deixam de aparecer (origem: HU08).
- RN02: as marcas são apresentadas apenas como referência dos veículos atendidos (origem: HU01).
- RN03: o socorro mecânico é anunciado para Ourinhos e cidades da região (origem: HU01).
- RN04: o orçamento só é feito após o diagnóstico na oficina. O sistema não gera orçamento.
- RN05: serviços rápidos de preço fixo, como o diagnóstico eletrônico por scanner, podem ser informados como "preço fixo". O valor ainda será definido com o proprietário, e a regra depende do cadastro de serviços (HU19, RF15), que ficou fora desta versão.
- RN06: o socorro na rodovia depende do alcance e da disponibilidade do mecânico. O proprietário analisa toda solicitação de socorro, e o sistema não a confirma automaticamente.
- RN07: uma solicitação exige nome, telefone e descrição do problema. A localização é obrigatória quando o tipo for socorro.
- RN08: somente o proprietário autenticado acessa o painel.
- RN09: uma solicitação fora do escopo da oficina é recusada com o motivo registrado.
- RN10: o cliente só recebe avisos pelo Telegram se tocou em "Iniciar" no bot a partir do link do próprio pedido. Uma falha no envio do aviso nunca impede a gravação nem a alteração da solicitação.

## 5. Requisitos funcionais

A prioridade segue o método MoSCoW: M (obrigatória), S (importante) e C (desejável).

| ID | Requisito | Origem | Prioridade |
|---|---|---|---|
| RF01 | Exibir serviços, apresentação da oficina, marcas atendidas, galeria de trabalhos e principais clientes | HU01, HU04, HU05 | M |
| RF02 | Exibir endereço, horário e mapa, com link para o Google Maps | HU02 | M |
| RF03 | Abrir conversa no WhatsApp com mensagem pronta | HU03 | M |
| RF04 | Oferecer o telefone e o e-mail da oficina com um toque | HU06 | S |
| RF05 | Registrar solicitação de atendimento com tipo (oficina ou socorro), perfil do cliente, nome, telefone, empresa (opcional), marca, modelo e placa do caminhão, serviço de interesse, descrição do problema e localização (no caso de socorro) | HU09, HU10 | M |
| RF06 | Informar ao cliente o número do protocolo após o envio | HU09, HU10 | M |
| RF07 | Autenticar o proprietário por senha e permitir a saída do painel | HU11 | M |
| RF08 | Listar as solicitações em ordem da mais recente, com filtro por situação e por tipo | HU12 | M |
| RF09 | Exibir o detalhe de uma solicitação, com atalho para o WhatsApp do cliente | HU13 | M |
| RF10 | Alterar a situação da solicitação e registrar observações e motivo de recusa | HU14, RN09 | M |
| RF11 | Excluir solicitação duplicada ou de teste | HU15 | M |
| RF12 | Consultar a situação de uma solicitação pelo protocolo e telefone | HU16 | S |
| RF13 | Avisar o cliente pelo Telegram quando a situação muda, se ele ativou os avisos | HU17, RN10 | S |
| RF14 | Avisar o proprietário pelo Telegram a cada solicitação nova | HU18 | M |
| RF15 | Cadastrar, editar e remover os serviços exibidos no site | HU19 | C |

## 6. Requisitos não funcionais

| ID | Requisito | Atributo de qualidade |
|---|---|---|
| RNF01 | O sistema deve ser utilizável no celular, com layout que se adapta à largura da tela. Vale também para o formulário e o painel | Usabilidade |
| RNF02 | As páginas institucionais continuam estáticas, com nota mínima de 90 no Lighthouse. Só o formulário e o painel rodam no servidor | Desempenho |
| RNF03 | HTML semântico, idioma da página declarado, texto alternativo nas imagens e formulário com rótulos | Usabilidade (acessibilidade) |
| RNF04 | Title, description, dados estruturados (`AutoRepair`) e sitemap para a busca local | Restrição de negócio (visibilidade) |
| RNF05 | Hospedagem gratuita na Cloudflare, com banco D1. Na versão 1.0 era a Cloudflare Pages, e o adaptador do Astro 7 publica o sistema como Cloudflare Worker | Restrição de custo |
| RNF06 | A senha do painel fica em um segredo do servidor, e não no código | Segurança |
| RNF07 | O sistema pode ser executado em outro computador seguindo o README | Portabilidade |

## 7. Histórias de usuário

### Cliente

**HU01. Conhecer a oficina** (M, RF01)
Como cliente, quero ver os serviços, as marcas atendidas e a apresentação da oficina para saber se ela resolve o problema do meu caminhão.
- [x] A página inicial lista os serviços com título e descrição curta.
- [x] As marcas atendidas aparecem pelo nome.
- [x] A seção Sobre mostra os anos de atuação e os diferenciais da oficina.

**HU02. Encontrar a oficina** (M, RF02)
Como cliente, quero ver o endereço, o horário e o mapa para chegar à oficina pela rodovia.
- [x] O endereço completo e o horário estão visíveis.
- [x] O mapa aparece na própria página.
- [x] O botão abre o local no Google Maps.

**HU03. Falar pelo WhatsApp** (M, RF03)
Como cliente, quero chamar a oficina no WhatsApp com um toque para relatar o problema.
- [x] O botão fixo abre o WhatsApp com a mensagem "Olá, gostaria de pedir um serviço!".
- [x] O botão "Solicitar atendimento" (no cabeçalho em telas largas e no menu no celular) leva ao formulário de solicitação (HU09). Na versão 1.0 ele abria o WhatsApp.

**HU04. Confiar na oficina** (S, RF01)
Como representante de empresa, quero ver os principais clientes atendidos para decidir se confio a manutenção da minha frota à oficina.
- [x] A seção de clientes lista as empresas autorizadas, com destaque para as principais.

**HU05. Ver trabalhos realizados** (S, RF01)
Como cliente, quero ver fotos de trabalhos feitos na oficina para avaliar a qualidade do serviço.
- [x] A galeria mostra as fotos com descrição.
- [x] Cada foto tem texto alternativo.

**HU06. Contatar a oficina por telefone ou e-mail** (S, RF04)
Como cliente, quero ligar ou escrever para a oficina com um toque para tirar dúvidas fora do WhatsApp.
- [x] O telefone aparece na seção de contato e no rodapé, e o toque abre o aplicativo de ligação.
- [x] O e-mail aparece na seção de contato e no rodapé, e o toque abre o aplicativo de e-mail.

**HU07. Encontrar a oficina no Google** (M, RNF04)
Como cliente que busca mecânica diesel em Ourinhos, quero encontrar a oficina nos resultados de busca para chegar ao site sem conhecer o endereço.
- [x] A página tem title e description próprios.
- [x] Os dados da oficina estão em dados estruturados do tipo `AutoRepair`.
- [x] O site publica um sitemap e um `robots.txt` que o indica.

**HU09. Solicitar atendimento na oficina** (M, RF05, RF06)
Como cliente, quero enviar um pedido com a descrição do problema e os dados do caminhão para que a oficina analise o caso antes de eu levar o veículo.
- [x] O formulário não é enviado sem nome, telefone e descrição (RN07).
- [x] Após o envio, o sistema mostra uma confirmação com o número do protocolo.
- [x] A página informa que o orçamento é feito após o diagnóstico (RN04).

**HU10. Pedir socorro na rodovia** (M, RF05, RF06)
Como caminhoneiro com o caminhão parado, quero pedir socorro informando onde estou para que a oficina verifique se pode me atender.
- [x] Quando o tipo "socorro" é escolhido, o campo de localização (rodovia, km e cidade) passa a ser obrigatório.
- [x] A confirmação informa que o socorro depende de alcance e disponibilidade (RN06) e indica o WhatsApp para casos urgentes.

**HU16. Acompanhar minha solicitação** (S, RF12)
Como cliente, quero consultar a situação do meu pedido pelo protocolo para saber em que etapa ele está.
- [x] Com protocolo e telefone corretos, a página mostra a situação, a data da última atualização e o motivo da recusa, se houver.
- [x] Com dados errados, a página mostra "Solicitação não encontrada" sem dizer qual dado está errado.

**HU17. Ser avisado da resposta** (S, RF13, RN10)
Como cliente, quero receber no Telegram as mudanças de situação do meu pedido para não precisar abrir o site.
- [x] A confirmação tem o botão "Receber atualizações no Telegram".
- [x] Depois de iniciar o bot, cada mudança de situação chega com o protocolo, a nova situação e o motivo da recusa, se houver.

### Proprietário

**HU08. Divulgar só o que está autorizado** (C, RN01)
Como proprietário, quero que apareçam só os clientes e as fotos autorizados para cuidar da imagem da oficina.
- [x] Um cliente ou uma foto não publicados não aparecem no site.
- [x] Uma seção sem itens publicados não aparece, nem o seu link no menu.

**HU11. Entrar no painel** (M, RF07)
Como proprietário, quero entrar no painel com uma senha para que somente eu veja os pedidos.
- [x] Uma senha incorreta exibe uma mensagem de erro e não libera o acesso.
- [x] Sem login, qualquer página do painel redireciona para a tela de entrada.
- [x] O botão "Sair" encerra a sessão.

**HU12. Ver pedidos recebidos** (M, RF08)
Como proprietário, quero ver primeiro os pedidos mais recentes para responder com rapidez.
- [x] A lista mostra protocolo, data, nome, tipo, caminhão e situação.
- [x] A lista pode ser filtrada por situação e por tipo.

**HU13. Analisar um pedido** (M, RF09)
Como proprietário, quero abrir um pedido e chamar o cliente no WhatsApp para entender o problema e decidir se ele está no escopo da oficina.
- [x] O detalhe mostra todos os dados enviados.
- [x] O botão abre o WhatsApp no número do cliente.

**HU14. Atualizar a situação** (M, RF10)
Como proprietário, quero alterar a situação do pedido e registrar observações para acompanhar a etapa de cada caminhão.
- [x] As situações são as da seção 8, e "Socorro a caminho" só aparece em pedidos de socorro.
- [x] A recusa exige um motivo (RN09).

**HU15. Excluir pedido** (M, RF11)
Como proprietário, quero excluir pedidos duplicados ou de teste para manter a lista organizada.
- [x] O sistema pede confirmação antes de excluir.

**HU18. Ser avisado de pedido novo** (M, RF14)
Como proprietário, quero receber no Telegram cada solicitação nova para responder sem ficar olhando o painel.
- [x] Cada solicitação gravada gera uma mensagem com protocolo, tipo, nome, telefone, trecho da descrição (e local, no socorro) e o link do detalhe no painel.

**HU19. Manter os serviços do site** (C, RF15)
Como proprietário, quero cadastrar e editar os serviços exibidos para atualizar o site sem alterar o código.
- [ ] Um serviço cadastrado aparece no site, e um serviço removido deixa de aparecer. Ficou fora desta versão.

## 8. Situações da solicitação

| Situação | Significado |
|---|---|
| Nova | A solicitação chegou pelo site |
| Em análise | O proprietário está conversando com o cliente |
| Recusada | O pedido está fora do escopo ou não há disponibilidade (com motivo) |
| Socorro a caminho | O socorro na rodovia foi aceito (só em pedidos de socorro) |
| Aguardando caminhão | O cliente levará o caminhão até a oficina |
| Em serviço | O caminhão está na oficina para diagnóstico e reparo |
| Concluída | O caminhão foi entregue |
| Cancelada | O cliente desistiu do atendimento |

## 9. Casos de uso

Cada caso de uso deriva de uma história de usuário. UC01 a UC04 são os da versão 1.0, cujo diagrama está no relatório da AEX de Engenharia de Software II. Os casos de uso novos são melhorias e não ganharam diagrama.

| Caso de uso | Ator | Relação | História |
|---|---|---|---|
| UC01 Consultar serviços e clientes | Cliente | | HU01, HU04, HU05 |
| UC02 Localizar a oficina | Cliente, Google Maps | | HU02 |
| UC03 Falar pelo WhatsApp | Cliente, WhatsApp | | HU03 |
| UC04 Contatar por telefone ou e-mail | Cliente | | HU06 |
| UC05 Solicitar atendimento | Cliente | | HU09 |
| UC06 Pedir socorro na rodovia | Cliente | estende UC05 | HU10 |
| UC07 Entrar no painel | Proprietário | incluído por UC08 | HU11 |
| UC08 Listar solicitações | Proprietário | inclui UC07 | HU12 |
| UC09 Consultar solicitação | Proprietário | | HU13 |
| UC10 Alterar situação | Proprietário | | HU14 |
| UC11 Registrar motivo da recusa | Proprietário | estende UC10 | HU14 (RN09) |
| UC12 Excluir solicitação | Proprietário | | HU15 |
| UC13 Chamar cliente no WhatsApp | Proprietário, WhatsApp | estende UC09 | HU13 |
| UC14 Acompanhar solicitação | Cliente | | HU16 |
| UC15 Avisar cliente | Telegram | estende UC10 | HU17 |
| UC16 Avisar proprietário | Telegram | incluído por UC05 | HU18 |

Caminhoneiro autônomo, motorista de frota e representante de empresa são especializações de Cliente. HU07 (atendida pelo RNF04), HU08 (regra de conteúdo, RN01) e HU19 (fora desta versão) não geram caso de uso.

## 10. Diagramas de atividades

Os casos de uso UC01 a UC04 têm diagrama de atividades no relatório da ES-II. Para as melhorias, esta seção descreve o fluxo em texto. Cada fluxo considera uma raia para o ator do caso de uso, uma para o Sistema e, quando o caso de uso envolve WhatsApp ou Google Maps, uma para esse sistema externo. As extensões UC06, UC11 e UC13 acrescentam apenas um trecho ao caso de uso base. A tabela detalha os dois fluxos que inserem e alteram solicitações e têm mais regras.

| Fluxo | Caso de uso | Pontos de decisão | Regras |
|---|---|---|---|
| Solicitar atendimento | UC05, com a extensão UC06 | Tipo de atendimento (oficina ou socorro); campos obrigatórios preenchidos | RN06, RN07 |
| Alterar situação | UC10, com a extensão UC11 | Nova situação é Recusada; recusa com motivo | RN09 |

No UC05, a localização só é pedida no ramo de socorro, e o formulário volta ao preenchimento enquanto faltarem dados. No UC10, a recusa só é gravada com o motivo informado. Toda solicitação nova é registrada com a situação "Nova", primeira situação da seção 8. O UC05 e o UC10 terminam com o aviso pelo Telegram (UC16 e UC15), enviado depois da gravação e sem bloquear o fluxo: se o envio falhar, a solicitação ou a nova situação continua gravada.

## 11. Diagrama de classes

As classes da versão 1.0 (Empresa, Servico, Marca, ItemPortfolio, ClienteAtendido e RedeSocial) descrevem o conteúdo do site e continuam as mesmas e têm diagrama no relatório da ES-II. A versão 2.0 acrescenta as classes abaixo, sem diagrama novo. A classe dos dados de quem pede o atendimento se chama Solicitante, e não Cliente, para não se confundir com o ator Cliente nem com ClienteAtendido.

| Classe | Origem | Persistência |
|---|---|---|
| Solicitacao | UC05, UC06, UC08 a UC12; atividades de UC05 e UC10 | Tabela `solicitacao` no D1 |
| Solicitante | Dados do formulário (RF05) | Colunas `nome`, `telefone`, `empresa` e `perfil` da tabela `solicitacao` |
| Caminhao | Dados do formulário (RF05) | Colunas `marca`, `modelo` e `placa` da tabela `solicitacao` |
| SolicitacaoRepositorio | Cadastrar (UC05), listar (UC08), consultar (UC09), alterar (UC10), excluir (UC12), acompanhar (UC14) e vincular Telegram (UC15) | Executa as consultas SQL no D1 |
| Notificador | UC15 e UC16; dependência de UC05 e UC10 | Não é gravado: envia as mensagens pela API do Telegram, com `avisarProprietario(s)` e `avisarCliente(s)` |
| Proprietario | UC07 Entrar no painel (RF07) | Não é gravado: a senha fica em um segredo do servidor (RNF06) |
| TipoAtendimento, PerfilCliente, Situacao | RF05 e seção 8 | Texto com valores restritos (`CHECK`) |

Solicitante e Caminhao estão em composição com Solicitacao porque só existem dentro de um pedido. A oficina não mantém cadastro de clientes nem de veículos neste sistema (seção 3), então os dois ficam na mesma tabela. O repositório reúne as quatro operações do CRUD exigido pela AEX de Programação para Internet.

A classe Solicitacao tem os atributos `telegramCodigo` (código aleatório do link do bot) e `telegramChatId` (conversa do cliente, preenchida quando ele inicia o bot). O repositório tem `acompanhar(protocolo, telefone)`, que devolve apenas protocolo, tipo, situação, motivo da recusa e data de atualização, e `vincularTelegram(codigo, chatId)`.

Regras nas operações: `validar()` aplica a RN07 (nome, telefone e descrição obrigatórios, e localização obrigatória no socorro); `gerarProtocolo()` atende a RF06; `alterarSituacao()` exige o motivo quando a nova situação é Recusada (RN09).

## 12. O que mudou em relação à versão 1.0

| Item | Versão 1.0 (ES-II) | Versão 2.0 (PI) |
|---|---|---|
| Natureza do sistema | Site institucional estático, sem banco de dados | O mesmo site, mais formulário, banco D1 e painel, que rodam no servidor |
| HU03 | "Solicitar atendimento" abre o WhatsApp | "Solicitar atendimento" leva ao formulário. O botão fixo continua abrindo o WhatsApp |
| Proprietário | Beneficiário, sem casos de uso | Ator dos casos de uso UC07 a UC13 |
| Atores externos | Google Maps e WhatsApp | Acrescenta o Telegram |
| Histórias | HU01 a HU08 | Acrescenta HU09 a HU19 |
| Requisitos funcionais | RF01 a RF04 | Acrescenta RF05 a RF15 |
| Regras de negócio | RN01 a RN03 | Acrescenta RN04 a RN10 |
| Casos de uso | UC01 a UC04 | Acrescenta UC05 a UC16 |
| RNF02 | Todas as páginas estáticas | Só as páginas institucionais continuam estáticas |
| RNF05 | Cloudflare Pages | Cloudflare Workers com banco D1, também gratuitos |
| Classes | Seis classes de conteúdo do site | Acrescenta Solicitacao, Solicitante, Caminhao, SolicitacaoRepositorio, Notificador e Proprietario |

## 13. Rastreabilidade das novas histórias

| História | Requisito | Caso de uso | Arquivo |
|---|---|---|---|
| HU09, HU10 | RF05, RF06 | UC05, UC06 | `src/pages/solicitar/index.astro`, `src/pages/solicitar/enviada.astro` |
| HU11 | RF07 | UC07 | `src/pages/painel/entrar.astro`, `src/pages/painel/sair.ts`, `src/middleware.ts` |
| HU12 | RF08 | UC08 | `src/pages/painel/index.astro` |
| HU13, HU14, HU15 | RF09, RF10, RF11 | UC09 a UC13 | `src/pages/painel/[id].astro` |
| HU16 | RF12 | UC14 | `src/pages/acompanhar.astro` |
| HU17, HU18 | RF13, RF14 | UC15, UC16 | `src/pages/telegram.ts`, `src/lib/notificador.ts` |
