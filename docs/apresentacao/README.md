# Apresentação da AEX de Engenharia de Software II

Slides da especificação e da modelagem do site institucional da Mecânica Gaúcho Diesel. São 16 slides, com cerca de 9 minutos somando os tempos das notas.

## Arquivos

- `index.html`: apresentação. Abre no Chrome ou no Edge e funciona sem internet.
- `apresentacao-engenharia.pdf`: cópia em PDF, sem animações, para o caso de o computador da sala não abrir o HTML.
- `img/`: diagramas do Astah, fotos e logo da oficina.
- `fonts/`: Roboto Slab e Roboto Condensed, as mesmas fontes do site.

## Como apresentar

- Setas, espaço ou passador de slides: navegar.
- F: tela cheia.
- N: notas do slide, com o tempo previsto e um cronômetro.
- Clique num diagrama: amplia.

## Roteiro

Capa, público externo e benefício, a oficina, identificação do problema, ações realizadas, escopo, elaboração da proposta, histórias, requisitos, casos de uso, diagramas de atividades, classes, rastreabilidade, validação, considerações finais e agradecimento. A ordem segue os critérios da especificação, com o público externo no início.

## Gerar o PDF de novo

```bash
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --no-pdf-header-footer --virtual-time-budget=8000 --print-to-pdf="docs/apresentacao/apresentacao-engenharia.pdf" "file:///C:/caminho/do/repositorio/docs/apresentacao/index.html"
```
