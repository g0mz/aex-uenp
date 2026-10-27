# Roteiro da apresentação (uso interno do grupo)

Arquivo local, fora do Git.

## Demonstração (5 minutos)

1. Página inicial em mecanicagauchodiesel.com.br: serviços, marcas, galeria, clientes, mapa e botão do WhatsApp (UC01 a UC03).
2. Solicitar atendimento: escolher "Socorro na rodovia" e mostrar que rodovia, km e cidade aparecem e passam a ser obrigatórios. Enviar sem nome para mostrar a validação (RN04). Enviar completo.
3. Confirmação: protocolo, aviso de que o orçamento é feito após o diagnóstico (RN01) e, no socorro, o aviso de disponibilidade (RN03). Tocar em "Receber atualizações no Telegram" e em "Iniciar" no celular do "cliente".
4. Mostrar o aviso de pedido novo chegando no Telegram do proprietário (HU15).
5. Painel: senha errada mostra erro; senha certa entra (UC06). Lista em ordem da mais recente e filtros por situação e tipo (UC07).
6. Detalhe (UC08): todos os dados e o botão do WhatsApp do cliente (UC12). Tentar "Recusada" sem motivo e mostrar o erro (RN06). Mudar para "Em análise" e mostrar a mensagem chegando no Telegram do cliente (HU14).
7. Acompanhar solicitação com protocolo e telefone (HU13).
8. Excluir a solicitação de teste, mostrando a confirmação (UC11). Sair do painel.

## O que cada arquivo faz

| Arquivo | O que faz | Liga com a modelagem |
|---|---|---|
| `migrations/0001_solicitacao.sql` | Cria a tabela `solicitacao`, com `CHECK` nos valores de tipo, perfil e situação | Classe Solicitacao, Cliente e Caminhao como colunas |
| `migrations/0002_telegram.sql` | Acrescenta `telegram_codigo` e `telegram_chat_id` | Atributos novos da versão 0.2 |
| `src/lib/solicitacao.ts` | Listas de tipos, perfis e situações; `validar()` (RN04), `gerarProtocolo()` (RF05), `alterarSituacao()` (RN06) | Operações da classe Solicitacao |
| `src/lib/repositorio.ts` | SQL no D1: `inserir`, `listar`, `buscar`, `atualizar`, `excluir`, `acompanhar`, `vincularTelegram`. Sempre com `bind`, o que impede injeção de SQL | SolicitacaoRepositorio |
| `src/lib/sessao.ts` | Confere a senha e cria o cookie de sessão assinado com HMAC, válido por 12 horas | Proprietario (a senha fica em segredo, RNF05) |
| `src/middleware.ts` | Roda antes de toda página do painel: sem sessão válida, manda para a entrada (RN05); também envia os cabeçalhos de segurança | UC06 incluído por UC07 |
| `src/lib/notificador.ts` | Monta os textos e envia as mensagens pela API do Telegram; se o envio falhar, só registra o erro | Classe Notificador |
| `src/pages/solicitar/` | Formulário e confirmação | UC04, UC05 |
| `src/pages/painel/` | Entrada, saída, lista e detalhe | UC06 a UC12 |
| `src/pages/acompanhar.astro` | Consulta por protocolo e telefone | UC13 |
| `src/pages/telegram.ts` | Recebe as mensagens do bot (só com o segredo do Telegram) e liga o cliente ao pedido pelo código do `/start` | UC14, UC15 |
| `tests/` | 16 testes das regras, da sessão e dos avisos (`npm test`) | Testes de aceitação |
| `scripts/verificar-seguranca.sh` | Roteiro de ataques baseado no OWASP Top 10 | RNF05 |

## Perguntas prováveis

- Por que Cliente e Caminhao não são tabelas? Porque só existem dentro de um pedido e a oficina não mantém cadastro de clientes neste sistema.
- Onde fica a senha? Em um segredo da Cloudflare (`PAINEL_SENHA`), nunca no código.
- Por que o protocolo não basta para acompanhar? Porque é sequencial; com o telefone junto, ninguém consulta o pedido de outra pessoa.
- Por que Workers e não Pages? O adaptador do Astro 7 publica como Worker; o custo continua zero.
- Por que Telegram e não WhatsApp automático? A API de bots do Telegram é gratuita e oficial; o WhatsApp automático exigiria API paga ou não oficial, com risco de bloqueio do número.
