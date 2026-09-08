#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# 《希尔达 · 黄昏的回声：归途》NAS 一键同步与部署脚本
# ==============================================================================

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC_FILE="${SCRIPT_DIR}/index.html"

LAN_HOST="192.168.2.200"
LAN_PORT="22"
WAN_HOST="hackerlife.fun"
WAN_PORT="222"
SSH_USER="root"

if [ ! -f "$SRC_FILE" ]; then
    echo -e "${RED}错误: 未找到游戏源文件: $SRC_FILE${NC}"
    exit 1
fi

if nc -z -G 2 "$LAN_HOST" "$LAN_PORT" 2>/dev/null; then
    TARGET_HOST="$LAN_HOST"
    TARGET_PORT="$LAN_PORT"
    echo -e "${GREEN}✓ 选中使用内网直连: ${TARGET_HOST}:${TARGET_PORT}${NC}"
else
    TARGET_HOST="$WAN_HOST"
    TARGET_PORT="$WAN_PORT"
    echo -e "${YELLOW}! 内网不可达，使用公网 SSH: ${TARGET_HOST}:${TARGET_PORT}${NC}"
fi

echo -e "${BLUE}==> 上传最新游戏文件到 NAS (/var/www/games/hilda & /volume1/web/games/hilda)...${NC}"
cat "$SRC_FILE" | ssh -p "$TARGET_PORT" -o StrictHostKeyChecking=no "${SSH_USER}@${TARGET_HOST}" \
    "mkdir -p /var/www/games/hilda /volume1/web/games/hilda && \
     cat > /var/www/games/hilda/index.html && \
     cp /var/www/games/hilda/index.html /volume1/web/games/hilda/index.html && \
     cp /var/www/games/hilda/index.html /var/www/games/hilda/hilda-homeward-v2.html && \
     chmod -R 755 /var/www/games /volume1/web/games/hilda"

echo -e "${GREEN}✓ 部署成功！访问地址: https://games.hackerlife.fun:8443/hilda/${NC}"
