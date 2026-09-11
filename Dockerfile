# Stratechna Social — Postiz com a marca Stratechna.
#
# A versão do Postiz está FIXA. Actualizar é mudar esta linha, de propósito:
# o aplicar.py falha o build se alguma troca deixar de encaixar, e o verificar.sh
# (no workflow) falha se o nome do upstream ficar visível.
ARG POSTIZ_VERSION=v2.21.6
FROM ghcr.io/gitroomhq/postiz-app:${POSTIZ_VERSION}
ARG POSTIZ_VERSION

LABEL org.opencontainers.image.source="https://github.com/stratechna/Stratechna-Social" \
      org.opencontainers.image.title="Stratechna Social" \
      org.opencontainers.image.vendor="Stratechna" \
      org.opencontainers.image.version="${POSTIZ_VERSION}" \
      org.opencontainers.image.base.name="ghcr.io/gitroomhq/postiz-app:${POSTIZ_VERSION}"

# Ficheiros próprios (CSS, JS de marca, logótipos, favicon) e trocas por padrão
COPY branding/ficheiros/ /tmp/branding/ficheiros/
COPY branding/aplicar.py /tmp/branding/aplicar.py
RUN python3 /tmp/branding/aplicar.py && rm -rf /tmp/branding
