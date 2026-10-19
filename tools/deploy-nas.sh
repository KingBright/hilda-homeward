#!/usr/bin/env bash
# Publish only the tested single-file game. Keep host verification and per-file backups.
set -euo pipefail
cd "$(dirname "$0")/.."
VERSION=$(node -p "require('./package.json').version")
HASH=$(shasum -a 256 index.html | awk '{print $1}')
STAMP="${VERSION}-$(date -u +%Y%m%dT%H%M%SZ)-${HASH:0:8}"
OUT="previews/v${VERSION%.*}"
mkdir -p "$OUT"
# Refuse stale, failed or missing browser evidence before changing the NAS.
node - "$HASH" <<'JS'
const fs=require('fs'),hash=process.argv[2],manifest=JSON.parse(fs.readFileSync('build-manifest.json','utf8'));
if(manifest.sha256!==hash)throw Error('The build manifest does not match index.html');
const reports=['test-report.json','acting-report.json','art-audio-report.json','native-storage-report.json','phaser-contraptions-report.json','previews/v3.5/body-report.json','previews/v3.6/life-report.json','previews/v3.7/presentation-report.json','previews/v3.8/ipad-motion-report.json','previews/v3.9/scene-continuity-report.json'];
for(const p of reports){const r=JSON.parse(fs.readFileSync(p,'utf8'));if(!r.passed||r.artifact_sha256!==hash)throw Error('Missing, failed or stale evidence: '+p);}
console.log('Verified current-build browser evidence:',reports.length);
JS
if ssh -p 22 -o BatchMode=yes -o ConnectTimeout=2 root@192.168.2.200 true 2>/dev/null; then HOST=192.168.2.200; PORT=22; else HOST=hackerlife.fun; PORT=222; fi
SSH=(ssh -p "$PORT" -o BatchMode=yes -o StrictHostKeyChecking=yes -o ConnectTimeout=10 "root@$HOST")
TMP="/var/www/games/hilda/.upload-${STAMP}.html"
"${SSH[@]}" "umask 022; mkdir -p /var/www/games/hilda; cat > '$TMP'" < index.html
"${SSH[@]}" sh -s -- "$STAMP" "$HASH" "$TMP" <<'REMOTE'
set -eu
stamp=$1; expected=$2; upload=$3
actual=$(sha256sum "$upload" | awk '{print $1}')
[ "$actual" = "$expected" ] || { echo 'Upload checksum mismatch; live game unchanged' >&2; exit 1; }
# Stage and back up every destination before replacing any live file.
for dir in /var/www/games/hilda /volume1/web/games/hilda; do
  mkdir -p "$dir/.backups/$stamp"
  for name in index.html hilda-homeward-v2.html; do
    if [ -f "$dir/$name" ]; then cp -p "$dir/$name" "$dir/.backups/$stamp/$name"; else touch "$dir/.backups/$stamp/$name.absent"; fi
    cp "$upload" "$dir/.$name.$stamp.tmp"
    chmod 644 "$dir/.$name.$stamp.tmp"
    [ "$(sha256sum "$dir/.$name.$stamp.tmp" | awk '{print $1}')" = "$expected" ]
  done
done
# Each rename is atomic. Backups support rollback if an I/O failure interrupts the pair.
for dir in /var/www/games/hilda /volume1/web/games/hilda; do
  for name in index.html hilda-homeward-v2.html; do
    mv -f "$dir/.$name.$stamp.tmp" "$dir/$name"
    sha256sum "$dir/$name"
  done
  printf 'BACKUP %s/.backups/%s\n' "$dir" "$stamp"
done
rm -f "$upload"
REMOTE
URL="https://games.hackerlife.fun:8443/hilda/?v=$VERSION&build=${HASH:0:12}"
curl --fail --location --connect-timeout 10 --max-time 40 --silent --show-error "$URL" -o "$OUT/nas-served.html"
SERVED=$(shasum -a 256 "$OUT/nas-served.html" | awk '{print $1}')
[ "$SERVED" = "$HASH" ] || { echo 'NAS files updated, but public response differs; do not claim verified deployment' >&2; exit 1; }
node - "$VERSION" "$HASH" "$STAMP" "$HOST" "$URL" "$OUT" <<'JS'
const fs=require('fs');const [version,sha256,backup,host,url,out]=process.argv.slice(2);
fs.writeFileSync(out+'/nas-deployment.json',JSON.stringify({version,sha256,backup,host,url,publicHashMatches:true,verifiedAt:new Date().toISOString()},null,2)+'\n');
console.log('NAS public response verified:',version,sha256,url);
JS
