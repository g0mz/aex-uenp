# Contexto do projeto

AEX integrada de Engenharia de Software II (prof. Thiago) e Programação para Internet (prof. Tafarel). A entrega de PI é em 29/10/2026. Os enunciados estão em `docs/especificacoes/`.

- Sistema: site institucional da Mecânica Gaúcho Diesel com formulário de solicitação de atendimento (oficina ou socorro), banco Cloudflare D1 e painel do proprietário (login, lista, detalhe, alteração de situação e exclusão).
- Código: Astro + Tailwind na Cloudflare Pages. As páginas institucionais partem do repositório `site-mecanica-gaucho-diesel`, e os dados editáveis ficam em `src/data/`. Isso é só um detalhe de implementação.
- Requisitos e histórias: `docs/01-requisitos-e-historias.md`. Toda funcionalidade precisa ser rastreável a uma história, porque a AEX de PI avalia a coerência com a modelagem.
- O sistema não trata orçamento, financeiro nem estoque, que já ficam no sistema interno da oficina.

## Modelagem UML

Os diagramas são criados com o MCP `astah` (configurado em `.mcp.json`, servidor em `C:\Users\Pedro\Documents\GitHub\astah-mcp`) e salvos em `docs/uml/`. A API não cria diagramas de implantação nem de componentes. Cada modelo deriva do anterior: histórias → casos de uso → atividades → classes. A modelagem usa só esses três diagramas, os mesmos vistos na disciplina; sequência e estados ficaram de fora.

## Escrita

Usar o skill `humanizer` em todos os textos. Português formal, conciso e objetivo, na linguagem de um estudante. Não usar gírias nem travessões.

O projeto é apresentado como um sistema criado do zero: o site institucional da oficina já nasce com a solicitação de atendimento, o painel e o banco de dados. Nos textos e na modelagem, nunca tratar o site como algo que já existia. Não usar resultados obtidos depois do lançamento do site.
