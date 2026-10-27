# Contexto do projeto

AEX integrada de Engenharia de Software II (prof. Thiago) e Programação para Internet (prof. Tafarel). A entrega de PI é em 29/10/2026. Os enunciados estão em `docs/especificacoes/`.

- Sistema: site institucional da Mecânica Gaúcho Diesel com formulário de solicitação de atendimento (oficina ou socorro), banco Cloudflare D1 e painel do proprietário (login, lista, detalhe, alteração de situação e exclusão).
- Código: Astro + Tailwind na Cloudflare Pages. As páginas institucionais partem do repositório `site-mecanica-gaucho-diesel`, e os dados editáveis ficam em `src/data/`. Isso é só um detalhe de implementação.
- Requisitos e histórias: `docs/01-requisitos-e-historias.md`. Toda funcionalidade precisa ser rastreável a uma história, porque a AEX de PI avalia a coerência com a modelagem.
- O sistema não trata orçamento, financeiro nem estoque, que já ficam no sistema interno da oficina.

## Modelagem UML

Os diagramas da modelagem foram criados na AEX de Engenharia de Software II com o MCP `astah`, e esta AEX só os referencia. As melhorias da versão 2.0 não ganharam diagramas novos e são descritas em texto no `docs/01`. A modelagem desta AEX é a versão 2.0, que estende a versão 1.0 da AEX de Engenharia de Software II (site estático, HU01 a HU08, RF01 a RF04, RN01 a RN03, UC01 a UC04). A numeração do que é novo continua a da ES-II. Os arquivos da ES-II ficam em `C:\Projetos\uenp\eng. software 2\aex` e não devem ser alterados.
## Escrita

Usar o skill `humanizer` em todos os textos. Português formal, conciso e objetivo, na linguagem de um estudante. Não usar gírias nem travessões.

Na AEX de Engenharia de Software II o site foi tratado como criado do zero. Nesta AEX de Programação para Internet o site institucional é tratado como pronto e publicado (25/10/2026), e a solicitação de atendimento, o banco de dados e o painel são a evolução da modelagem. Nos textos, deixar claro o que vem da ES-II e o que é novo. Resultados medidos no site publicado, como o Lighthouse, podem ser citados.

Os commits estão todos em nome de Pedro Gomes porque o grupo desenvolveu em conjunto, em um único computador. O README e o relatório registram isso.
