# Stratechna Social

Postiz com a marca Stratechna.

    ghcr.io/stratechna/stratechna-social:2.23        ← o que a produção usa
    ghcr.io/stratechna/stratechna-social:2.23.0      ← versão exacta
    ghcr.io/stratechna/stratechna-social:latest      ← compatibilidade

O Postiz é AGPL-3.0, sem termos adicionais de atribuição.

## Como a marca é aplicada — e porque sobrevive às actualizações

1. **Versão fixa.** `ARG POSTIZ_VERSION` no `Dockerfile`.
2. **Só ficheiros próprios** em `branding/ficheiros/`: o CSS de cores, o JS de marca (painel
   do login, logótipos, textos), os logótipos e o favicon — os mesmos que a produção tinha
   montados por cima da imagem.
3. **O nginx.conf do Postiz não é substituído.** O `aplicar.py` acrescenta-lhe a injecção do
   CSS e do JS e o `X-Forwarded-Proto https` (o TLS termina no Traefik). Ficam as protecções
   originais de `/uploads/`, que a cópia antiga tinha perdido.
4. **O nome troca-se por padrão, com mínimo**, nos textos compilados do Next — só como palavra
   inteira, porque há identificadores de código com «Postiz» (ex. `MyPostizAgent`). Se um
   padrão deixar de existir, **o build falha**.
5. **Teste antes de publicar.** `branding/verificar.sh` arranca a imagem com PostgreSQL, Redis
   e Temporal com Elasticsearch (como a produção — sem Elasticsearch o Temporal recusa os
   atributos de pesquisa do Postiz e o backend não arranca) e verifica o login, os bundles
   servidos, os ficheiros próprios, as protecções e a API (`/api/user/self` responde 401).

O `stratechna-branding.js` actua no browser por selectores. É o elo mais frágil: numa
actualização do Postiz, confirmar no browser o login e a barra lateral.

## Na produção (CCX13)

`/opt/stratechna/postiz/docker-compose.yml`: imagem `stratechna-social:2.23`, sem ficheiros
de marca montados, Traefik na porta 5000 do contentor, e o volume de uploads montado em
`/app/uploads` e em `/uploads` (o primeiro é o que o `.env` usa; o segundo é o que o nginx do
Postiz serve).
