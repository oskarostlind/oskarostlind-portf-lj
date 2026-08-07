#!/usr/bin/env bash
# node_modules kan inte ligga i den molnmonterade projektmappen (inga symlänkar,
# långsam I/O), så bygget körs i en spegel utanför mappen. Källkoden i
# projektmappen är sanningen.
#
# Byggmappen väljs i denna ordning:
#   1. $BUILD_DIR om den är satt
#   2. /tmp/site om den går att skriva till
#   3. $HOME/.oskarostlind-build
# Sandlådor kan byta uid mellan sessioner, vilket gör en gammal /tmp/site
# oåtkomlig. Därför faller skriptet tillbaka i stället för att krascha.
set -euo pipefail
SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

pick_dest() {
  if [ -n "${BUILD_DIR:-}" ]; then echo "$BUILD_DIR"; return; fi
  if mkdir -p /tmp/site 2>/dev/null && [ -w /tmp/site ]; then echo /tmp/site; return; fi
  echo "$HOME/.oskarostlind-build"
}

DEST="$(pick_dest)"
LOGDIR="$DEST/.logs"
mkdir -p "$DEST" "$LOGDIR"
echo "Bygger i $DEST"

if [ ! -x "$DEST/node_modules/.bin/next" ]; then
  echo "Installerar beroenden (npm ci) — logg: $LOGDIR/npm-ci.log"
  cp "$SRC/package.json" "$SRC/package-lock.json" "$DEST/"
  ( cd "$DEST" && npm ci --no-audit --no-fund ) > "$LOGDIR/npm-ci.log" 2>&1
fi

rsync -a --delete \
  --exclude node_modules --exclude .next --exclude .git --exclude docs --exclude .logs \
  "$SRC/" "$DEST/"

cd "$DEST"
npm run build
