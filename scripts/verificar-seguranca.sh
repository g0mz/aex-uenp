#!/usr/bin/env bash
# Roteiro de ataques manuais (OWASP Top 10 2025 e API Top 10 2023) contra o sistema rodando em BASE.
# Uso: npm run build && npx wrangler dev --port 8787 (em outro terminal), depois bash scripts/verificar-seguranca.sh
# A senha e o segredo de sessão são lidos de .dev.vars. Use só contra a máquina local: os testes gravam dados.
BASE="${BASE:-http://localhost:8787}"
EVIL="https://evil.example"
OWN="Origin: $BASE"
cd "$(dirname "$0")/.." || exit 1
SENHA=$(grep '^PAINEL_SENHA=' .dev.vars | cut -d= -f2- | tr -d '\r')
SEGREDO=$(grep '^SESSAO_SEGREDO=' .dev.vars | cut -d= -f2- | tr -d '\r')
WEBHOOK=$(grep '^TELEGRAM_WEBHOOK_SEGREDO=' .dev.vars | cut -d= -f2- | tr -d '')
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
FALHAS=0

confere() { # descrição, código de saída da condição (0 = passou)
  if [ "$2" -eq 0 ]; then echo "OK    $1"; else echo "FALHA $1"; FALHAS=$((FALHAS + 1)); fi
}
req() { curl -s -o "$T/body" -D "$T/head" -w '%{http_code}' "$@"; } # imprime o status; corpo em $T/body e cabeçalhos em $T/head
destino() { sed -n 's/^[Ll]ocation: *//p' "$T/head" | tr -d '\r'; }
sql() { npx wrangler d1 execute gaucho-diesel --local --json --command "$1" 2>/dev/null | grep -o '"n": *"\?[^",}]*' | sed 's/.*: *"\?//'; }
contagem() { sql "SELECT count(*) AS n FROM solicitacao $1"; }
hmac() { printf '%s' "$1" | openssl dgst -sha256 -hmac "$SEGREDO" | sed 's/.*= *//'; }
solicitar() { req -X POST "$BASE/solicitar" -H "$OWN" --data-urlencode "tipo=oficina" --data-urlencode "perfil=autonomo" --data-urlencode "telefone=1" "$@"; }

