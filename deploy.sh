#!/usr/bin/env bash
set -euo pipefail
# The checked publisher replaces the old in-place writes and recursive chmod.
exec bash "$(dirname "$0")/tools/deploy-nas.sh" "$@"
