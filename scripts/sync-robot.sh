#!/usr/bin/env bash
set -euo pipefail

WS="${1:-$HOME/Documents/rosmaster_ws}"
SITE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$SITE_ROOT/public/models/rosmaster"
DESC_SRC="$WS/src/yahboom_rosmaster/yahboom_rosmaster_description"
TMP_URDF="$(mktemp /tmp/rosmaster_x3.XXXXXX.urdf)"

if [ ! -d "$DESC_SRC" ]; then
  echo "ERROR: no se encontro yahboom_rosmaster_description en $DESC_SRC" >&2
  echo "Uso: ./scripts/sync-robot.sh [ruta/al/rosmaster_ws]" >&2
  exit 1
fi

set +u
source /opt/ros/humble/setup.bash
if [ -f "$WS/install/setup.bash" ]; then
  source "$WS/install/setup.bash"
fi
set -u

xacro "$DESC_SRC/urdf/robots/rosmaster_x3.urdf.xacro" > "$TMP_URDF"

sed -i \
  -e 's#file://[^"]*share/yahboom_rosmaster_description/##g' \
  -e 's#package://yahboom_rosmaster_description/##g' \
  "$TMP_URDF"

mkdir -p "$OUT"
mv "$TMP_URDF" "$OUT/rosmaster_x3.urdf"
rm -rf "$OUT/meshes"
cp -r "$DESC_SRC/meshes" "$OUT/meshes"

echo "Sincronizado:"
echo "  $OUT/rosmaster_x3.urdf ($(du -h "$OUT/rosmaster_x3.urdf" | cut -f1))"
echo "  $OUT/meshes ($(du -sh "$OUT/meshes" | cut -f1))"