# Sessão válida
req -X POST "$BASE/painel/entrar" -H "$OWN" --data-urlencode "senha=$SENHA" >/dev/null
COOKIE=$(sed -n 's/^[Ss]et-[Cc]ookie: *\(sessao_painel=[^;]*\).*/\1/p' "$T/head" | tr -d '\r')
[ -n "$COOKIE" ] || { echo "FALHA não foi possível entrar com a senha de .dev.vars"; exit 1; }
VAL=${COOKIE#sessao_painel=}

# Solicitação de apoio
solicitar --data-urlencode "nome=Apoio" --data-urlencode "descricao=Apoio" >/dev/null
ID=$(sql "SELECT max(id) AS n FROM solicitacao")
N0=$(contagem)

echo "== A01 Controle de acesso"
for c in /painel /painel/ "/painel/$ID" /PAINEL /painel/%2e%2e/painel; do
  s=$(req --path-as-is "$BASE$c"); l=$(destino)
  { [ "$s" = 404 ] || { [ "$s" = 302 ] && [[ "$l" == */painel/entrar ]]; }; }; confere "GET $c sem cookie ($s)" $?
done
s=$(req -X POST "$BASE/painel/$ID" -H "$OWN" -d acao=excluir); l=$(destino)
{ [ "$s" = 302 ] && [[ "$l" == */painel/entrar ]] && [ "$(contagem)" = "$N0" ]; }; confere "POST /painel/$ID (excluir) sem cookie: 302 e a linha continua ($s)" $?
s=$(req "$BASE/painel/$ID" -H "Cookie: $COOKIE"); [ "$s" = 200 ]; confere "IDOR: /painel/$ID com sessão válida ($s)" $?

echo "== A07 Autenticação e sessão"
SIG=${VAL#*.}; EXP=${VAL%%.*}
RUIM="${SIG%?}$([ "${SIG: -1}" = a ] && echo b || echo a)"
VENC=$(( $(date +%s) * 1000 - 1000 ))
for par in "assinatura trocada|$EXP.$RUIM" "vencido|$VENC.$(hmac $VENC)" "abc.def|abc.def" "vazio|"; do
  s=$(req "$BASE/painel" -H "Cookie: sessao_painel=${par#*|}"); l=$(destino)
  { [ "$s" = 302 ] && [[ "$l" == */painel/entrar ]]; }; confere "cookie ${par%%|*} redireciona para a entrada ($s)" $?
done
LONGA=$(head -c 10000 /dev/zero | tr '\0' x)
for par in "errada|senha=errada" "vazia|senha=" "de 10 mil caracteres|senha=$LONGA"; do
  s=$(req -X POST "$BASE/painel/entrar" -H "$OWN" --data "${par#*|}")
  { grep -q 'Senha incorreta' "$T/body" && ! grep -qi '^set-cookie: *sessao_painel' "$T/head"; }; confere "senha ${par%%|*}: mensagem de erro e sem cookie ($s)" $?
done
req -X POST "$BASE/painel/entrar" -H "$OWN" --data-urlencode "senha=$SENHA" >/dev/null
SC=$(grep -i '^set-cookie: *sessao_painel' "$T/head")
ok=0; for a in HttpOnly Secure SameSite=Strict Path=/painel Max-Age=43200; do echo "$SC" | grep -qi "$a" || ok=1; done
confere "atributos do cookie de sessão (HttpOnly, Secure, SameSite=Strict, Path=/painel, Max-Age=43200)" $ok

echo "== A01 CSRF"
s=$(req -X POST "$BASE/painel/entrar" -H "Origin: $EVIL" --data-urlencode "senha=$SENHA"); [ "$s" = 403 ]; confere "POST /painel/entrar com origem estranha ($s)" $?
s=$(req -X POST "$BASE/painel/$ID" -H "Origin: $EVIL" -H "Cookie: $COOKIE" -d acao=excluir)
{ [ "$s" = 403 ] && [ "$(contagem)" = "$N0" ]; }; confere "POST /painel/$ID com origem estranha: 403 e a linha continua ($s)" $?
s=$(req -X POST "$BASE/solicitar" -H "Origin: $EVIL" -d tipo=oficina); [ "$s" = 403 ]; confere "POST /solicitar com origem estranha ($s)" $?

echo "== A05 Injeção"
s=$(req -G "$BASE/painel" -H "Cookie: $COOKIE" --data-urlencode "situacao=x' OR 1=1--" --data-urlencode "tipo=1;DROP TABLE solicitacao")
{ [ "$s" = 200 ] && [ -n "$(contagem)" ]; }; confere "filtros com SQL: 200 e a tabela existe ($s)" $?
solicitar --data-urlencode "nome=SQLi" --data-urlencode "descricao='); DROP TABLE solicitacao;--" >/dev/null
IDS=$(sql "SELECT max(id) AS n FROM solicitacao WHERE nome='SQLi'")
req "$BASE/painel/$IDS" -H "Cookie: $COOKIE" >/dev/null
{ [ -n "$IDS" ] && grep -q "DROP TABLE solicitacao" "$T/body"; }; confere "descrição com SQL gravada como texto literal" $?

echo "== A05 XSS armazenado e refletido"
X='<script>alert(1)</script>"><img src=x onerror=alert(1)>'
solicitar --data-urlencode "nome=$X" --data-urlencode "descricao=$X" >/dev/null
IDX=$(sql "SELECT max(id) AS n FROM solicitacao")
for p in /painel "/painel/$IDX"; do
  req "$BASE$p" -H "Cookie: $COOKIE" >/dev/null
  { grep -q '&lt;script&gt;' "$T/body" && ! grep -q '<script>alert(1)' "$T/body" && ! grep -q '<img src=x' "$T/body"; }; confere "XSS armazenado escapado em $p" $?
done
for q in "p=<script>" "tipo=<script>"; do
  s=$(req -G "$BASE/solicitar/enviada" --data-urlencode "$q"); l=$(destino)
  { { [ "$s" = 302 ] && [[ "$l" == */solicitar ]]; } || ! grep -q '<script>' "$T/body"; }; confere "XSS refletido em /solicitar/enviada?$q ($s)" $?
done

echo "== API3 Atribuição em massa"
solicitar --data-urlencode "nome=Massa" --data-urlencode "descricao=massa" --data-urlencode "situacao=concluida" --data-urlencode "protocolo=X" --data-urlencode "id=999" >/dev/null
L=$(sql "SELECT id || '|' || situacao || '|' || protocolo AS n FROM solicitacao WHERE nome='Massa'")
{ [[ "$L" == *"|nova|GD-"* ]] && [[ "$L" != 999* ]]; }; confere "campos extras ignorados (gravada como $L)" $?

echo "== API4 Consumo de recursos"
N1=$(contagem)
GRANDE=$(head -c 100000 /dev/zero | tr '\0' x)
printf 'tipo=oficina&perfil=autonomo&nome=Grande&telefone=1&descricao=%s' "$GRANDE" > "$T/100k"
req -X POST "$BASE/solicitar" -H "$OWN" -H "Content-Type: application/x-www-form-urlencoded" --data-binary "@$T/100k" >/dev/null
[ "$(contagem)" = "$N1" ]; confere "descrição de 100 mil caracteres recusada" $?
printf 'tipo=oficina&perfil=autonomo&nome=Corpo&telefone=1&descricao=' > "$T/5mb"
head -c 5000000 /dev/zero | tr '\0' x >> "$T/5mb"
req -X POST "$BASE/solicitar" -H "$OWN" -H "Content-Type: application/x-www-form-urlencoded" --data-binary "@$T/5mb" >/dev/null
[ "$(contagem)" = "$N1" ]; confere "corpo de 5 MB recusado" $?

echo "== A02 Configuração"
req "$BASE/painel/entrar" >/dev/null
ok=0; for h in 'Cache-Control: no-store' 'X-Frame-Options: DENY' 'X-Content-Type-Options: nosniff' 'X-Robots-Tag: noindex'; do grep -qi "^$h" "$T/head" || ok=1; done
confere "cabeçalhos de /painel/entrar" $ok
req "$BASE/robots.txt" >/dev/null; grep -q 'Disallow: /painel' "$T/body"; confere "robots.txt com Disallow: /painel" $?
req "$BASE/sitemap-index.xml" >/dev/null
TODOS=$(cat "$T/body")
for u in $(grep -o 'https\?://[^<]*sitemap-[0-9]*\.xml' "$T/body" | sed -E "s#https?://[^/]*#$BASE#"); do req "$u" >/dev/null; TODOS="$TODOS $(cat "$T/body")"; done
{ echo "$TODOS" | grep -q 'loc' && ! echo "$TODOS" | grep -q '/painel'; }; confere "sitemap lido e sem URL do painel" $?

echo "== Acompanhamento e webhook do Telegram"
req -X POST "$BASE/solicitar" -H "$OWN" --data-urlencode "tipo=oficina" --data-urlencode "perfil=autonomo" --data-urlencode "telefone=(14) 99999-0000" --data-urlencode "nome=Cliente Secreto" --data-urlencode "descricao=Acompanhar" >/dev/null
PROT2=$(sql "SELECT protocolo AS n FROM solicitacao WHERE nome='Cliente Secreto' ORDER BY id DESC LIMIT 1")
s=$(req -X POST "$BASE/acompanhar" -H "$OWN" --data-urlencode "protocolo=$PROT2" --data-urlencode "telefone=14 00000-0000")
{ grep -q 'não encontrada' "$T/body" && ! grep -q 'Cliente Secreto' "$T/body"; }; confere "/acompanhar com telefone errado: não encontrada e sem nome ($s)" $?
s=$(req -X POST "$BASE/acompanhar" -H "$OWN" --data-urlencode "protocolo=$PROT2" --data-urlencode "telefone=14999990000")
{ [ -n "$PROT2" ] && grep -q "$PROT2" "$T/body" && ! grep -q 'Cliente Secreto' "$T/body" && ! grep -q '99999' "$T/body"; }; confere "/acompanhar com dados certos mostra só a situação ($s)" $?
for p in "GD-1" "x' OR 1=1--" "<script>alert(1)</script>"; do
  s=$(req -X POST "$BASE/acompanhar" -H "$OWN" --data-urlencode "protocolo=$p" --data-urlencode "telefone=1")
  { [ "$s" = 200 ] && grep -q 'não encontrada' "$T/body" && ! grep -q '<script>alert' "$T/body"; }; confere "/acompanhar com protocolo '$p': 200 genérico ($s)" $?
done
HOOK='{"message":{"text":"/start 00000000000000000000000000000000","chat":{"id":123}}}'
s=$(req -X POST "$BASE/telegram" -H "Content-Type: application/json" -d "$HOOK"); [ "$s" = 403 ]; confere "POST /telegram sem segredo ($s)" $?
s=$(req -X POST "$BASE/telegram" -H "Content-Type: application/json" -H "X-Telegram-Bot-Api-Secret-Token: errado" -d "$HOOK"); [ "$s" = 403 ]; confere "POST /telegram com segredo errado ($s)" $?
s=$(req -X POST "$BASE/telegram" -H "Content-Type: application/json" -H "X-Telegram-Bot-Api-Secret-Token: $WEBHOOK" -d "$HOOK")
{ [ "$s" = 200 ] && [ "$(contagem "WHERE telegram_chat_id IS NOT NULL")" = 0 ]; }; confere "POST /telegram com segredo certo e código inexistente: 200 sem vincular ($s)" $?
req "$BASE/robots.txt" >/dev/null; grep -q 'Disallow: /telegram' "$T/body"; confere "robots.txt com Disallow: /telegram" $?

echo "== A10 Exceções"
for c in /painel/abc /painel/99999999999999999999 /painel/99999; do
  s=$(req "$BASE$c" -H "Cookie: $COOKIE")
  { [ "$s" = 404 ] && ! grep -qiE 'stack|D1_ERROR|SQLITE|Error:' "$T/body"; }; confere "GET $c: 404 sem detalhes internos ($s)" $?
done
s=$(req -X POST "$BASE/painel/$ID" -H "$OWN" -H "Cookie: $COOKIE" -d acao=xyz -d situacao=xyz)
{ [ "$s" != 500 ] && ! grep -qiE 'stack|D1_ERROR|SQLITE|Error:' "$T/body"; }; confere "POST com acao=xyz sem erro interno ($s)" $?

echo "== A04 Segredos no repositório"
ONDE=$(git grep -l -i "gaucho2026\|PAINEL_SENHA=\|SESSAO_SEGREDO=" -- . ':!scripts' | sort | tr '\n' ' ')
[ "$ONDE" = ".dev.vars.example README.md " ]; confere "segredos só em .dev.vars.example e README.md (achados: $ONDE)" $?

echo
if [ "$FALHAS" -eq 0 ]; then echo "Tudo certo."; else echo "$FALHAS falha(s)."; fi
exit $((FALHAS > 0))
