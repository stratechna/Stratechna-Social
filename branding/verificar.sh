#!/bin/bash
# Teste depois do build: arranca a imagem (com PostgreSQL e Redis) e falha se o nome
# do upstream estiver visível ou se faltar alguma peça da marca.
# Uso: branding/verificar.sh <imagem>     (corre no workflow antes de publicar)
set -uo pipefail
IMG=${1:?uso: verificar.sh <imagem>}
DIR=$(cd "$(dirname "$0")" && pwd)
ID=verif-social-$$
PORTA=${PORTA:-18300}
B=http://127.0.0.1:$PORTA
S=$(head -c 24 /dev/urandom | od -An -tx1 | tr -d ' \n')
FALHAS=0
falha() { FALHAS=$((FALHAS + 1)); echo "  FALHA: $1"; }
ok() { echo "  ok: $1"; }
limpar() { docker rm -f $ID-app $ID-db $ID-redis >/dev/null 2>&1; docker network rm $ID >/dev/null 2>&1; }
trap limpar EXIT
# «Postiz» como palavra inteira (MyPostizAgent é um identificador de código, não conta)
conta_nome() { python3 -c 'import re,sys; print(len(re.findall(r"(?<![A-Za-z0-9_$])Postiz(?![A-Za-z0-9_$])", sys.stdin.read())))'; }

docker network create $ID >/dev/null
docker run -d --name $ID-db --network $ID -e POSTGRES_DB=postiz -e POSTGRES_USER=postiz \
  -e POSTGRES_PASSWORD="$S" postgres:16-alpine >/dev/null
docker run -d --name $ID-redis --network $ID redis:7-alpine >/dev/null
sleep 5
docker run -d --name $ID-app --network $ID -p 127.0.0.1:$PORTA:5000 \
  -e DATABASE_URL="postgresql://postiz:$S@$ID-db:5432/postiz" -e REDIS_URL="redis://$ID-redis:6379" \
  -e JWT_SECRET="$S" -e MAIN_URL=$B -e FRONTEND_URL=$B -e NEXT_PUBLIC_BACKEND_URL=$B/api \
  -e BACKEND_INTERNAL_URL=http://localhost:3000 -e IS_GENERAL=true -e DISABLE_REGISTRATION=true \
  -e STORAGE_PROVIDER=local -e UPLOAD_DIRECTORY=/uploads -e NEXT_PUBLIC_UPLOAD_DIRECTORY=/uploads \
  -e TEMPORAL_ADDRESS=localhost:7233 \
  "$IMG" >/dev/null

# O Postiz arranca por fases (prisma, depois vários processos pm2); sem Temporal no
# teste, parte do backend reinicia em ciclo. Espera-se por 3 respostas seguidas e
# cada pedido tenta de novo em caso de erro.
echo "== à espera do arranque =="
SEGUIDAS=0
for i in $(seq 1 150); do
  if [ "$(curl -s -o /dev/null -w '%{http_code}' "$B/auth/login")" = 200 ]; then SEGUIDAS=$((SEGUIDAS + 1)); else SEGUIDAS=0; fi
  [ $SEGUIDAS -ge 3 ] && break
  if [ "$i" = 150 ]; then docker logs --tail 30 $ID-app; echo "FALHA: não estabilizou"; exit 1; fi
  sleep 5
done
ok "arrancou e estabilizou"
obter() { curl -fsS --retry 5 --retry-delay 3 --retry-all-errors "$@"; }

echo "== página de login =="
for L in pt en; do
  H=$(obter -H "Accept-Language: $L" -b "i18next=$L" "$B/auth/login")
  T=$(printf '%s' "$H" | tr '\n' ' ' | sed -nE 's/.*<title[^>]*>[[:space:]]*([^<]*[^[:space:]<])[[:space:]]*<\/title>.*/\1/p' | head -1)
  [[ "$T" == *"Stratechna Social"* ]] && ok "título [$L] «$T»" || falha "título [$L] «$T»"
  N=$(printf '%s' "$H" | conta_nome)
  [ "$N" = 0 ] && ok "HTML sem «Postiz» [$L]" || falha "HTML com $N «Postiz» [$L]: $(printf '%s' "$H" | grep -oE '.{0,30}Postiz.{0,20}' | grep -v MyPostizAgent | head -2)"
  printf '%s' "$H" | grep -q '/stratechna-branding.js' && ok "JS de marca injectado [$L]" || falha "JS de marca não injectado [$L]"
  printf '%s' "$H" | grep -q '/stratechna.css' && ok "CSS de marca injectado [$L]" || falha "CSS de marca não injectado [$L]"
done

echo "== bundles servidos ao browser =="
H=$(obter "$B/auth/login")
T=0; C=0
for u in $(printf '%s' "$H" | grep -oE 'src="/_next/static/[^"]+\.js"' | sed -E 's/^src="//;s/"$//' | sort -u); do
  n=$(obter "$B$u" | conta_nome); T=$((T + n)); C=$((C + 1))
done
[ "$C" -gt 0 ] && [ "$T" = 0 ] && ok "$C bundles sem «Postiz»" || falha "$T «Postiz» em $C bundles"
N=$(docker exec $ID-app sh -c 'grep -rl MyPostizAgent /app/apps/frontend/.next | wc -l')
[ "$N" -gt 0 ] && ok "identificador MyPostizAgent intacto ($N ficheiros)" || falha "MyPostizAgent desapareceu"

echo "== ficheiros próprios e protecções =="
for f in stratechna-branding.js stratechna.css stratechna-logo.png stratechna-icon.png; do
  curl -s --retry 5 --retry-delay 3 --retry-all-errors -o /tmp/$ID-f -w '%{http_code} %{content_type} %{size_download}' "$B/$f" > /tmp/$ID-h
  if [ "$(sha256sum < /tmp/$ID-f | cut -c1-16)" = "$(sha256sum < "$DIR/ficheiros/$f" | cut -c1-16)" ]; then ok "/$f"
  else falha "/$f não é o nosso (recebido: $(cat /tmp/$ID-h); nosso: $(wc -c < "$DIR/ficheiros/$f") bytes)"; fi
done
rm -f /tmp/$ID-f /tmp/$ID-h
[ "$(obter "$B/favicon.ico" | sha256sum | cut -c1-16)" = "$(sha256sum < "$DIR/ficheiros/favicon.png" | cut -c1-16)" ] && ok "favicon é o nosso" || falha "favicon não é o nosso"
docker exec $ID-app sh -c 'mkdir -p /uploads/verif && cp /app/apps/frontend/public/stratechna-icon.png /uploads/verif/t.png'
U=$(curl -sI "$B/uploads/verif/t.png")
printf '%s' "$U" | grep -qi "content-security-policy:.*sandbox" && printf '%s' "$U" | grep -qi "x-content-type-options: nosniff" \
  && ok "/uploads/ com CSP em sandbox e nosniff" || falha "/uploads/ sem as protecções: $(printf '%s' "$U" | head -1)"
docker exec $ID-app grep -q "X-Forwarded-Proto https" /etc/nginx/nginx.conf && ok "nginx: X-Forwarded-Proto https" || falha "nginx sem X-Forwarded-Proto https"

echo
if [ $FALHAS -gt 0 ]; then
  echo "-- estado dos processos no contentor:"; docker exec $ID-app sh -c 'pm2 ls 2>/dev/null || ps' | tail -15
  echo "VERIFICAÇÃO FALHOU ($FALHAS) — a imagem não deve ser publicada"
  exit 1
fi
echo "VERIFICAÇÃO OK — marca Stratechna Social, sem o nome do upstream"
