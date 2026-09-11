#!/usr/bin/env python3
"""Aplica a marca Stratechna ao Postiz, durante o build da imagem.

Regras (ver README):
- Nunca substitui por inteiro um ficheiro de código ou configuração do upstream:
  troca texto por padrão. Excepção: imagens (favicons), que são nossas.
- Cada troca declara quantas ocorrências espera no mínimo. Se o upstream mudar e
  um padrão desaparecer, o build FALHA em vez de publicar uma imagem sem marca.
- O nome «Postiz» só se troca como palavra inteira: há identificadores de código que
  o contêm (ex. MyPostizAgent) e que não podem mudar.
"""
import pathlib
import re
import shutil
import sys

APP = pathlib.Path("/app")
NEXT = APP / "apps/frontend/.next"
PUBLIC = APP / "apps/frontend/public"
NGINX = pathlib.Path("/etc/nginx/nginx.conf")
PROPRIOS = pathlib.Path("/tmp/branding/ficheiros")
MARCA = "Stratechna Social"
NOME = re.compile(r"(?<![A-Za-z0-9_$])Postiz(?![A-Za-z0-9_$])")

erros = []


def trocar(f, padrao, novo, minimo=1, regex=False):
    f = pathlib.Path(f)
    t = f.read_text(encoding="utf-8")
    if regex:
        t2, n = re.subn(padrao, lambda _m: novo, t)
    else:
        n, t2 = t.count(padrao), t.replace(padrao, novo)
    if n < minimo:
        erros.append(f"{f}: «{str(padrao)[:70]}» aparece {n}x, esperado >= {minimo}")
        return 0
    if n:
        f.write_text(t2, encoding="utf-8")
    return n


# ── 1. Ficheiros próprios, servidos pelo Next a partir de public/ ──────────
for f in PROPRIOS.iterdir():
    shutil.copy(f, PUBLIC / f.name)
# favicons do upstream passam a ser o nosso (imagens)
for nome in ("favicon.ico", "favicon.png", "postiz-fav.png"):
    shutil.copy(PROPRIOS / "favicon.png", PUBLIC / nome)

# ── 2. nginx.conf do upstream: acrescentar a injecção da marca ─────────────
# A página vem do Next sem compressão (Accept-Encoding vazio) para o sub_filter
# poder inserir o CSS e o JS de marca; o resto do ficheiro original fica igual,
# incluindo as protecções de /uploads/ e os cabeçalhos que o Postiz usa.
INJ = (
    "location / {\n"
    "            # Stratechna: CSS e JS de marca injectados em todas as páginas\n"
    "            proxy_set_header Accept-Encoding \"\";\n"
    "            sub_filter \"</body>\" \"<link rel=\\\"stylesheet\\\" href=\\\"/stratechna.css\\\">"
    "<script src=\\\"/stratechna-branding.js\\\"></script></body>\";\n"
    "            sub_filter_once off;\n"
)
trocar(NGINX, "location / {\n", INJ, minimo=1)
# O TLS termina no Traefik: o Postiz tem de saber que o pedido original é https
trocar(NGINX, "proxy_set_header X-Forwarded-Proto $scheme;", "proxy_set_header X-Forwarded-Proto https;", minimo=2)

# ── 3. O nome nos textos compilados (traduções, títulos) ───────────────────
alvos = [p for p in NEXT.rglob("*.js") if p.is_file()]
n_nome = 0
for f in alvos:
    t = f.read_text(encoding="utf-8", errors="surrogateescape")
    t2, n = NOME.subn(MARCA, t)
    if n:
        f.write_text(t2, encoding="utf-8", errors="surrogateescape")
        n_nome += n
if n_nome < 500:
    erros.append(f"nome: só {n_nome} trocas — estrutura das traduções mudou?")

# ── 4. Verificação final ────────────────────────────────────────────────────
sobras = [str(f) for f in alvos if NOME.search(f.read_text(encoding="utf-8", errors="surrogateescape"))]
if sobras:
    erros.append(f"nome do upstream ainda presente em {len(sobras)} ficheiros: {sobras[:3]}")
ident = sum(f.read_text(encoding="utf-8", errors="surrogateescape").count("MyPostizAgent") for f in alvos)
if ident == 0:
    erros.append("MyPostizAgent desapareceu — a troca apanhou um identificador?")

if erros:
    print("BRANDING FALHOU — o upstream mudou e estas trocas já não encaixam:", file=sys.stderr)
    for e in erros:
        print("  - " + e, file=sys.stderr)
    sys.exit(1)
print(f"branding: {n_nome} trocas do nome em {len(alvos)} ficheiros, identificadores intactos ({ident}), "
      f"nginx com injecção da marca, {len(list(PROPRIOS.iterdir()))} ficheiros próprios")
