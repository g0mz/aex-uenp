# Apresentação da AEX de Engenharia de Software II

Slides da modelagem do sistema da Mecânica Gaúcho Diesel, feitos a partir de `docs/relatorio-aex-engenharia-software-2.pdf`. São 20 slides, com cerca de 9 min 45 s somando os tempos das notas.

## Arquivos

- `index.html`: apresentação. Abre no Chrome ou no Edge e funciona sem internet.
- `apresentacao-engenharia.pdf`: cópia em PDF, sem animações, para o caso de o computador da sala não abrir o HTML.
- `img/`: diagramas originais do Astah (extraídos do relatório), fotos e logo da oficina.
- `fonts/`: Roboto Slab e Roboto Condensed, as mesmas fontes do site.

## Como apresentar

- Setas, espaço ou passador de slides: navegar.
- F: tela cheia.
- N: notas do slide, com o tempo previsto e um cronômetro.
- Clique num diagrama: amplia. O botão "Original no Astah" mostra a figura do relatório.

## Roteiro

Capa, a oficina, o cliente (Flávio Moia), público externo e benefício, problema, escopo, temas da disciplina e decisões, regras de negócio, histórias, requisitos, casos de uso, diagramas de atividades (visão geral, UC04 e UC09), classes, persistência, rastreabilidade da HU05, validação, considerações finais e encerramento. A ordem segue os critérios da especificação, com o público externo no início.

Os diagramas de casos de uso, de atividades do UC04 e do UC09 e de classes foram redesenhados em SVG para ficarem legíveis no projetor, com o mesmo conteúdo do Astah.

## Gerar o PDF de novo

```bash
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --no-pdf-header-footer --virtual-time-budget=6000 --print-to-pdf="docs/apresentacao/apresentacao-engenharia.pdf" "file:///C:/caminho/do/repo/docs/apresentacao/index.html"
```
